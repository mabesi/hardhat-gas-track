# 05. Referência de Configuração

Você pode configurar o `hardhat-gas-track` dentro do seu `hardhat.config.ts` sob o objeto `gasTrack`.

## Definição de Tipo
```typescript
interface GasTrackUserConfig {
  threshold?: number;
  strict?: boolean;
  outputFile?: string;
  exclude?: string[];
}
```

## Detalhe das Opções

### `threshold`
-   **Tipo:** `number`
-   **Padrão:** `5.0`
-   **Descrição:** O aumento percentual máximo de custo de gás permitido.
-   **Exemplo:** `threshold: 2.5`
-   **Comportamento:**
    -   Se `CustoNovo > CustoAntigo + (CustoAntigo * 0.025)`, a tarefa falha.
    -   Se o aumento estiver entre 0-2.5%, imprime um aviso mas passa.

### `strict`
-   **Tipo:** `boolean`
-   **Padrão:** `false`
-   **Descrição:** Sobrescreve o `threshold` para ser efetivamente zero.
-   **Comportamento:**
    -   Se `strict: true`, QUALQUER aumento no custo de gás (mesmo 1 unidade) causará falha na tarefa.
    -   Recomendado para codebases finalizadas ou checagens pré-auditoria.

### `outputFile`
-   **Tipo:** `string` (Caminho)
-   **Padrão:** `undefined` (Logs apenas no console)
-   **Descrição:** Se fornecido, o plugin escreverá a tabela de relatório neste arquivo (útil para artefatos de CI).
-   **Exemplo:** `outputFile: "reports/gas-diff.txt"`

### `exclude`
-   **Tipo:** `string[]` (Padrões Glob)
-   **Padrão:** `[]`
-   **Descrição:** Um array de padrões para ignorar durante a comparação. Suporta curinga `*`.
-   **Lógica de Match:** Compara contra o formato `NomeContrato:NomeMetodo`.
-   **Exemplos:**
    -   `["Mock*"]` - Ignora todos os contratos começando com "Mock".
    -   `["*:setup"]` - Ignora o método "setup" em todos os lugares.
    -   `["Token:mint"]` - Ignora especificamente a função `mint` do `Token`.

## Exemplo Completo de Configuração

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "hardhat-gas-track";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  gasTrack: {
    threshold: 1.0,           // Tolerância estrita de 1%
    strict: false,
    outputFile: "ci/gas.log",
    exclude: [
      "TestToken:*",          // Ignora contrato TestToken inteiro
      "*:injected_func",      // Ignora injected_func em todo lugar
    ]
  }
};

export default config;
```

---
[⬅️ Voltar: Workflow CI/CD](./04-workflow-ci.md) | [Avançar: Troubleshooting ➡️](./06-troubleshooting.md)
