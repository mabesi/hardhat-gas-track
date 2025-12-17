# 02. Instalação e Configuração

## Pré-requisitos
Antes de começar, certifique-se de que seu ambiente de desenvolvimento atende aos seguintes requisitos:
- **Node.js**: v18.0.0 ou superior.
- **Hardhat**: v2.19.0 ou superior.
- **Gerenciador de Pacotes**: npm, yarn, pnpm, ou bun.

## Instalação

Instale o pacote como uma dependência de desenvolvimento (`devDependencies`). Ele é leve e não será incluído no build final do seu contrato.

### Usando Npm
```bash
npm install --save-dev hardhat-gas-track
```

### Usando Yarn
```bash
yarn add --dev hardhat-gas-track
```

## Configuração

### 1. Importe o Plugin
Abra seu `hardhat.config.ts` (ou `hardhat.config.js`) e importe o plugin. Isso adiciona automaticamente as tarefas `gas:snapshot` e `gas:track` ao seu ambiente.

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
// Importe o plugin aqui
import "hardhat-gas-track"; 

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  // ... resto da sua configuração
};

export default config;
```

### 2. Configure `hardhat-gas-reporter` (Obrigatório)
Este plugin depende do output gerado pelo `hardhat-gas-reporter`. Você deve instalá-lo e configurar para gerar JSON.

```bash
npm install --save-dev hardhat-gas-reporter
```

No seu `hardhat.config.ts`, verifique a configuração do reporter:

```typescript
{
  gasReporter: {
    enabled: true,
    outputJSON: true, // <--- CRITICO: O plugin lê este JSON
    outputFile: "gas-report.json"
  }
}
```

### 3. Personalizando Configurações (Opcional)
Embora o plugin funcione sem configuração extra, você pode personalizar a rigidez e exclusões através da propriedade `gasTrack` na sua configuração.

```typescript
const config: HardhatUserConfig = {
  solidity: "0.8.20",
  gasTrack: {
    threshold: 5.0,              // 5% de aumento permitido antes de aviso/falha
    strict: false,               // Defina como true para falhar com QUALQUER aumento
    outputFile: "gas-report.md", // Salva resultados em arquivo (útil para CI)
    exclude: [                   // Ignora contratos ou métodos específicos
      "Mock*", 
      "TestContract:setup"
    ]
  }
};
```

### 4. Verificar Instalação
Execute o seguinte comando para ver se as tarefas estão disponíveis:

```bash
npx hardhat help
```

Você deve ver `gas:snapshot` e `gas:track` listados sob as tarefas disponíveis.

---
[⬅️ Voltar: Introdução](./01-introduction.md) | [Avançar: Conceitos Principais ➡️](./03-core-concepts.md)
