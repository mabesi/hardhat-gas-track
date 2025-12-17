# 01. Introdução ao Hardhat Gas Track

## O Assassino Silencioso dos Protocolos DeFi
No mundo do desenvolvimento blockchain, a otimização de gás não é apenas "algo legal de se ter"—é um fator econômico crítico. Um contrato inteligente que consome 5% mais gás que seu concorrente pode resultar em **milhões de dólares** em valor perdido pelos usuários ao longo da vida do protocolo.

Diferente de bugs funcionais, **regressões de gás são silenciosas**. Uma pequena mudança em um loop `for`, a troca de uma variável de estado, ou a ordenação incorreta de membros de uma struct podem instantaneamente aumentar os custos de transação sem quebrar nenhum teste.

## O que é Hardhat Gas Track?
**Hardhat Gas Track** é um plugin focado no desenvolvedor, desenhado para integrar perfeitamente ao seu fluxo de trabalho no Hardhat. Ele atua como um guardião financeiro para sua base de código.

### Filosofia Central
1.  **Visibilidade:** Você não pode otimizar o que não mede.
2.  **Responsabilidade:** Todo Pull Request deve justificar seu impacto no gás.
3.  **Automação:** Verificação manual é propensa a erros; o CI/CD deve cuidar disso.

### Principais Funcionalidades
- **📸 Snapshots Automatizados:** Gere um "Snapshot" (retrato) do desempenho do seu contrato a qualquer momento.
- **🛡️ Guarda de Regressão:** Defina limites estritos ou flexíveis (ex: "falhe se o gás aumentar mais de 5%").
- **🔍 Rastreamento Granular:** Acompanhe custos no nível do método (ex: `Token:transfer` vs `Token:approve`).
- **🔌 Configuração Zero:** Funciona "out of the box" com padrões sensatos, mas é totalmente configurável.

### Por que não usar apenas o `hardhat-gas-reporter`?
O `hardhat-gas-reporter` é excelente para ver o custo de uma *única* execução. **Hardhat Gas Track** foca no **delta** (variação) entre execuções. Ele responde à pergunta: *"Meu último commit tornou o protocolo mais caro?"*

---
[Avançar: Instalação e Configuração ➡️](./02-installation.md)
