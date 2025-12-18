// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AuctionBase
 * @dev Abstract base contract for auction implementations
 * Provides common functionality: pausability, reentrancy protection, fee system, and pull payments
 */
abstract contract AuctionBase is ReentrancyGuard, Pausable {
    // Storage optimization: pack variables into single slots where possible
    struct AuctionData {
        address seller; // 20 bytes
        uint96 startingPrice; // 12 bytes - fits in same slot as seller
        address highestBidder; // 20 bytes
        uint96 highestBid; // 12 bytes - fits in same slot as highestBidder
        uint64 startTime; // 8 bytes
        uint64 endTime; // 8 bytes
        uint16 feePercentage; // 2 bytes (basis points, e.g., 250 = 2.5%)
        bool settled; // 1 byte
        bool usePullPayment; // 1 byte - fits in same slot
    }

    AuctionData public auctionData;
    IERC721 public nftContract;
    uint256 public tokenId;

    // Pull payment balances (for gas-efficient refunds)
    mapping(address => uint256) public pendingReturns;

    // Events
    event AuctionCreated(
        address indexed seller,
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 startingPrice,
        uint256 startTime,
        uint256 endTime
    );
    event BidPlaced(address indexed bidder, uint256 amount);
    event AuctionSettled(address indexed winner, uint256 amount);
    event AuctionCancelled();
    event FundsWithdrawn(address indexed recipient, uint256 amount);

    // Errors (more gas efficient than require strings)
    error AuctionNotActive();
    error AuctionAlreadySettled();
    error AuctionStillActive();
    error InsufficientBid();
    error TransferFailed();
    error NoFundsToWithdraw();
    error Unauthorized();

    /**
     * @dev Initialize auction data
     * @param _nftContract Address of the NFT contract
     * @param _tokenId Token ID being auctioned
     * @param _startingPrice Starting price for the auction
     * @param _duration Duration of the auction in seconds
     * @param _feePercentage Platform fee in basis points (e.g., 250 = 2.5%)
     * @param _usePullPayment Whether to use pull payment pattern for refunds
     */
    function _initializeAuction(
        address _nftContract,
        uint256 _tokenId,
        uint96 _startingPrice,
        uint64 _duration,
        uint16 _feePercentage,
        bool _usePullPayment
    ) internal {
        require(_feePercentage <= 10000, "Fee too high"); // Max 100%

        nftContract = IERC721(_nftContract);
        tokenId = _tokenId;

        auctionData = AuctionData({
            seller: msg.sender,
            startingPrice: _startingPrice,
            highestBidder: address(0),
            highestBid: 0,
            startTime: uint64(block.timestamp),
            endTime: uint64(block.timestamp + _duration),
            feePercentage: _feePercentage,
            settled: false,
            usePullPayment: _usePullPayment
        });

        // Transfer NFT to this contract
        nftContract.transferFrom(msg.sender, address(this), _tokenId);

        emit AuctionCreated(
            msg.sender,
            _nftContract,
            _tokenId,
            _startingPrice,
            block.timestamp,
            block.timestamp + _duration
        );
    }

    /**
     * @dev Check if auction is currently active
     */
    function isActive() public view returns (bool) {
        return
            block.timestamp >= auctionData.startTime &&
            block.timestamp <= auctionData.endTime &&
            !auctionData.settled;
    }

    /**
     * @dev Calculate platform fee
     */
    function calculateFee(uint256 amount) public view returns (uint256) {
        return (amount * auctionData.feePercentage) / 10000;
    }

    /**
     * @dev Settle the auction and transfer NFT to winner
     */
    function _settleAuction() internal {
        if (auctionData.settled) revert AuctionAlreadySettled();
        if (isActive()) revert AuctionStillActive();

        auctionData.settled = true;

        if (auctionData.highestBidder != address(0)) {
            // Transfer NFT to winner
            nftContract.transferFrom(
                address(this),
                auctionData.highestBidder,
                tokenId
            );

            // Calculate fee and seller proceeds
            uint256 fee = calculateFee(auctionData.highestBid);
            uint256 sellerProceeds = auctionData.highestBid - fee;

            // Transfer funds to seller
            (bool success, ) = auctionData.seller.call{value: sellerProceeds}(
                ""
            );
            if (!success) revert TransferFailed();

            emit AuctionSettled(
                auctionData.highestBidder,
                auctionData.highestBid
            );
        } else {
            // No bids - return NFT to seller
            nftContract.transferFrom(
                address(this),
                auctionData.seller,
                tokenId
            );
            emit AuctionCancelled();
        }
    }

    /**
     * @dev Refund previous bidder (push pattern - immediate but higher gas)
     */
    function _refundPreviousBidder(address bidder, uint256 amount) internal {
        if (amount > 0) {
            (bool success, ) = bidder.call{value: amount}("");
            if (!success) revert TransferFailed();
        }
    }

    /**
     * @dev Store refund for later withdrawal (pull pattern - deferred but lower gas)
     */
    function _storePendingReturn(address bidder, uint256 amount) internal {
        if (amount > 0) {
            pendingReturns[bidder] += amount;
        }
    }

    /**
     * @dev Withdraw pending returns (pull payment pattern)
     */
    function withdraw() external nonReentrant {
        uint256 amount = pendingReturns[msg.sender];
        if (amount == 0) revert NoFundsToWithdraw();

        pendingReturns[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit FundsWithdrawn(msg.sender, amount);
    }

    /**
     * @dev Emergency pause (only owner can call in derived contracts)
     */
    function pause() external virtual;

    /**
     * @dev Unpause
     */
    function unpause() external virtual;

    /**
     * @dev Get auction details
     */
    function getAuctionData()
        external
        view
        returns (
            address seller,
            uint256 startingPrice,
            address highestBidder,
            uint256 highestBid,
            uint256 startTime,
            uint256 endTime,
            uint256 feePercentage,
            bool settled,
            bool usePullPayment
        )
    {
        return (
            auctionData.seller,
            auctionData.startingPrice,
            auctionData.highestBidder,
            auctionData.highestBid,
            auctionData.startTime,
            auctionData.endTime,
            auctionData.feePercentage,
            auctionData.settled,
            auctionData.usePullPayment
        );
    }

    /**
     * @dev Receive ETH
     */
    receive() external payable {}
}
