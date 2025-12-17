# 03. Core Concepts

Understand how `hardhat-gas-track` makes decisions.

## 1. The Snapshot (`.gas-snapshot.json`)
The Snapshot is a JSON file that acts as the "immutable truth" about your system's costs at a given point in time. It maps `Contract:function` to gas metrics.

**Example:**
```json
{
  "Token:transfer": { "gas": 21000, "calls": 50 }
}
```
This states: "Historically, the `transfer` function of `Token` costs on average 21,000 gas".

## 2. Threshold
In development, small gas fluctuations can occur due to compiler or optimizer changes. The `threshold` defines the tolerance for these changes.

- **Threshold = 5.0% (Default):** If the new cost is 22,000 (+4.7%), the test PASSES (with a warning). If it is 23,000 (+9.5%), it FAILS.
- **Strict Mode:** Threshold is ignored. Any increase > 0 fails the test.

## 3. Relative Comparison
The plugin calculates the difference based on the average (Total Gas / Number of Calls). This normalizes the tests, allowing comparison of executions with different numbers of calls, provided the function logic remains the same.

---
[⬅️ Back: Installation](./02-installation.md) | [Next: CI/CD Workflow ➡️](./04-workflow-ci.md)
