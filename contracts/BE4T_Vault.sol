// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract BE4T_Vault is ERC1155, AccessControl, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    IERC20 public immutable paymentToken;

    struct SongInfo {
        uint256 maxSupply;
        uint256 currentSupply;
        uint256 pricePerToken; // In payment token (Test-USDC, usually 6 decimals)
        string customUri;
    }

    mapping(uint256 => SongInfo) public songAssets;
    
    // KYC mapping
    mapping(address => bool) public isKYCVerified;

    // Royalties management
    mapping(uint256 => uint256) public totalReleasedPerToken; // Total USDC released per 1 fraction of token ID
    mapping(uint256 => mapping(address => uint256)) public claimedRoyalties; // user -> id -> amount claimed

    // Events
    event SongAssetCreated(uint256 indexed id, uint256 maxSupply, uint256 price, string customUri);
    event KYCStatusChanged(address indexed account, bool status);
    event Investment(address indexed investor, uint256 indexed id, uint256 quantity, uint256 amountPaid);
    event RoyaltiesDistributed(uint256 indexed id, uint256 amount);
    event RoyaltiesClaimed(address indexed investor, uint256 indexed id, uint256 amount);

    constructor(address _paymentToken) ERC1155("") {
        require(_paymentToken != address(0), "Invalid token address");
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        paymentToken = IERC20(_paymentToken);
    }

    // ── KYC Management ──

    function manualVerify(address user) external onlyRole(DEFAULT_ADMIN_ROLE) {
        isKYCVerified[user] = true;
        emit KYCStatusChanged(user, true);
    }

    function setKYCStatus(address user, bool status) external onlyRole(DEFAULT_ADMIN_ROLE) {
        isKYCVerified[user] = status;
        emit KYCStatusChanged(user, status);
    }

    // ── Asset Creation ──

    function createSongAsset(uint256 id, uint256 _maxSupply, uint256 _pricePerToken, string memory _customUri) external onlyRole(MINTER_ROLE) {
        require(songAssets[id].maxSupply == 0, "Asset already exists");
        require(_maxSupply > 0, "Invalid max supply");
        require(bytes(_customUri).length > 0, "URI cannot be empty");

        songAssets[id] = SongInfo({
            maxSupply: _maxSupply,
            currentSupply: 0,
            pricePerToken: _pricePerToken,
            customUri: _customUri
        });

        emit SongAssetCreated(id, _maxSupply, _pricePerToken, _customUri);
    }

    // ── Investment (Primary Market) ──

    function invest(uint256 id, uint256 quantity) external whenNotPaused {
        require(isKYCVerified[msg.sender], "KYC required for investment");
        SongInfo storage song = songAssets[id];
        require(song.maxSupply > 0, "Asset does not exist");
        require(song.currentSupply + quantity <= song.maxSupply, "Exceeds max supply");
        require(quantity > 0, "Quantity must be > 0");

        uint256 cost = song.pricePerToken * quantity;

        // Take USDC from user (requires previous Approval from frontend)
        paymentToken.safeTransferFrom(msg.sender, address(this), cost);

        // Update state and mint
        song.currentSupply += quantity;
        _mint(msg.sender, id, quantity, "");

        emit Investment(msg.sender, id, quantity, cost);
    }

    // ── Royalties (Pull System) ──

    /**
     * @dev Called by Label to deposit a lump sum of USDC for a specific song ID.
     */
    function distributeRoyalties(uint256 id, uint256 totalAmount) external onlyRole(MINTER_ROLE) {
        SongInfo memory song = songAssets[id];
        require(song.maxSupply > 0, "Asset does not exist");
        require(song.currentSupply > 0, "No tokens circulating");
        
        // Deposit USDC
        paymentToken.safeTransferFrom(msg.sender, address(this), totalAmount);

        // Increase the global ratio of released funds per 1 token
        // Use a multiplier (1e18) to avoid precision loss just in case 
        uint256 amountPerToken = (totalAmount * 1e18) / song.currentSupply;
        totalReleasedPerToken[id] += amountPerToken;

        emit RoyaltiesDistributed(id, totalAmount);
    }

    /**
     * @dev Called by holders to claim their share of royalties.
     */
    function claimRoyalties(uint256 id) external whenNotPaused {
        uint256 balance = balanceOf(msg.sender, id);
        require(balance > 0, "No tokens owned");

        uint256 totalOwed = (balance * totalReleasedPerToken[id]) / 1e18;
        uint256 alreadyClaimed = claimedRoyalties[id][msg.sender];
        uint256 pending = totalOwed - alreadyClaimed;

        require(pending > 0, "No royalties pending");

        claimedRoyalties[id][msg.sender] += pending;
        paymentToken.safeTransfer(msg.sender, pending);

        emit RoyaltiesClaimed(msg.sender, id, pending);
    }

    // ── Metadata & Hooks ──

    function uri(uint256 id) public view virtual override returns (string memory) {
        string memory customUri = songAssets[id].customUri;
        if (bytes(customUri).length > 0) {
            return customUri;
        }
        return super.uri(id);
    }

    /**
     * @dev Overriding _update instead of _beforeTokenTransfer for OpenZeppelin v5 
     * Applies to transfers, minting, and burning
     */
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values) internal virtual override {
        if (from != address(0) && to != address(0)) {
            // Secondary transfer: receiver must be KYC verified
            require(isKYCVerified[to], "Receiver is not KYC verified");
        }
        super._update(from, to, ids, values);
    }

    // ── Emergency Pausing ──
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }
    
    // ── Interface Support ──
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    // Allow contract to receive ETH just in case
    receive() external payable {}
}
