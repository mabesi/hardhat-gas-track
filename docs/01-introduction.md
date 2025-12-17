# 01. Introduction to Hardhat Gas Track

## The Silent Killer of DeFi Protocols
In the world of blockchain development, gas optimization is not just a "nice-to-have"—it is a critical economic factor. A smart contract that consumes 5% more gas than its competitor can result in **millions of dollars** in lost value for users over the protocol's lifetime.

Unlike functional bugs, **gas regressions are silent**. A small change in a for-loop, swapping a storage variable, or incorrectly ordering struct members can instantly spike transaction costs without breaking any tests.

## What is Hardhat Gas Track?
**Hardhat Gas Track** is a developer-first plugin designed to integrate seamlessly into your Hardhat workflow. It acts as a financial guardian for your codebase.

### Core Philosophy
1.  **Visibility:** You cannot optimize what you do not measure.
2.  **Accountability:** Every Pull Request must justify its gas impact.
3.  **Automation:** Manual checking is error-prone; CI/CD should handle it.

### Key Features
- **📸 Automated Baselines:** Generate a "Snapshot" of your contract's performance at any point in time.
- **🛡️ Regression Guard:** Set strict or fuzzy thresholds (e.g., "fail if gas increases by more than 5%").
- **🔍 Granular Tracking:** Track costs at the method level (e.g., `Token:transfer` vs `Token:approve`).
- **🔌 Zero Config Start:** Works out of the box with sensible defaults, but fully configurable.

### Why not just use `hardhat-gas-reporter`?
`hardhat-gas-reporter` is excellent for seeing the cost of a *single* run. **Hardhat Gas Track** focuses on the **delta** (change) between runs. It answers the question: *"Did my latest commit make the protocol more expensive?"*

---
[Next: Installation & Setup ➡️](./02-installation.md)
