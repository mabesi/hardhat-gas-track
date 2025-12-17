# 05. Configuration Reference

You can configure `hardhat-gas-track` within your `hardhat.config.ts` under the `gasTrack` object.

## Type Definition
```typescript
interface GasTrackUserConfig {
  threshold?: number;
  strict?: boolean;
  outputFile?: string;
  exclude?: string[];
}
```

## Options Detail

### `threshold`
-   **Type:** `number`
-   **Default:** `5.0`
-   **Description:** The maximum allowable percentage increase in gas cost.
-   **Example:** `threshold: 2.5`
-   **Behavior:**
    -   If `NewCost > OldCost + (OldCost * 0.025)`, the task fails.
    -   If the increase is within 0-2.5%, it prints a warning but passes.

### `strict`
-   **Type:** `boolean`
-   **Default:** `false`
-   **Description:** Overrides `threshold` to be effectively zero.
-   **Behavior:**
    -   If `strict: true`, ANY increase in gas cost (even 1 unit) will cause the task to fail.
    -   Recommended for finalized codebases or pre-audit checks.

### `outputFile`
-   **Type:** `string` (Path)
-   **Default:** `undefined` (Logs to console only)
-   **Description:** If provided, the plugin will write the reporting table to this file (useful for CI artifacts).
-   **Example:** `outputFile: "reports/gas-diff.txt"`

### `exclude`
-   **Type:** `string[]` (Glob patterns)
-   **Default:** `[]`
-   **Description:** An array of patterns to ignore during comparison. Supports wildcard `*`.
-   **Matching Logic:** Matches against the key format `ContractName:MethodName`.
-   **Examples:**
    -   `["Mock*"]` - Ignores all contracts starting with "Mock".
    -   `["*:setup"]` - Ignores "setup" method in all contracts.
    -   `["Token:mint"]` - Ignores specifically the `mint` function of `Token`.

## Full Configuration Example

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "hardhat-gas-track";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  gasTrack: {
    threshold: 1.0,           // Strict 1% tolerance
    strict: false,
    outputFile: "ci/gas.log",
    exclude: [
      "TestToken:*",          // Ignore entire TestToken contract
      "*:injected_func",      // Ignore injected_func everywhere
    ]
  }
};

export default config;
```

---
[⬅️ Back: CI/CD Workflow](./04-workflow-ci.md) | [Next: Troubleshooting ➡️](./06-troubleshooting.md)
