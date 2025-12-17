# 02. Installation and Setup

## Prerequisites
Before you begin, ensure your development environment meets the following requirements:
- **Node.js**: v18.0.0 or higher.
- **Hardhat**: v2.19.0 or higher.
- **Package Manager**: npm, yarn, pnpm, or bun.

## Installation

Install the package as a development dependency. It is lightweight and will not be included in your deployed build.

### Using Npm
```bash
npm install --save-dev hardhat-gas-track
```

### Using Yarn
```bash
yarn add --dev hardhat-gas-track
```

## Configuration

### 1. Import the Plugin
Open your `hardhat.config.ts` (or `hardhat.config.js`) and import the plugin. This automatically adds the `gas:snapshot` and `gas:track` tasks to your environment.

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
// Import the plugin here
import "hardhat-gas-track"; 

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  // ... rest of your config
};

export default config;
```

### 2. Configure `hardhat-gas-reporter` (Required)
This plugin relies on the output from `hardhat-gas-reporter`. You must install it and configure it to output JSON.

```bash
npm install --save-dev hardhat-gas-reporter
```

In your `hardhat.config.ts`, verify your reporter config:

```typescript
{
  gasReporter: {
    enabled: true,
    outputJSON: true, // <--- CRITICAL: Plugin reads this JSON
    outputFile: "gas-report.json"
  }
}
```

### 3. Customizing Settings (Optional)
While the plugin works out-of-the-box, you can customize strictness and exclusions via the `gasTrack` property in your config.

```typescript
const config: HardhatUserConfig = {
  solidity: "0.8.20",
  gasTrack: {
    threshold: 5.0,              // 5% increase allowed before warning/failure
    strict: false,               // Set to true to fail on ANY increase
    outputFile: "gas-report.md", // Save results to a file (useful for CI)
    exclude: [                   // Ignore specific contracts or methods
      "Mock*", 
      "TestContract:setup"
    ]
  }
};
```

### 4. Verify Installation
Run the following command to see if the tasks are available:

```bash
npx hardhat help
```

You should see `gas:snapshot` and `gas:track` listed under the available tasks.

---
[⬅️ Back: Introduction](./01-introduction.md) | [Next: Core Concepts ➡️](./03-core-concepts.md)
