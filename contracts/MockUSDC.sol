// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockUSDC is ERC20, Ownable {
    constructor() ERC20("Mock USDC", "mUSDC") Ownable(msg.sender) {
        // Mint 100 million mUSDC to deployer
        _mint(msg.sender, 100_000_000 * 10 ** decimals());
    }

    /**
     * @dev Faucet function for the admin to fund demo users
     */
    function faucet(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    // Test USDC is 6 decimals like real USDC
    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}
