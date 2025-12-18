// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AuctionBase.sol";

/**
 * @title EnglishAuction
 * @dev Traditional ascending bid auction with optional features:
 * - Minimum bid increment
 * - Auto-extend to prevent sniping
 * - Whitelist support
 * - Pull vs Push payment patterns for gas comparison
 */
contract EnglishAuction is AuctionBase {
    // Auction parameters
    uint96 public minBidIncrement;
    uint64 public autoExtendDuration;
    bool public whitelistEnabled;
    
    // Whitelist mapping
    mapping(address => bool) public whitelist;
    
    // Auction owner (for admin functions)
    address public owner;

    // Events
    event BidIncrementUpdated(uint256 newIncrement);
    event WhitelistUpdated(address indexed account, bool status);
    event AuctionExtended(uint256 newEndTime);

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyWhitelisted() {
        if (whitelistEnabled && !whitelist[msg.sender]) revert Unauthorized();
        _;
    }

    /**
     * @dev Constructor
     * @param _nftContract Address of the NFT contract
     * @param _tokenId Token ID being auctioned
     * @param _startingPrice Starting price for the auction
     * @param _duration Duration of the auction in seconds
     * @param _minBidIncrement Minimum increment for each bid
     * @param _feePercentage Platform fee in basis points
     * @param _usePullPayment Use pull payment pattern (true) or push (false)
     * @param _autoExtendDuration Seconds to extend if bid near end (0 to disable)
     */
    constructor(
        address _nftContract,
        uint256 _tokenId,
        uint96 _startingPrice,
        uint64 _duration,
        uint96 _minBidIncrement,
        uint16 _feePercentage,
        bool _usePullPayment,
        uint64 _autoExtendDuration
    ) {
        owner = msg.sender;
        minBidIncrement = _minBidIncrement;
        autoExtendDuration = _autoExtendDuration;
        
        _initializeAuction(
            _nftContract,
            _tokenId,
            _startingPrice,
            _duration,
            _feePercentage,
            _usePullPayment
        );
    }

    /**
     * @dev Place a bid on the auction
     */
    function bid() external payable whenNotPaused nonReentrant onlyWhitelisted {
        if (!isActive()) revert AuctionNotActive();
        
        uint256 currentHighestBid = auctionData.highestBid;
        
        // Check bid is valid
        if (currentHighestBid == 0) {
            // First bid must meet starting price
            if (msg.value < auctionData.startingPrice) revert InsufficientBid();
        } else {
            // Subsequent bids must exceed current highest by minimum increment
            if (msg.value < currentHighestBid + minBidIncrement) revert InsufficientBid();
        }

        address previousBidder = auctionData.highestBidder;
        uint256 previousBid = currentHighestBid;

        // Update auction state
        auctionData.highestBidder = msg.sender;
        auctionData.highestBid = uint96(msg.value);

        // Refund previous bidder using chosen pattern
        if (previousBidder != address(0)) {
            if (auctionData.usePullPayment) {
                // Pull payment: store for later withdrawal (lower gas)
                _storePendingReturn(previousBidder, previousBid);
            } else {
                // Push payment: immediate refund (higher gas)
                _refundPreviousBidder(previousBidder, previousBid);
            }
        }

        // Auto-extend if bid is near the end
        if (autoExtendDuration > 0) {
            uint256 timeLeft = auctionData.endTime - block.timestamp;
            if (timeLeft < autoExtendDuration) {
                auctionData.endTime = uint64(block.timestamp + autoExtendDuration);
                emit AuctionExtended(auctionData.endTime);
            }
        }

        emit BidPlaced(msg.sender, msg.value);
    }

    /**
     * @dev Settle the auction (can be called by anyone after auction ends)
     */
    function settle() external nonReentrant {
        _settleAuction();
    }

    /**
     * @dev Enable/disable whitelist
     */
    function setWhitelistEnabled(bool enabled) external onlyOwner {
        whitelistEnabled = enabled;
    }

    /**
     * @dev Add address to whitelist
     */
    function addToWhitelist(address account) external onlyOwner {
        whitelist[account] = true;
        emit WhitelistUpdated(account, true);
    }

    /**
     * @dev Remove address from whitelist
     */
    function removeFromWhitelist(address account) external onlyOwner {
        whitelist[account] = false;
        emit WhitelistUpdated(account, false);
    }

    /**
     * @dev Batch add to whitelist (gas optimization)
     */
    function batchAddToWhitelist(address[] calldata accounts) external onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            whitelist[accounts[i]] = true;
            emit WhitelistUpdated(accounts[i], true);
        }
    }

    /**
     * @dev Update minimum bid increment
     */
    function setMinBidIncrement(uint96 newIncrement) external onlyOwner {
        minBidIncrement = newIncrement;
        emit BidIncrementUpdated(newIncrement);
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
     * @dev Get current price (for consistency with DutchAuction)
     */
    function getCurrentPrice() external view returns (uint256) {
        if (auctionData.highestBid > 0) {
            return auctionData.highestBid;
        }
        return auctionData.startingPrice;
    }
}
