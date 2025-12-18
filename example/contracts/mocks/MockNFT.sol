// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockNFT
 * @dev Simple ERC721 for testing auction functionality
 */
contract MockNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("Mock NFT", "MNFT") Ownable(msg.sender) {}

    /**
     * @dev Mint a single NFT to an address
     */
    function mint(address to) external returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        return tokenId;
    }

    /**
     * @dev Batch mint multiple NFTs - demonstrates gas optimization
     */
    function batchMint(address to, uint256 amount) external returns (uint256[] memory) {
        uint256[] memory tokenIds = new uint256[](amount);
        
        for (uint256 i = 0; i < amount; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(to, tokenId);
            tokenIds[i] = tokenId;
        }
        
        return tokenIds;
    }

    /**
     * @dev Get the next token ID that will be minted
     */
    function nextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }
}
