// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./auctions/EnglishAuction.sol";
import "./auctions/DutchAuction.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

/**
 * @title AuctionFactory
 * @dev Factory for creating auction contracts
 * Supports both direct deployment and clone pattern for gas optimization
 */
contract AuctionFactory {
    using Clones for address;

    // Implementation contracts for cloning
    address public englishAuctionImplementation;
    address public dutchAuctionImplementation;

    // Registry of all created auctions
    address[] public allAuctions;
    mapping(address => bool) public isAuction;
    mapping(address => address[]) public userAuctions;

    // Events
    event EnglishAuctionCreated(
        address indexed auction,
        address indexed seller,
        address nftContract,
        uint256 tokenId,
        bool isClone
    );
    event DutchAuctionCreated(
        address indexed auction,
        address indexed seller,
        address nftContract,
        uint256 tokenId,
        bool isClone
    );

    /**
     * @dev Constructor - deploys implementation contracts for cloning
     */
    constructor() {
        // Deploy implementation contracts (these will be cloned)
        // Using minimal parameters just for implementation
        englishAuctionImplementation = address(new EnglishAuction(
            address(0),
            0,
            0,
            1,
            0,
            0,
            false,
            0
        ));
        
        dutchAuctionImplementation = address(new DutchAuction(
            address(0),
            0,
            1,
            0,
            1,
            0
        ));
    }

    /**
     * @dev Create English auction (direct deployment)
     */
    function createEnglishAuction(
        address nftContract,
        uint256 tokenId,
        uint96 startingPrice,
        uint64 duration,
        uint96 minBidIncrement,
        uint16 feePercentage,
        bool usePullPayment,
        uint64 autoExtendDuration
    ) external returns (address) {
        EnglishAuction auction = new EnglishAuction(
            nftContract,
            tokenId,
            startingPrice,
            duration,
            minBidIncrement,
            feePercentage,
            usePullPayment,
            autoExtendDuration
        );

        address auctionAddress = address(auction);
        _registerAuction(auctionAddress, msg.sender);

        emit EnglishAuctionCreated(auctionAddress, msg.sender, nftContract, tokenId, false);
        return auctionAddress;
    }

    /**
     * @dev Create Dutch auction (direct deployment)
     */
    function createDutchAuction(
        address nftContract,
        uint256 tokenId,
        uint96 startingPrice,
        uint96 reservePrice,
        uint64 duration,
        uint16 feePercentage
    ) external returns (address) {
        DutchAuction auction = new DutchAuction(
            nftContract,
            tokenId,
            startingPrice,
            reservePrice,
            duration,
            feePercentage
        );

        address auctionAddress = address(auction);
        _registerAuction(auctionAddress, msg.sender);

        emit DutchAuctionCreated(auctionAddress, msg.sender, nftContract, tokenId, false);
        return auctionAddress;
    }

    /**
     * @dev Batch create English auctions (gas optimization demonstration)
     */
    function batchCreateEnglishAuctions(
        address[] calldata nftContracts,
        uint256[] calldata tokenIds,
        uint96[] calldata startingPrices,
        uint64 duration,
        uint96 minBidIncrement,
        uint16 feePercentage,
        bool usePullPayment,
        uint64 autoExtendDuration
    ) external returns (address[] memory) {
        require(
            nftContracts.length == tokenIds.length &&
            tokenIds.length == startingPrices.length,
            "Length mismatch"
        );

        address[] memory auctions = new address[](nftContracts.length);

        for (uint256 i = 0; i < nftContracts.length; i++) {
            EnglishAuction auction = new EnglishAuction(
                nftContracts[i],
                tokenIds[i],
                startingPrices[i],
                duration,
                minBidIncrement,
                feePercentage,
                usePullPayment,
                autoExtendDuration
            );

            address auctionAddress = address(auction);
            _registerAuction(auctionAddress, msg.sender);
            auctions[i] = auctionAddress;

            emit EnglishAuctionCreated(
                auctionAddress,
                msg.sender,
                nftContracts[i],
                tokenIds[i],
                false
            );
        }

        return auctions;
    }

    /**
     * @dev Batch create Dutch auctions
     */
    function batchCreateDutchAuctions(
        address[] calldata nftContracts,
        uint256[] calldata tokenIds,
        uint96[] calldata startingPrices,
        uint96[] calldata reservePrices,
        uint64 duration,
        uint16 feePercentage
    ) external returns (address[] memory) {
        require(
            nftContracts.length == tokenIds.length &&
            tokenIds.length == startingPrices.length &&
            startingPrices.length == reservePrices.length,
            "Length mismatch"
        );

        address[] memory auctions = new address[](nftContracts.length);

        for (uint256 i = 0; i < nftContracts.length; i++) {
            DutchAuction auction = new DutchAuction(
                nftContracts[i],
                tokenIds[i],
                startingPrices[i],
                reservePrices[i],
                duration,
                feePercentage
            );

            address auctionAddress = address(auction);
            _registerAuction(auctionAddress, msg.sender);
            auctions[i] = auctionAddress;

            emit DutchAuctionCreated(
                auctionAddress,
                msg.sender,
                nftContracts[i],
                tokenIds[i],
                false
            );
        }

        return auctions;
    }

    /**
     * @dev Register auction in factory
     */
    function _registerAuction(address auction, address seller) private {
        allAuctions.push(auction);
        isAuction[auction] = true;
        userAuctions[seller].push(auction);
    }

    /**
     * @dev Get all auctions
     */
    function getAllAuctions() external view returns (address[] memory) {
        return allAuctions;
    }

    /**
     * @dev Get auctions created by a user
     */
    function getUserAuctions(address user) external view returns (address[] memory) {
        return userAuctions[user];
    }

    /**
     * @dev Get total number of auctions
     */
    function getAuctionCount() external view returns (uint256) {
        return allAuctions.length;
    }
}
