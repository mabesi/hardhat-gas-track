# 05. Referência de Configuração

Todas as opções disponíveis para o objeto `gasTrack` no `hardhat.config.ts`.

| Opção | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `threshold` | `number` | `5.0` | Porcentagem máxima de aumento de gás permitida. Ex: `5.0` aceita até 5% a mais. |
| `strict` | `boolean` | `false` | Se `true`, ignora o threshold de porcentagem e falha com qualquer aumento (diferença > 0). |
| `outputFile` | `string` | `undefined` | Caminho para salvar um relatório (ex: para postar comentário no PR). |
| `exclude` | `string[]` | `[]` | Lista de padrões glob para excluir contratos ou métodos. Ex: `["Test*", "Mock:*"]`. |

**Exemplo Completo:**

```typescript
gasTrack: {
  threshold: 2.5,
  strict: false,
  exclude: ["Migration:*"],
  outputFile: "ci-report.md"
}
```

---
[⬅️ Voltar: Workflow CI/CD](./04-workflow-ci.md) | [Avançar: Troubleshooting ➡️](./06-troubleshooting.md)
