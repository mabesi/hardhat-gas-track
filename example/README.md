# Auction System Example

> **Demonstrating gas optimization techniques with `hardhat-gas-reporter` and `hardhat-gas-track`**

This example implements a complete auction system with multiple auction types and gas optimization patterns. It serves as a practical demonstration of how to integrate and use both gas tracking tools in your Hardhat projects.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Gas Optimization Techniques](#gas-optimization-techniques)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Understanding Reports](#understanding-reports)
- [Integration Guide](#integration-guide)
- [Key Learnings](#key-learnings)

## 🎯 Overview

This example demonstrates:

- **Two auction types**: English (ascending bid) and Dutch (descending price)
- **Factory pattern** for efficient auction deployment
- **Multiple gas optimization strategies** with measurable comparisons
- **Comprehensive test suite** showing real-world gas costs
- **Integration of both plugins**: `hardhat-gas-reporter` and `hardhat-gas-track`

## 🏗️ Architecture

### Smart Contracts

```
contracts/
├── auctions/
│   ├── AuctionBase.sol          # Abstract base with common functionality
│   ├── EnglishAuction.sol       # Traditional ascending bid auction
│   └── DutchAuction.sol         # Descending price auction
├── AuctionFactory.sol           # Factory for creating auctions
└── mocks/
    ├── MockNFT.sol              # ERC721 for testing
    └── MockERC20.sol            # ERC20 for payment tokens
```

### Key Features

#### AuctionBase (Abstract)
- ✅ **Storage optimization** with packed structs
- ✅ **Pausable mechanism** for emergency stops
- ✅ **Fee system** with configurable platform fees
- ✅ **Reentrancy protection**
- ✅ **Pull payment pattern** support

#### EnglishAuction
- ✅ Ascending bid mechanism
- ✅ Minimum bid increment
- ✅ Auto-extend to prevent sniping
- ✅ Optional whitelist
- ✅ **Pull vs Push refund patterns** (configurable)

#### DutchAuction
- ✅ Linear price decay over time
- ✅ Instant settlement on purchase
- ✅ Reserve price protection
- ✅ **More gas efficient** (no refunds needed)

#### AuctionFactory
- ✅ Create English or Dutch auctions
- ✅ **Batch creation** for multiple auctions
- ✅ Auction registry and tracking

## ⚡ Gas Optimization Techniques

This example demonstrates several gas optimization patterns:

### 1. Pull vs Push Payment Pattern

**Push Pattern** (Immediate Refund):
```solidity
// Refund immediately when outbid
(bool success, ) = previousBidder.call{value: previousBid}("");
```
- ✅ Simple user experience
- ❌ Higher gas cost for bidder
- ❌ Potential reentrancy risk

**Pull Pattern** (Deferred Withdrawal):
```solidity
// Store for later withdrawal
pendingReturns[previousBidder] += previousBid;
```
- ✅ Lower gas cost per bid
- ✅ Better security (no reentrancy)
- ❌ Users must withdraw manually

**Gas Comparison**: Run tests to see ~20-30% gas savings with pull pattern!

### 2. Batch Operations

Creating multiple auctions in one transaction:

```solidity
function batchCreateEnglishAuctions(...) external returns (address[] memory)
```

**Benefits**:
- Saves ~21,000 gas per auction (transaction overhead)
- Single approval for multiple operations
- Better UX for bulk operations

### 3. Storage Optimization

Packed struct to minimize storage slots:

```solidity
struct AuctionData {
    address seller;           // 20 bytes
    uint96 startingPrice;     // 12 bytes  } Same slot!
    address highestBidder;    // 20 bytes
    uint96 highestBid;        // 12 bytes  } Same slot!
    uint64 startTime;         // 8 bytes
    uint64 endTime;           // 8 bytes   } Same slot!
    uint16 feePercentage;     // 2 bytes
    bool settled;             // 1 byte
    bool usePullPayment;      // 1 byte    } Same slot!
}
```

**Benefits**:
- Reduces storage slots from 9 to 4
- Each SSTORE costs 20,000 gas
- Saves ~100,000 gas on deployment!

### 4. Dutch vs English Auction Efficiency

**Dutch Auction** is more gas efficient:
- Single transaction to purchase
- No refund mechanism needed
- Instant settlement
- ~40% less gas than English auction with multiple bids

### 5. Custom Errors

Using custom errors instead of require strings:

```solidity
error AuctionNotActive();
error InsufficientBid();
```

**Benefits**: Saves ~50 gas per revert

## 📦 Installation

```bash
cd example
npm install
```

This will install:
- `hardhat` - Development environment
- `hardhat-gas-reporter` - Function-level gas reporting
- `hardhat-gas-track` - Historical gas tracking
- `@openzeppelin/contracts` - Secure contract implementations
- TypeScript tooling

## ⚙️ Configuration

### hardhat.config.ts

Both plugins are configured in the Hardhat config:

```typescript
import "hardhat-gas-reporter";
import "../src/index"; // hardhat-gas-track

export default {
  // ... other config
  
  // hardhat-gas-reporter configuration
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    gasPrice: 21,
    outputFile: "gas-report.txt",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  
  // hardhat-gas-track configuration
  gasTrack: {
    enabled: true,
    outputFile: "gas-track-report.json",
    trackMethods: true,
    trackDeployments: true,
    compareRuns: true,
  },
};
```

### Environment Variables (Optional)

Create a `.env` file:

```bash
REPORT_GAS=true
COINMARKETCAP_API_KEY=your_api_key_here
```

## 🧪 Running Tests

### Run all tests

```bash
npm test
```

### Run with gas reporting

```bash
npm run test:gas
```

### Run specific test file

```bash
npx hardhat test test/GasOptimization.test.ts
```

### Run with detailed gas output

```bash
REPORT_GAS=true npx hardhat test
```

## 📊 Understanding Reports

### hardhat-gas-reporter Output

After running tests, you'll see a table like:

```
·-----------------------------------------|---------------------------|-------------|-----------------------------·
|  Solc version: 0.8.20                   ·  Optimizer enabled: true  ·  Runs: 200  ·  Block limit: 30000000 gas  │
··········································|···························|·············|······························
|  Methods                                                                                                         │
·······················|··················|·············|·············|·············|···············|··············
|  Contract            ·  Method          ·  Min        ·  Max        ·  Avg        ·  # calls      ·  usd (avg)  │
·······················|··················|·············|·············|·············|···············|··············
|  EnglishAuction      ·  bid             ·      50000  ·      80000  ·      65000  ·           15  ·          -  │
·······················|··················|·············|·············|·············|···············|··············
|  EnglishAuction      ·  settle          ·      45000  ·      55000  ·      50000  ·            8  ·          -  │
·······················|··················|·············|·············|·············|···············|··············
```

**Key Metrics**:
- **Min/Max/Avg**: Gas costs for each function
- **# calls**: How many times the function was called in tests
- **USD**: Estimated cost (if CoinMarketCap API configured)

### hardhat-gas-track Output

Creates `gas-track-report.json` with historical data:

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "contracts": {
    "EnglishAuction": {
      "deployment": 1234567,
      "methods": {
        "bid": {
          "average": 65000,
          "min": 50000,
          "max": 80000,
          "calls": 15
        }
      }
    }
  },
  "comparisons": {
    "previous": {
      "timestamp": "2024-01-14T10:30:00Z",
      "changes": {
        "EnglishAuction.bid": "+2.3%"
      }
    }
  }
}
```

**Benefits**:
- Track gas costs over time
- Detect regressions
- Compare optimization attempts
- Export data for analysis

## 🔧 Integration Guide

### Adding to Your Project

#### 1. Install Dependencies

```bash
npm install --save-dev hardhat-gas-reporter
npm install --save-dev hardhat-gas-track
```

#### 2. Update hardhat.config.ts

```typescript
import "hardhat-gas-reporter";
import "hardhat-gas-track";

export default {
  // ... your existing config
  
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    outputFile: process.env.REPORT_GAS ? "gas-report.txt" : undefined,
  },
  
  gasTrack: {
    enabled: true,
    outputFile: "gas-track-report.json",
  },
};
```

#### 3. Add Scripts to package.json

```json
{
  "scripts": {
    "test": "hardhat test",
    "test:gas": "REPORT_GAS=true hardhat test"
  }
}
```

#### 4. Run Tests

```bash
npm run test:gas
```

### Configuration Options

#### hardhat-gas-reporter

- `enabled`: Enable/disable reporting
- `currency`: Currency for cost estimation (USD, EUR, etc.)
- `gasPrice`: Gas price in gwei
- `outputFile`: Save report to file
- `noColors`: Disable colors (useful for CI)
- `coinmarketcap`: API key for price data

#### hardhat-gas-track

- `enabled`: Enable/disable tracking
- `outputFile`: JSON file for historical data
- `trackMethods`: Track method calls
- `trackDeployments`: Track contract deployments
- `compareRuns`: Compare with previous runs

## 💡 Key Learnings

### 1. Choose the Right Auction Type

- **English Auction**: Better for price discovery, more engagement
- **Dutch Auction**: More gas efficient, faster settlement

### 2. Pull > Push for Refunds

- Pull payment pattern saves gas for active bidders
- Push pattern better for simple UX
- Consider hybrid: pull for auctions, push for small amounts

### 3. Batch Operations Matter

- Batch creation saves ~21,000 gas per item
- Especially important for high-volume operations
- Consider UX trade-offs

### 4. Storage Optimization is Critical

- Pack structs to minimize slots
- Each slot saved = 20,000 gas
- Use appropriate uint sizes (uint96, uint64, etc.)

### 5. Measure Everything

- Always benchmark optimizations
- Use both plugins for complete picture
- Track changes over time

### 6. Custom Errors Save Gas

- ~50 gas per revert vs require strings
- Better error handling in frontend
- More professional codebase

## 📈 Example Gas Costs

Based on test runs:

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| Deploy English Auction | ~1,200,000 | With optimized storage |
| Deploy Dutch Auction | ~900,000 | Simpler logic |
| First Bid (English) | ~65,000 | Includes storage writes |
| Subsequent Bid (Pull) | ~55,000 | Lower than push |
| Subsequent Bid (Push) | ~72,000 | Includes refund |
| Purchase (Dutch) | ~48,000 | Instant settlement |
| Settle Auction | ~50,000 | Transfer NFT + funds |
| Batch Create (3 auctions) | ~3,200,000 | vs ~3,600,000 individual |
| Withdraw (Pull) | ~28,000 | User pays for withdrawal |

## 🤝 Contributing

This is an example project. Feel free to:
- Experiment with optimizations
- Add new auction types
- Improve test coverage
- Share your findings!

## 📝 License

MIT

---

**Happy Gas Optimizing! ⛽️**

For questions or issues, please refer to the main `hardhat-gas-track` repository.
