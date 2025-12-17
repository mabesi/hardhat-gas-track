# 02. Installation and Setup

## Prerequisites
- Node.js 18+
- Hardhat Project configured

## Installation

Since the package is a development plugin, install it as a `devDependencies`:

```bash
npm install --save-dev hardhat-gas-track
# or
yarn add --dev hardhat-gas-track
```

## Basic Configuration

Add the plugin to your `hardhat.config.ts` file:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-track"; // <--- Import here

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  // Optional configuration (default values shown below)
  gasTrack: {
    threshold: 5.0,     // Allows up to 5% increase
    strict: false,      // If true, any increase breaks the build
    exclude: ["Mock*"], // Ignores contracts starting with Mock
  }
};

export default config;
```

## .gitignore

To prevent local snapshots from polluting the repository if not desired (although committing them for CI is recommended), or to ignore temporary files, ensure your `.gitignore` is configured.

If you want the Snapshot to be the shared "truth" across the team, do **NOT** ignore `.gas-snapshot.json`. Commit it to Git.

---
[⬅️ Back: Introduction](./01-introduction.md) | [Next: Core Concepts ➡️](./03-core-concepts.md)
