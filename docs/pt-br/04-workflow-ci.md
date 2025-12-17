# 04. Integração de Workflow CI/CD

O verdadeiro poder do `hardhat-gas-track` é liberado quando integrado ao seu pipeline de Integração Contínua. Isso garante que nenhum código seja mergeado sem passar por uma inspeção de uso de gás.

## A Estratégia
Recomendamos um workflow **Baseado em Baseline**:
1.  **Branch Principal (main):** Armazena o `.gas-snapshot.json` canônico.
2.  **Pull Requests:** Rodam testes e comparam os dados de gás gerados localmente contra o snapshot comitado na `main`.

## Integração com GitHub Actions

Abaixo está um arquivo de workflow robusto e pronto para produção `.github/workflows/gas-check.yml`.

### Exemplo Completo
```yaml
name: Gas Regression Check

on:
  pull_request:
    branches: [ "main" ]

permissions:
  contents: read
  pull-requests: write # Necessário se quiser postar comentários (setup avançado opcional)

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
        # Isso falhará o job se o uso de gás exceder o limite
        run: npx hardhat gas:track
        continue-on-error: false 
```

## Melhores Práticas

### 1. Lidando com Aumentos Válidos
Se você aumentou o uso de gás *intencionalmente* (ex: adicionou uma nova funcionalidade ou checagem de segurança):
1.  Rode `npx hardhat gas:snapshot` localmente na sua branch.
2.  Comite o `.gas-snapshot.json` atualizado.
3.  Faça o push das mudanças.
Agora o CI passará porque o "Novo" custo corresponde ao custo do "Snapshot" (diff = 0%).

### 2. Armazenamento de Artefatos (Opcional)
Você pode configurar o `hardhat-gas-track` para gerar um arquivo (ex: `gas-report.md`) e usar o passo `actions/upload-artifact` para salvar o relatório para revisão.

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
[⬅️ Voltar: Conceitos Principais](./03-core-concepts.md) | [Avançar: Referência de Configuração ➡️](./05-configuration-reference.md)
