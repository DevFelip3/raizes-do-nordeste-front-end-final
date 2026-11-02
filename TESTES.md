# Plano de testes da interface

Revisão de 18/10/2026. Estes cenários incluem entradas, passos e saídas esperadas. Os resultados esperados não são alegações de execução da interface.

## CT01 Cadastro válido

- Tipo: Positivo.
- Entrada e condição: Visitante; novo@exemplo.test; 123456.
- Passos: Criar conta de teste.
- Saída esperada: Conta criada e sessão demonstrativa iniciada.
- Execução da interface: pendente.

## CT02 Cadastro inválido

- Tipo: Negativo.
- Entrada e condição: E-mail real ou apelido de um caractere.
- Passos: Enviar cadastro.
- Saída esperada: Rejeitar com orientação; não criar conta.
- Execução da interface: pendente.

## CT03 Cadastro duplicado

- Tipo: Negativo.
- Entrada e condição: cliente@exemplo.test.
- Passos: Tentar cadastrar novamente.
- Saída esperada: Exibir endereço já cadastrado.
- Execução da interface: pendente.

## CT04 Login válido e inválido

- Tipo: Positivo e negativo.
- Entrada e condição: cliente@exemplo.test; senhas 000000 e 123456.
- Passos: Tentar ambos os acessos.
- Saída esperada: Negar a primeira tentativa e aceitar a segunda.
- Execução da interface: pendente.

## CT05 Saída da conta

- Tipo: Privacidade.
- Entrada e condição: Sessão ativa com carrinho.
- Passos: Sair e limpar sessão.
- Saída esperada: Encerrar acesso e apagar dados locais da demonstração.
- Execução da interface: pendente.

## CT06 Troca de unidade

- Tipo: Positivo e negativo.
- Entrada e condição: Carrinho em Recife.
- Passos: Trocar para João Pessoa, cancelar; depois confirmar.
- Saída esperada: Cancelar preserva; confirmar limpa carrinho e muda cardápio.
- Execução da interface: pendente.

## CT07 Unidade fechada

- Tipo: Negativo.
- Entrada e condição: Salvador.
- Passos: Tentar adicionar e finalizar.
- Saída esperada: Mostrar fechada; impedir compra.
- Execução da interface: pendente.

## CT08 Estoque e cozinha reduzida

- Tipo: Negativo.
- Entrada e condição: João Pessoa.
- Passos: Examinar bolo e cuscuz com carne.
- Saída esperada: Bolo esgotado; cuscuz de carne ausente.
- Execução da interface: pendente.

## CT09 Sazonalidade

- Tipo: Positivo e negativo.
- Entrada e condição: Outubro, controle junino desligado e ligado.
- Passos: Comparar canjica; desligar após adicionar.
- Saída esperada: Bloquear fora de junho e remover item fora de época.
- Execução da interface: pendente.

## CT10 Adicionais e total

- Tipo: Positivo.
- Entrada e condição: 2 cuscuzes de carne com queijo adicional.
- Passos: Adicionar ao carrinho.
- Saída esperada: Subtotal de R$ 50,80 e detalhes corretos.
- Execução da interface: pendente.

## CT11 Quantidade inválida

- Tipo: Negativo.
- Entrada e condição: Zero, fração ou quantidade acima do estoque.
- Passos: Tentar adicionar ou aumentar.
- Saída esperada: Impedir quantidade inválida, sem ultrapassar estoque.
- Execução da interface: pendente.

## CT12 Carrinho vazio

- Tipo: Negativo.
- Entrada e condição: Sem itens.
- Passos: Examinar botão de pagamento.
- Saída esperada: Botão desabilitado; nenhuma transação.
- Execução da interface: pendente.

## CT13 Aprovação

- Tipo: Positivo.
- Entrada e condição: Carrinho válido; provedor Aprovado.
- Passos: Confirmar pagamento.
- Saída esperada: Criar um pedido, descontar estoque e limpar carrinho.
- Execução da interface: pendente.

## CT14 Recusa

- Tipo: Negativo.
- Entrada e condição: Carrinho válido; provedor Recusado.
- Passos: Confirmar pagamento.
- Saída esperada: Exibir recusa e preservar carrinho, estoque e pontos.
- Execução da interface: pendente.

## CT15 Falha de comunicação

- Tipo: Negativo.
- Entrada e condição: Provedor Falha de comunicação.
- Passos: Confirmar e tentar novamente.
- Saída esperada: Exibir falha, preservar estado e permitir nova tentativa.
- Execução da interface: pendente.

## CT16 Envio duplicado

- Tipo: Negativo.
- Entrada e condição: Pagamento em processamento.
- Passos: Tentar clicar novamente ou fechar.
- Saída esperada: Bloquear controles durante espera; gerar um pedido.
- Execução da interface: pendente.

