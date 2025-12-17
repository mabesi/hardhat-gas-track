# 05. Configuration Reference

All available options for the `gasTrack` object in `hardhat.config.ts`.

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `threshold` | `number` | `5.0` | Maximum allowed gas increase percentage. E.g., `5.0` allows up to 5% more. |
| `strict` | `boolean` | `false` | If `true`, ignores percentage threshold and fails on any increase (diff > 0). |
| `outputFile` | `string` | `undefined` | Path to save a report (e.g., for posting PR comments). |
| `exclude` | `string[]` | `[]` | List of glob patterns to exclude contracts or methods. E.g., `["Test*", "Mock:*"]`. |

**Complete Example:**

```typescript
gasTrack: {
  threshold: 2.5,
  strict: false,
  exclude: ["Migration:*"],
  outputFile: "ci-report.md"
}
```

---
[⬅️ Back: CI/CD Workflow](./04-workflow-ci.md) | [Next: Troubleshooting ➡️](./06-troubleshooting.md)
