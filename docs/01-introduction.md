# 01. Introduction to hardhat-gas-track

## The Invisible Gas Problem
In DeFi protocols and complex Smart Contracts, gas optimization is money. A 5% increase in transaction cost can mean thousands of dollars more paid by users over a year. Often, changes in Solidity code (like adding a state variable or changing loop logic) introduce silent gas regressions that go unnoticed in standard functional tests.

## The Solution: Gas Regression Testing
**hardhat-gas-track** is a specialized tool for CI/CD that brings visibility and control over your contract execution costs.

### Key Features:
- 📸 **Automated Snapshots:** Create a baseline of acceptable costs.
- 🛡️ **CI Guard:** Block Pull Requests that increase gas beyond an acceptable threshold.
- 📊 **Detailed Reports:** Visualize exactly which function became more expensive and by how much.

This plugin is designed to be "Set and Forget". Configure it once in your pipeline and ensure your protocol remains efficient forever.

---
[Next: Installation ➡️](./02-installation.md)
