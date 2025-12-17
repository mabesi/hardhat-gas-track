# 03. Core Concepts and Architecture

Understanding how `hardhat-gas-track` processes your data is key to mastering it.

## The Snapshot Workflow
The core of the system is the **Snapshot File** (`.gas-snapshot.json`). This file represents the "approved" state of your contracts' gas consumption.

### Lifecycle
1.  **Generation:** When you run `npx hardhat gas:snapshot`, the plugin executes your test suite.
2.  **Collection:** It hooks into the Ethereum provider to listen for `eth_estimateGas` and transaction receipts.
3.  **Aggregation:** It groups gas usage by `ContractName` and `MethodName` (or signature).
4.  **Storage:** The aggregated data (average gas, min, max, call count) is saved to the JSON file.

> **Note:** The snapshot file **SHOULD** be committed to your version control system (Git). It allows your team to share the same performance baseline.

## The Comparison Logic (`gas:track`)
When running in verification mode (`npx hardhat gas:track`), the plugin performs a **Relative Differential Analysis**.

### Formula
$$
\text{Diff \%} = \left( \frac{\text{NewAvgGas} - \text{OldAvgGas}}{\text{OldAvgGas}} \right) \times 100
$$

### Thresholds and Strictness
-   **Soft Threshold (Default):** A `threshold` of 5.0 means you allow the gas to fluctuate up to 5% upwards. This is useful because Solidity compiler versions or minor logic tweaks can sometimes cause negligible gas variance.
-   **Strict Mode:** When `strict: true` is enabled, the threshold is effectively **0%**. Any non-zero increase in gas cost will trigger a failure `exit(1)`. This is recommended for crucial audits or final releases.

## Handling "Calls"
The plugin tracks the *number of calls* made to a function.
-   **Why?** To calculate a weighted average.
-   **Mismatch:** If your new test suite calls a function 100 times, but the snapshot only had 10 calls, the plugin still compares the *Average Cost per Call*. This makes the tool robust against changes in test suite size, as long as the *nature* of the calls remains similar.

## Exclusions
Sometimes you have test helper methods (e.g., `MintForTest`, `SetupWorld`) that are inherently gas-heavy and irrelevant for production. You can exclude them using glob patterns like `Helper:*` or `*:test_setup` to keep your report clean and focused on production code.

---
[⬅️ Back: Installation](./02-installation.md) | [Next: CI/CD Workflow ➡️](./04-workflow-ci.md)
