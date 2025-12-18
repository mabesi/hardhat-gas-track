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

## 📚 Projeto de Exemplo

Quer ver o `hardhat-gas-track` em ação? Confira nosso projeto de exemplo completo!

O **[Exemplo de Sistema de Leilões](./example)** demonstra:
- ✅ Integração de ambos `hardhat-gas-reporter` e `hardhat-gas-track`
- ✅ Técnicas de otimização de gás do mundo real (padrões Pull vs Push, operações em lote, empacotamento de storage)
- ✅ Suite de testes completa com comparações de gás mensuráveis
- ✅ Implementações de leilões Inglês e Holandês
- ✅ Padrão Factory para deployment eficiente

**[→ Ver Documentação do Exemplo](./example/README.md)**

## Documentação

📚 **[Acesse a Documentação Completa](./docs/pt-br/01-introduction.md)**

Para detalhes sobre configuração avançada, CI/CD e troubleshooting, consulte o guia acima.

## 📄 License

This project is licensed under the [MIT License](LICENSE).