// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AuctionBase.sol";

/**
 * @title DutchAuction
 * @dev Descending price auction where price decreases linearly over time
 * First bidder to accept the current price wins immediately
 * More gas efficient than English auction (no refunds needed)
 */
contract DutchAuction is AuctionBase {
    // Price parameters
    uint96 public reservePrice;      // Minimum price (auction won't go below this)
    uint256 public priceDecrement;   // Amount price decreases per second
    
    // Auction owner
    address public owner;

    // Events
    event PurchasedAtPrice(address indexed buyer, uint256 price);

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    /**
     * @dev Constructor
     * @param _nftContract Address of the NFT contract
     * @param _tokenId Token ID being auctioned
     * @param _startingPrice Starting (highest) price
     * @param _reservePrice Minimum price (floor)
     * @param _duration Duration of the auction in seconds
     * @param _feePercentage Platform fee in basis points
     */
    constructor(
        address _nftContract,
        uint256 _tokenId,
        uint96 _startingPrice,
        uint96 _reservePrice,
        uint64 _duration,
        uint16 _feePercentage
    ) {
        require(_reservePrice < _startingPrice, "Invalid price range");
        
        owner = msg.sender;
        reservePrice = _reservePrice;
        
        // Calculate price decrement per second
        // Using uint256 for intermediate calculation to avoid overflow
        priceDecrement = (_startingPrice - _reservePrice) / _duration;
        
        // Dutch auction doesn't need pull payment (no refunds)
        _initializeAuction(
            _nftContract,
            _tokenId,
            _startingPrice,
            _duration,
            _feePercentage,
            false // usePullPayment not needed
        );
    }

    /**
     * @dev Get current price based on time elapsed
     * Price decreases linearly from startingPrice to reservePrice
     */
    function getCurrentPrice() public view returns (uint256) {
        if (auctionData.settled) {
            return auctionData.highestBid;
        }
        
        if (!isActive()) {
            return reservePrice;
        }

        uint256 timeElapsed = block.timestamp - auctionData.startTime;
        uint256 priceDecrease = priceDecrement * timeElapsed;
        
        // Ensure price doesn't go below reserve
        if (priceDecrease >= auctionData.startingPrice - reservePrice) {
            return reservePrice;
        }
        
        return auctionData.startingPrice - priceDecrease;
    }

    /**
     * @dev Purchase NFT at current price
     * First person to call this wins the auction immediately
     */
    function buy() external payable whenNotPaused nonReentrant {
        if (!isActive()) revert AuctionNotActive();
        if (auctionData.settled) revert AuctionAlreadySettled();
        
        uint256 currentPrice = getCurrentPrice();
        
        if (msg.value < currentPrice) revert InsufficientBid();
        
        // Mark as settled immediately
        auctionData.settled = true;
        auctionData.highestBidder = msg.sender;
        auctionData.highestBid = uint96(currentPrice);
        
        // Transfer NFT to buyer
        nftContract.transferFrom(address(this), msg.sender, tokenId);
        
        // Calculate fee and seller proceeds
        uint256 fee = calculateFee(currentPrice);
        uint256 sellerProceeds = currentPrice - fee;
        
        // Transfer funds to seller
        (bool success, ) = auctionData.seller.call{value: sellerProceeds}("");
        if (!success) revert TransferFailed();
        
        // Refund excess payment
        uint256 excess = msg.value - currentPrice;
        if (excess > 0) {
            (bool refundSuccess, ) = msg.sender.call{value: excess}("");
            if (!refundSuccess) revert TransferFailed();
        }
        
        emit PurchasedAtPrice(msg.sender, currentPrice);
        emit AuctionSettled(msg.sender, currentPrice);
    }

    /**
     * @dev Settle auction if time expired with no buyer
     * Returns NFT to seller
     */
    function settle() external nonReentrant {
        if (isActive()) revert AuctionStillActive();
        if (auctionData.settled) revert AuctionAlreadySettled();
        
        auctionData.settled = true;
        
        // No buyer - return NFT to seller
        nftContract.transferFrom(address(this), auctionData.seller, tokenId);
        
        emit AuctionCancelled();
    }

    /**
     * @dev Pause auction (emergency)
     */
    function pause() external override onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause auction
     */
    function unpause() external override onlyOwner {
        _unpause();
    }

    /**
     * @dev Get price at specific timestamp (for testing/preview)
     */
    function getPriceAt(uint256 timestamp) external view returns (uint256) {
        if (timestamp < auctionData.startTime) {
            return auctionData.startingPrice;
        }
        
        if (timestamp > auctionData.endTime) {
            return reservePrice;
        }
        
        uint256 timeElapsed = timestamp - auctionData.startTime;
        uint256 priceDecrease = priceDecrement * timeElapsed;
        
        if (priceDecrease >= auctionData.startingPrice - reservePrice) {
            return reservePrice;
        }
        
        return auctionData.startingPrice - priceDecrease;
    }
}
