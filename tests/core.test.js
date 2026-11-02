/* Testes de regras de negócio. Execute na raiz: node --test tests/core.test.js */
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../js/core.js');
const item = (productId = 'cafe', quantity = 1, extraIds = []) => ({ productId, quantity, extraIds, note: '' });

test('moeda usa centavos e formato brasileiro', () => assert.match(C.money(2190), /21,90/));
test('adicionais compõem o preço da unidade do produto', () => assert.equal(C.linePrice(item('cuscuz-sol', 1, ['queijo', 'carne'])), 3140));
test('subtotal multiplica adicionais e quantidade sem arredondamentos', () => assert.equal(C.totals([item('cuscuz-sol', 2, ['queijo'])], 0, false, false).total, 5080));
test('sem consentimento não há ganho nem resgate de pontos', () => {
  const t = C.totals([item('cafe', 2)], 100, true, false);
  assert.equal(t.discount, 0); assert.equal(t.pointsEarned, 0); assert.equal(t.pointsSpent, 0);
});
test('resgate desconta 500 centavos e consome exatamente 100 pontos', () => {
  const t = C.totals([item('cafe', 2)], 100, true, true);
  assert.equal(t.total, 680); assert.equal(t.pointsSpent, 100); assert.equal(t.pointsEarned, 6);
});
test('saldo insuficiente não produz desconto', () => assert.equal(C.totals([item()], 99, true, true).discount, 0));
test('carrinho vazio é impedido', () => assert.match(C.validateCart([], 'recife', C.initialStock()), /Adicione/));
test('unidade fechada impede pedido', () => assert.match(C.validateCart([item()], 'salvador', C.initialStock()), /fechada/));
test('produto incompatível com unidade é rejeitado', () => assert.match(C.validateCart([item('cuscuz-sol')], 'joao-pessoa', C.initialStock()), /unidade/));
test('estoque soma linhas distintas do mesmo produto', () => {
  const stock = C.initialStock(); stock.recife['cuscuz-sol'] = 2;
  assert.match(C.validateCart([item('cuscuz-sol', 2), item('cuscuz-sol', 1, ['queijo'])], 'recife', stock), /Estoque insuficiente/);
});
test('produto esgotado é rejeitado', () => assert.match(C.validateCart([item('bolo')], 'joao-pessoa', C.initialStock()), /Estoque/));
test('quantidade fracionária e quantidade acima de 20 são rejeitadas', () => {
  assert.match(C.validateCart([item('cafe', 1.5)], 'recife', C.initialStock()), /Quantidade/);
  assert.match(C.validateCart([item('cafe', 21)], 'recife', C.initialStock()), /Quantidade/);
});
test('adicional não permitido e adicional duplicado são rejeitados', () => {
  assert.match(C.validateCart([item('cafe', 1, ['carne'])], 'recife', C.initialStock()), /Adicional/);
  assert.match(C.validateCart([item('tapioca-queijo', 1, ['queijo', 'queijo'])], 'recife', C.initialStock()), /Adicional/);
});
test('sazonalidade usa calendário e admite demonstração junina', () => {
  const p = C.product('canjica');
  assert.equal(C.inSeason(p, false, new Date(2026, 9, 7)), false);
  assert.equal(C.inSeason(p, false, new Date(2026, 5, 7)), true);
  assert.equal(C.inSeason(p, true, new Date(2026, 9, 7)), true);
});
test('agrupamento ignora ordem dos adicionais, preserva observações', () => {
  assert.equal(C.itemKey('x', ['a', 'b'], 'sem sal'), C.itemKey('x', ['b', 'a'], ' sem sal '));
  assert.notEqual(C.itemKey('x', [], 'sem sal'), C.itemKey('x', [], ''));
});
test('pedido percorre etapas e só conclui após recebimento', () => {
  const order = { createdAt: 1000, collected: false };
  assert.equal(C.stage(order, 1001), 0); assert.equal(C.stage(order, 13000), 1);
  assert.equal(C.stage(order, 31000), 2); order.collected = true; assert.equal(C.stage(order, 31000), 3);
});
test('estoques de unidades e de sessões são independentes', () => {
  const first = C.initialStock(), second = C.initialStock();
  first.recife.cafe--;
  assert.equal(second.recife.cafe, 30); assert.equal(first['joao-pessoa'].cafe, 20);
});
