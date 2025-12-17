# Hardhat Gas Track

![Banner](./banner.png)

![NPM Version](https://img.shields.io/npm/v/hardhat-gas-track)
![License](https://img.shields.io/npm/l/hardhat-gas-track)

Prevenção automatizada de regressão de gás para Smart Contracts. Integre ao seu CI e nunca mais deixe um update caro passar despercebido.

## Quick Start (3 Passos)

1. **Instale:**
   ```bash
   npm install --save-dev hardhat-gas-track
   ```

2. **Configure (`hardhat.config.ts`):**
   ```typescript
   import "hardhat-gas-track";
   import "hardhat-gas-reporter";
   
   export default {
     gasReporter: {
       enabled: true,
       outputJSON: true,
       outputFile: "gas-report.json"
     }
   };
   ```

3. **Use:**
   - Crie a baseline: `npx hardhat gas:snapshot`
   - Verifique mudanças: `npx hardhat gas:track`

## Documentação

📚 **[Acesse a Documentação Completa](./docs/pt-br/01-introduction.md)**

Para detalhes sobre configuração avançada, CI/CD e troubleshooting, consulte o guia acima.

## 📄 License

This project is licensed under the [MIT License](LICENSE).