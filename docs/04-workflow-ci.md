# 04. CI/CD Workflow

Automate gas checks to prevent regressions before merging.

## Recommended Workflow

1.  **Main Branch (main/master):** Should contain the updated `.gas-snapshot.json`.
2.  **Pull Request:** CI runs `gas:track` comparing the PR against the snapshot from `main`.

## GitHub Actions Example

Create a file `.github/workflows/gas-check.yml`:

```yaml
name: Gas Check

on: [pull_request]

jobs:
  check-gas:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install Dependencies
        run: npm ci
        
      - name: Compile
        run: npx hardhat compile
        
      - name: Check Gas Regression
        run: npx hardhat gas:track
```

### Updating the Snapshot
When you make an optimization or intentional change, you need to update the "baseline".
- Locally: Run `npx hardhat gas:snapshot` and commit the changed JSON file.

---
[⬅️ Back: Core Concepts](./03-core-concepts.md) | [Next: Configuration Reference ➡️](./05-configuration-reference.md)
