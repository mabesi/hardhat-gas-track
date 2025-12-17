# 04. CI/CD Workflow Integration

The true power of `hardhat-gas-track` is unleashed when integrated into your Continuous Integration pipeline. This ensures that no code is merged without passing a gas usage inspection.

## The Strategy
We recommend a **Baseline-Driven** workflow:
1.  **Main Branch:** Stores the canonical `.gas-snapshot.json`.
2.  **Pull Requests:** Run tests and compare locally generated gas data against the committed snapshot from `main`.

## GitHub Actions Integration

Below is a robust production-ready workflow file `.github/workflows/gas-check.yml`.

### Full Example
```yaml
name: Gas Regression Check

on:
  pull_request:
    branches: [ "main" ]

permissions:
  contents: read
  pull-requests: write # Needed if you want to post comments (optional advanced setup)

jobs:
  track-gas:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3
      
      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Compile Contracts
        run: npx hardhat compile

      - name: Run Gas Track
        id: gas_check
        # This will fail the job if gas usage exceeds the threshold
        run: npx hardhat gas:track
        continue-on-error: false 
```

## Best Practices

### 1. Handling Valid Increases
If you *intentionally* increased gas usage (e.g., added a new feature or security check):
1.  Run `npx hardhat gas:snapshot` locally on your branch.
2.  Commit the updated `.gas-snapshot.json`.
3.  Push the changes.
Now the CI will pass because the "New" cost matches the "Snapshot" cost (diff = 0%).

### 2. Artifact Storage (Optional)
You can configure `hardhat-gas-track` to output a file (e.g., `gas-report.md`) and use the `actions/upload-artifact` step to save the report for review, or use a bot to comment it on the PR.

```typescript
// hardhat.config.ts
gasTrack: {
  outputFile: "gas-report.md"
}
```

```yaml
      - name: Upload Gas Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: gas-report
          path: gas-report.md
```

---
[⬅️ Back: Core Concepts](./03-core-concepts.md) | [Next: Configuration Reference ➡️](./05-configuration-reference.md)