## CT17 Status e retirada

- Tipo: Positivo.
- Entrada e condição: Pedido aprovado.
- Passos: Aguardar 12 s e 30 s; confirmar recebimento.
- Saída esperada: Recebido, em preparo, pronto e concluído.
- Execução da interface: pendente.

## CT18 Acúmulo de pontos

- Tipo: Positivo.
- Entrada e condição: Adesão ativa; 5 cuscuzes de carne.
- Passos: Aprovar R$ 109,50.
- Saída esperada: Acumular 109 pontos apenas após a aprovação.
- Execução da interface: pendente.

## CT19 Resgate de pontos

- Tipo: Positivo.
- Entrada e condição: Saldo de 109; 2 cafés.
- Passos: Resgatar 100 pontos e aprovar.
- Saída esperada: Pagar R$ 6,80; ganhar 6 pontos; saldo final 15.
- Execução da interface: pendente.

## CT20 Revogação de fidelidade

- Tipo: Privacidade.
- Entrada e condição: Saldo existente.
- Passos: Revogar adesão e fazer novo pedido.
- Saída esperada: Apagar saldo e não acumular novos pontos.
- Execução da interface: pendente.

## CT21 Cupom válido

- Tipo: Positivo.
- Entrada e condição: Subtotal R$ 50; RAIZES10; Recife.
- Passos: Aplicar cupom.
- Saída esperada: Desconto de R$ 5 e total de R$ 45.
- Execução da interface: pendente.

## CT22 Cupom inválido

- Tipo: Negativo.
- Entrada e condição: Código errado, subtotal R$ 29,99 ou data expirada.
- Passos: Aplicar cupom.
- Saída esperada: Recusar e explicar o motivo.
- Execução da interface: pendente.

## CT23 Não cumulatividade

- Tipo: Regra de negócio.
- Entrada e condição: Pontos disponíveis e RAIZES10 aplicado.
- Passos: Examinar resgate e finalizar.
- Saída esperada: Somente desconto da campanha; não gastar pontos.
- Execução da interface: pendente.

## CT24 Canais

- Tipo: Usabilidade.
- Entrada e condição: Web, App, Totem e Balcão.
- Passos: Alternar e criar pedido.
- Saída esperada: Preservar fluxo; registrar canal; Totem ampliar botões.
- Execução da interface: pendente.

## CT25 Observação maliciosa

- Tipo: Segurança.
- Entrada e condição: Texto <img src=x onerror=alert(1)>.
- Passos: Adicionar produto com observação.
- Saída esperada: Exibir texto literal, sem executar HTML.
- Execução da interface: pendente.

## CT26 Persistência negada

- Tipo: Privacidade.
- Entrada e condição: Sem autorizar armazenamento.
- Passos: Adicionar item e recarregar.
- Saída esperada: Iniciar sessão vazia.
- Execução da interface: pendente.

## CT27 Persistência autorizada

- Tipo: Privacidade.
- Entrada e condição: Autorizar; adicionar item com observação.
- Passos: Recarregar página.
- Saída esperada: Restaurar carrinho sem a observação livre.
- Execução da interface: pendente.

## CT28 Excluir dados

- Tipo: Privacidade.
- Entrada e condição: Carrinho, pedidos e pontos existentes.
- Passos: Apagar meus dados locais e confirmar.
- Saída esperada: Limpar dados e restaurar demonstração.
- Execução da interface: pendente.

## CT29 Sugestões opcionais

- Tipo: Privacidade.
- Entrada e condição: Histórico com café; consentimento desmarcado.
- Passos: Marcar e depois desmarcar sugestões.
- Saída esperada: Mostrar e ocultar recomendação; campanha pública permanece.
- Execução da interface: pendente.

## CT30 Tela e teclado

- Tipo: Responsividade e acessibilidade.
- Entrada e condição: 320, 390, 768 e 1440 px; teclado.
- Passos: Navegar, abrir diálogos e usar Tab/Escape.
- Saída esperada: Sem corte horizontal; foco visível e diálogo operável.
- Execução da interface: pendente.

## Execução automatizada realizada

36 testes de regras de negócio e do serviço de autenticação demonstrativo aprovados. Comando: `node --test tests/*.test.js`. Relatório: `evidencias/testes-automatizados.tap`. Conferência de sintaxe e referências locais também executada.

Os campos `duration_ms` do relatório mostram o tempo de execução dos testes automatizados, registrado pelo Node.js em milissegundos. Nesta execução, o total foi de 117,94 ms (cerca de 0,12 s). Esse valor pode variar conforme o equipamento e as condições do ambiente; não inclui o tempo de elaboração dos testes nem a validação manual.

Foi feita uma conferência inicial do site publicado. Os 30 cenários de interação, teclado e responsividade ainda aguardam execução sistemática e registro de evidências.
