# 01. Introdução ao hardhat-gas-track

## O Problema do Gás Invisível
Em protocolos DeFi e Smart Contracts complexos, otimização de gás é dinheiro. Um aumento de 5% no custo de uma transação pode significar milhares de dólares a mais pagos pelos usuários ao longo de um ano. Frequentemente, mudanças no código Solidity (como adicionar uma variável de estado ou mudar uma lógica de loop) introduzem regressões de gás silenciosas que passam despercebidas nos testes funcionais padrão.

## A Solução: Gas Regression Testing
**hardhat-gas-track** é uma ferramenta especializada para CI/CD que traz visibilidade e controle sobre os custos de execução dos seus contratos.

### Principais Funcionalidades:
- 📸 **Snapshots Automatizados:** Crie uma linha de base (baseline) dos custos aceitáveis.
- 🛡️ **Guarda de CI:** Bloqueie Pull Requests que aumentem o gás além de um limite aceitável.
- 📊 **Relatórios Detalhados:** Visualize exatamente qual função ficou mais cara e por quanto.

Este plugin foi desenhado para ser "Set and Forget". Configure uma vez no seu pipeline e garanta que seu protocolo permaneça eficiente para sempre.

---
[Avançar: Instalação ➡️](./02-installation.md)
