# 06. Troubleshooting

Common issues and how to resolve them.

## 1. "Snapshot not found"
**Error Message:**
> `Error: Snapshot not found. Run 'npx hardhat gas:snapshot' first.`

**Cause:**
You are running the verification task (`gas:track`) but no baseline file `.gas-snapshot.json` exists in the project root.

**Solution:**
Run the snapshot generation command to create your initial baseline:
```bash
npx hardhat gas:snapshot
```

## 2. Functions Missing in Report ("Mismatch")
**Symptom:**
You added a new function `buyTokens`, but `gas:track` isn't showing it in the table or failing.

**Cause:**
The comparison engine only checks items that exist in **both** the Snapshot and the Current Run. If a function is new, it has no history to compare against.

**Solution:**
Update your snapshot to include the new function:
```bash
npx hardhat gas:snapshot
```

## 3. "Regression detected" persists after optimization
**Symptom:**
You inadvertently increased gas, saw the error, fixed the code to be optimized again, but it still fails.

**Cause:**
Ensure you are comparing against the correct baseline. If you updated the baseline to the "bad" version by mistake, you might be comparing "good" vs "bad" inverted.

**Solution:**
1.  Revert any accidental changes to `.gas-snapshot.json` via Git (`git checkout .gas-snapshot.json`).
2.  Run `npx hardhat gas:track` again to verify your fix against the *original* (correct) baseline.

## 4. Inconsistent Gas Values
**Symptom:**
Gas usage varies slightly between runs (e.g., +/- 20 gas) causing strict checks to fail flakily.

**Cause:**
This can happen due to:
-   Variable array lengths in tests.
-   Non-deterministic behavior in test setup (e.g. `block.timestamp` dependent logic).

**Solution:**
-   Ensure your tests are deterministic. Use fixed seeds if using randomizers.
-   Increase the `threshold` slightly (e.g. `0.5`) instead of using strict mode.

---
[⬅️ Back: Configuration Reference](./05-configuration-reference.md)
