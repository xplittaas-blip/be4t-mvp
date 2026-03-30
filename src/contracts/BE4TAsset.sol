// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title BE4TAsset
 * @dev Multi-Token Standard (ERC-1155) for fractionalized BE4T Assets (Music & RWA).
 * Each unique `tokenId` represents a distinct real-world asset mapped directly from Supabase.
 */
contract BE4TAsset is ERC1155, Ownable {
    using Strings for uint256;

    // Base URL pointing to the off-chain JSON metadata (e.g. Supabase Storage / IPFS)
    string private _baseTokenURI;

    // Tracks total fractional supply per asset ID
    mapping(uint256 => uint256) public totalSupply;

    // Emitted when a new asset successfully enters the blockchain
    event AssetTokenized(uint256 indexed tokenId, uint256 supply, string metadataURI);

    /**
     * @dev Initialize contract with a placeholder metadata API.
     */
    constructor(string memory initialBaseURI) ERC1155(initialBaseURI) Ownable(msg.sender) {
        _baseTokenURI = initialBaseURI;
    }

    /**
     * @dev Mints the entire fraction supply of a new asset. Restricted to BE4T Platform (Admin).
     * @param account The address receiving the initial fractions (Usually the Issuer or Treasury).
     * @param id The unique integer ID bridging the Supabase row to the Blockchain.
     * @param amount Total supply of fractions to emit (e.g. 1000, 2500 tokens).
     * @param data Additional bytes payload (optional).
     */
    function mintAsset(address account, uint256 id, uint256 amount, bytes memory data) public onlyOwner {
        require(totalSupply[id] == 0, "Activo ya tokenizado (Asset already exists)");
        
        _mint(account, id, amount, data);
        totalSupply[id] = amount;

        emit AssetTokenized(id, amount, uri(id));
    }

    /**
     * @dev Allows the platform to update the metadata hosting domain in the future.
     */
    function setBaseURI(string memory newuri) public onlyOwner {
        _baseTokenURI = newuri;
        _setURI(newuri);
    }

    /**
     * @dev Overridden function to return dynamic URIs linking to specific asset metadata.
     * Example: https://api.be4t.app/metadata/14.json
     */
    function uri(uint256 _id) public view override returns (string memory) {
        return string(abi.encodePacked(_baseTokenURI, _id.toString(), ".json"));
    }
}
