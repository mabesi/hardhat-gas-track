# 04. Workflow de CI/CD

Automatize a verificação de gás para evitar regressões antes do merge.

## Fluxo Recomendado

1.  **Branch Principal (main/master):** Deve conter o arquivo `.gas-snapshot.json` atualizado.
2.  **Pull Request:** O CI executa `gas:track` comparando a PR contra o snapshot da `main`.

## Exemplo GitHub Actions

Crie um arquivo `.github/workflows/gas-check.yml`:

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

### Atualizando o Snapshot
Quando você faz uma otimização ou mudança intencional, precisa atualizar a "linha de base".
- Localmente: Rode `npx hardhat gas:snapshot` e comite o arquivo JSON alterado.

---
[⬅️ Voltar: Conceitos Principais](./03-core-concepts.md) | [Avançar: Referência de Configuração ➡️](./05-configuration-reference.md)
