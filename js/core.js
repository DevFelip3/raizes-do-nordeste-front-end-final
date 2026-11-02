/* Regras puras do domínio, independentes do HTML. Os testes usam estas funções.
 * Estoque, pagamento e pontuação são demonstrativos; produção exige validação no servidor. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./data.js'));
  else root.RaizesCore = factory(root.RaizesData);
}(typeof globalThis !== 'undefined' ? globalThis : this, function (data) {
  'use strict';
  const product = id => data.products.find(p => p.id === id);
  const unit = id => data.units.find(u => u.id === id);
  const extra = id => data.extras.find(e => e.id === id);
  const money = cents => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  function initialStock() {
    const stock = {};
    data.units.forEach(u => { stock[u.id] = {}; data.products.forEach(p => { stock[u.id][p.id] = p.stocks[u.id] || 0; }); });
    return stock;
  }
  function inSeason(p, june = false, date = new Date()) {
    return !p.months || p.months.includes(june ? 6 : date.getMonth() + 1);
  }
  function quantityInCart(cart, id) { return cart.filter(i => i.productId === id).reduce((sum, i) => sum + i.quantity, 0); }
  function linePrice(item) {
    const p = product(item.productId);
    if (!p) throw new Error('Produto desconhecido.');
    return p.price + item.extraIds.reduce((sum, id) => {
      if (!p.extras.includes(id) || !extra(id)) throw new Error('Adicional inválido.');
      return sum + extra(id).price;
    }, 0);
  }
  function totals(cart, points, redeem, enrolled, campaignDiscount = 0) {
    const subtotal = cart.reduce((sum, item) => sum + linePrice(item) * item.quantity, 0);
    const promotional = Math.min(subtotal, Math.max(0, Number.isInteger(campaignDiscount) ? campaignDiscount : 0));
    const pointsSpent = !promotional && redeem && enrolled && points >= 100 && subtotal >= 500 ? 100 : 0;
    const discount = promotional || (pointsSpent ? 500 : 0);
    return { subtotal, discount, total: subtotal - discount, pointsSpent, pointsEarned: enrolled ? Math.floor((subtotal - discount) / 100) : 0 };
  }
  function validateCart(cart, unitId, stock, june = false) {
    if (!unit(unitId)?.open) return 'A unidade está fechada. Selecione uma unidade aberta.';
    if (!cart.length) return 'Adicione um produto ao pedido.';
    for (const item of cart) {
      const p = product(item.productId);
      if (!p || !p.units.includes(unitId)) return 'Um produto não está disponível nesta unidade.';
      if (!inSeason(p, june)) return `${p.name} está fora de temporada.`;
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) return 'Quantidade inválida (limite de 20 por opção).';
      if (!Array.isArray(item.extraIds) || new Set(item.extraIds).size !== item.extraIds.length || item.extraIds.some(id => !p.extras.includes(id))) return 'Adicional inválido.';
      if (quantityInCart(cart, p.id) > (stock[unitId]?.[p.id] || 0)) return `Estoque insuficiente para ${p.name}.`;
    }
    return '';
  }
  // Cada linha agrupa apenas opções e observações idênticas.
  function itemKey(id, extras, note) { return JSON.stringify([id, [...extras].sort(), note.trim()]); }
  function stage(order, now = Date.now()) {
    if (order.collected) return 3;
    const elapsed = Math.max(0, now - order.createdAt);
    return elapsed < 12000 ? 0 : elapsed < 30000 ? 1 : 2;
  }
  // Campanha pública com valor mínimo, teto, unidade e validade explícitos.
  function promotion(subtotal, code, unitId, date = new Date()) {
    const p = data.campaign;
    if (String(code).trim().toUpperCase() !== p.code) return { valid: false, discount: 0, message: 'Cupom inválido.' };
    const day = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
    if (day < p.from || day > p.until) return { valid: false, discount: 0, message: 'Campanha fora do período de validade.' };
    if (!p.units.includes(unitId)) return { valid: false, discount: 0, message: 'Cupom indisponível nesta unidade.' };
    if (subtotal < p.minimum) return { valid: false, discount: 0, message: 'Este cupom exige subtotal de pelo menos R$ 30,00.' };
    return { valid: true, discount: Math.min(p.cap, Math.floor(subtotal * p.percent / 100)), message: 'Cupom aplicado.' };
  }
  return { promotion, product, unit, extra, money, initialStock, inSeason, quantityInCart, linePrice, totals, validateCart, itemKey, stage };
}));
