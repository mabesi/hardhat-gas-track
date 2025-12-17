# 02. Instalação e Configuração

## Pré-requisitos
- Node.js 18+
- Hardhat Project configurado

## Instalação

Como o pacote é um plugin de desenvolvimento, instale-o como `devDependencies`:

```bash
npm install --save-dev hardhat-gas-track
# ou
yarn add --dev hardhat-gas-track
```

## Configuração Básica

Adicione o plugin ao seu arquivo `hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-track"; // <--- Importe aqui

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  // Configuração opcional (valores padrão mostrados abaixo)
  gasTrack: {
    threshold: 5.0,     // Permite aumento de até 5%
    strict: false,      // Se true, qualquer aumento quebra o build
    exclude: ["Mock*"], // Ignora contratos que começam com Mock
  }
};

export default config;
```

## .gitignore

Para evitar que snapshots locais poluam o repositório se não desejado (embora seja recomendado comitá-los para CI), ou para ignorar arquivos temporários, garanta que seu `.gitignore` esteja configurado.

Se você deseja que o Snapshot seja a "verdade" compartilhada entre o time, **NÃO** ignore o `.gas-snapshot.json`. Comite-o no Git.

---
[⬅️ Voltar: Introdução](./01-introduction.md) | [Avançar: Conceitos Principais ➡️](./03-core-concepts.md)
