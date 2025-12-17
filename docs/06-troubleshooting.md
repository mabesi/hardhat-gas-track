# 06. Troubleshooting

Solutions for common problems.

## "Snapshot not found"
**Error:** `Error: Snapshot not found. Run 'npx hardhat gas:snapshot' first.`
**Cause:** You are trying to run `gas:track` (verification) without having a baseline.
**Solution:** Run `npx hardhat gas:snapshot` to generate the initial `.gas-snapshot.json` file.

## "Mismatch methods" (Missing methods)
If new methods were added to the contract but do not exist in the snapshot, they are ignored in the comparison (as there is no baseline to compare against).
**Tip:** Always update the snapshot when adding critical new features.

## High "deploy" costs
If deploy costs seem incorrect, check if you are not including complex migration scripts in your tests. `gas-track` captures what the Ethereum provider reports.

---
[⬅️ Back: Configuration Reference](./05-configuration-reference.md)
