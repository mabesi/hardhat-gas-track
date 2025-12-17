# 06. Troubleshooting

Soluções para problemas comuns.

## "Snapshot not found"
**Erro:** `Error: Snapshot not found. Run 'npx hardhat gas:snapshot' first.`
**Causa:** Você está tentando rodar `gas:track` (verificação) sem ter uma linha de base.
**Solução:** Execute `npx hardhat gas:snapshot` para gerar o arquivo `.gas-snapshot.json` inicial.

## "Mismatch methods" (Métodos faltando)
Se novos métodos foram adicionados no contrato mas não existem no snapshot, eles são ignorados na comparação (pois não há base para comparar).
**Dica:** Sempre atualize o snapshot ao adicionar novas funcionalidades críticas.

## Altos custos de "deploy"
Se o custo de deploy parecer incorreto, verifique se você não está incluindo scripts de migração complexos nos seus testes. O `gas-track` captura o que o provedor Ethereum reporta.

---
[⬅️ Voltar: Referência de Configuração](./05-configuration-reference.md)
