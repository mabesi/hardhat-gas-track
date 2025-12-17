# 06. Troubleshooting

Problemas comuns e como resolvê-los.

## 1. "Snapshot not found"
**Mensagem de Erro:**
> `Error: Snapshot not found. Run 'npx hardhat gas:snapshot' first.`

**Causa:**
Você está rodando a tarefa de verificação (`gas:track`) mas nenhum arquivo de baseline `.gas-snapshot.json` existe na raiz do projeto.

**Solução:**
Rode o comando de geração de snapshot para criar sua baseline inicial:
```bash
npx hardhat gas:snapshot
```

## 2. Funções Faltando no Relatório ("Mismatch")
**Sintoma:**
Você adicionou uma nova função `buyTokens`, mas `gas:track` não a está mostrando na tabela ou falhando.

**Causa:**
O motor de comparação apenas verifica itens que existem em **ambos**, no Snapshot e na Execução Atual. Se uma função é nova, ela não tem histórico para comparação.

**Solução:**
Atualize seu snapshot para incluir a nova função:
```bash
npx hardhat gas:snapshot
```

## 3. "Regression detected" persiste após otimização
**Sintoma:**
Você aumentou inadvertidamente o gás, viu o erro, corrigiu o código para ser otimizado novamente, mas ele ainda falha.

**Causa:**
Certifique-se de que está comparando contra a baseline correta. Se você atualizou a baseline para a versão "ruim" por engano, você pode estar comparando "bom" vs "ruim" invertido, ou vice-versa.

**Solução:**
1.  Reverta quaisquer mudanças acidentais ao `.gas-snapshot.json` via Git (`git checkout .gas-snapshot.json`).
2.  Rode `npx hardhat gas:track` novamente para verificar sua correção contra a baseline *original* (correta).

## 4. Valores de Gás Inconsistentes
**Sintoma:**
O uso de gás varia levemente entre execuções (ex: +/- 20 gás) causando falhas intermitentes em verificações estritas.

**Causa:**
Isso pode acontecer devido a:
-   Tamanhos de array variáveis nos testes.
-   Comportamento não-determinístico no setup de teste (ex: lógica dependente de `block.timestamp`).

**Solução:**
-   Garanta que seus testes sejam determinísticos. Use seeds fixas se usar randomizadores.
-   Aumente o `threshold` levemente (ex: `0.5`) ao invés de usar modo estrito (`strict: true`).

---
[⬅️ Voltar: Referência de Configuração](./05-configuration-reference.md)
