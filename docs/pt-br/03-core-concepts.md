# 03. Conceitos Principais e Arquitetura

Entender como o `hardhat-gas-track` processa seus dados é fundamental para dominá-lo.

## O Fluxo de Trabalho do Snapshot
O núcleo do sistema é o **Arquivo de Snapshot** (`.gas-snapshot.json`). Este arquivo representa o estado "aprovado" do consumo de gás dos seus contratos.

### Ciclo de Vida
1.  **Geração:** Quando você roda `npx hardhat gas:snapshot`, o plugin executa sua suíte de testes.
2.  **Coleta:** Ele se conecta ao provedor Ethereum para ouvir chamadas `eth_estimateGas` e recibos de transação.
3.  **Agregação:** Ele agrupa o uso de gás por `NomeContrato` e `NomeMetodo` (ou assinatura).
4.  **Armazenamento:** Os dados agregados (média de gás, min, max, contagem de chamadas) são salvos no arquivo JSON.

> **Nota:** O arquivo de snapshot **DEVE** ser comitado no seu sistema de controle de versão (Git). Ele permite que seu time compartilhe a mesma linha de base de desempenho.

## A Lógica de Comparação (`gas:track`)
Quando executado em modo de verificação (`npx hardhat gas:track`), o plugin realiza uma **Análise Diferencial Relativa**.

### Fórmula
$$
\text{Diff \%} = \left( \frac{\text{GásMédioNovo} - \text{GásMédioAntigo}}{\text{GásMédioAntigo}} \right) \times 100
$$

### Thresholds (Limiares) e Rigidez
-   **Threshold Suave (Padrão):** Um `threshold` de 5.0 significa que você permite que o gás flutue até 5% para cima. Isso é útil porque versões do compilador Solidity ou pequenos ajustes lógicos às vezes causam variações negligenciáveis de gás.
-   **Modo Estrito (Strict Mode):** Quando `strict: true` está ativado, o threshold é efetivamente **0%**. Qualquer aumento não-zero no custo de gás causará uma falha `exit(1)`. Isso é recomendado para auditorias cruciais ou releases finais.

## Lidando com "Chamadas"
O plugin rastreia o *número de chamadas* feitas a uma função.
-   **Por quê?** Para calcular uma média ponderada.
-   **Incompatibilidade:** Se sua nova suíte de testes chama uma função 100 vezes, mas o snapshot só tinha 10 chamadas, o plugin ainda compara o *Custo Médio por Chamada*. Isso torna a ferramenta robusta contra mudanças no tamanho da suíte de testes, desde que a *natureza* das chamadas permaneça similar.

## Exclusões
Às vezes você tem métodos auxiliares de teste (ex: `MintForTest`, `SetupWorld`) que são inerentemente pesados em gás e irrelevantes para produção. Você pode excluí-los usando padrões glob como `Helper:*` ou `*:test_setup` para manter seu relatório limpo e focado no código de produção.

---
[⬅️ Voltar: Instalação](./02-installation.md) | [Avançar: Workflow CI/CD ➡️](./04-workflow-ci.md)
