# 03. Conceitos Principais

Entenda como o `hardhat-gas-track` toma decisões.

## 1. O Snapshot (`.gas-snapshot.json`)
O Snapshot é um arquivo JSON que atua como a "verdade imutável" sobre os custos do seu sistema em um determinado momento. Ele mapeia `Contrato:funcao` para métricas de gás.

**Exemplo:**
```json
{
  "Token:transfer": { "gas": 21000, "calls": 50 }
}
```
Isso diz: "Historicamente, a função `transfer` do `Token` custa em média 21.000 gas".

## 2. Threshold (Limiar de Tolerância)
Em desenvolvimento, pequenas flutuações de gás podem ocorrer devido a mudanças no compilador ou otimizador. O `threshold` define a tolerância para essas mudanças.

- **Threshold = 5.0% (Padrão):** Se o novo custo for 22.000 (+4.7%), o teste PASSA (com aviso). Se for 23.000 (+9.5%), falha.
- **Strict Mode:** Threshold é ignorado. Qualquer aumento > 0 falha o teste.

## 3. Comparação Relativa
O plugin calcula a diferença baseada na média (Total Gás / Número de Chamadas). Isso normaliza os testes, permitindo comparar execuções com número diferente de chamadas, desde que a lógica da função seja a mesma.

---
[⬅️ Voltar: Instalação](./02-installation.md) | [Avançar: Workflow CI/CD ➡️](./04-workflow-ci.md)
