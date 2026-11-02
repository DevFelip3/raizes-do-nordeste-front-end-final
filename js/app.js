/* Controlador da interface. O DOM é atualizado a partir de um único estado.
 * Este arquivo não faz chamadas HTTP: todas as integrações são demonstrativas.
 * Referências: docs/REFERENCIAS.md e assets/CREDITOS.md.
 * Não confie em localStorage para segurança, autenticação ou saldo real. */
(function () {
  'use strict';
  const D = window.RaizesData, C = window.RaizesCore;
  const $ = selector => document.querySelector(selector);
  const auth = window.RaizesAuth.createService();
  const STORAGE_KEY = 'raizes-prototipo-v1';
  const labels = ['Pedido recebido', 'Em preparo', 'Pronto para retirada', 'Concluído'];
  const channelNames = { web: 'Web', app: 'App', totem: 'Totem', balcao: 'Balcão' };
  let state = freshState(), category = 'Todos', search = '', pendingUnit = '', currentProduct = '';
  let busy = false, toastTimer, activeView = 'cardapio', lastOrderStages = '';

  function freshState() {
    return { unitId: 'recife', channel: 'web', cart: [], stock: C.initialStock(), orders: [], points: 0, enrolled: false, persist: false, redeem: false, june: false, coupon: '', marketing: false, audit: [] };
  }
  // Escapa qualquer texto inserido em HTML, incluindo observações digitadas pelo usuário.
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function toast(message) {
    $('#toast').textContent = message; $('#toast').hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 3600);
  }
  function log(event) {
    state.audit.unshift({ time: Date.now(), event });
    state.audit = state.audit.slice(0, 25);
  }
  // Observações não são persistidas. Nenhum nome, contato ou dado de cartão é coletado.
  function save() {
    const requestedPersistence = state.persist;
    try {
      if (!state.persist) { localStorage.removeItem(STORAGE_KEY); return; }
      const copy = JSON.parse(JSON.stringify(state));
      const stripNote = item => { item.note = ''; item.key = C.itemKey(item.productId, item.extraIds, ''); return item; };
      copy.marketing = false; // Recomendações personalizadas são restritas à sessão.
      copy.cart = copy.cart.map(stripNote);
      copy.orders.forEach(order => { order.items = order.items.map(stripNote); });
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, state: copy }));
    } catch (_) {
      state.persist = false;
      if (requestedPersistence) toast('O navegador bloqueou o armazenamento. Você pode continuar nesta sessão.');
    }
  }
  // Validação defensiva de dados locais antigos ou danificados antes de usá-los na interface.
  function restore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.version !== 1 || saved.state.persist !== true) throw new Error('Versão inválida');
      const s = saved.state;
      if (!C.unit(s.unitId) || !channelNames[s.channel] || typeof s.enrolled !== 'boolean' || !Number.isInteger(s.points) || s.points < 0 || s.points > 1000000) throw new Error('Preferências inválidas');
      function validItem(item) {
        const p = C.product(item.productId);
        return p && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 20 && Array.isArray(item.extraIds) && item.extraIds.every(id => p.extras.includes(id)) && new Set(item.extraIds).size === item.extraIds.length;
      }
      if (!Array.isArray(s.cart) || s.cart.length > 100 || !s.cart.every(validItem) || !Array.isArray(s.orders) || s.orders.length > 100) throw new Error('Carrinho inválido');
      for (const u of D.units) for (const p of D.products) {
        const quantity = s.stock?.[u.id]?.[p.id];
        if (!Number.isInteger(quantity) || quantity < 0 || quantity > (p.stocks[u.id] || 0)) throw new Error('Estoque inválido');
      }
      for (const o of s.orders) {
        if (typeof o.id !== 'string' || o.id.length > 40 || !/^R\d{4}$/.test(o.code) || !C.unit(o.unitId) || !channelNames[o.channel] || !['pix', 'card'].includes(o.payment) || !['pickup', 'local'].includes(o.fulfillment) || typeof o.collected !== 'boolean' || !Number.isFinite(o.createdAt) || !Array.isArray(o.items) || o.items.length > 100 || !o.items.every(validItem) || !Number.isInteger(o.total) || o.total < 0 || !Number.isInteger(o.discount) || o.discount < 0 || !Number.isInteger(o.pointsEarned) || o.pointsEarned < 0) throw new Error('Pedido inválido');
      }
      state = { ...freshState(), unitId: s.unitId, channel: s.channel, points: s.enrolled ? s.points : 0, enrolled: s.enrolled, persist: true, june: s.june === true, stock: s.stock, cart: s.cart, orders: s.orders, coupon: typeof s.coupon === 'string' && s.coupon === D.campaign.code ? s.coupon : '' };
      state.cart.forEach(item => { item.note = ''; item.key = C.itemKey(item.productId, item.extraIds, ''); });
      if (state.cart.length && C.validateCart(state.cart, state.unitId, state.stock, state.june)) state.cart = [];
      log('Sessão demonstrativa restaurada.');
    } catch (_) {
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) { /* Continuação em memória. */ }
      state = freshState(); toast('Os dados locais eram incompatíveis. Iniciamos uma nova demonstração.');
    }
  }
  function cartTotals() {
    const subtotal = C.totals(state.cart, 0, false, false).subtotal;
    const campaign = state.coupon ? C.promotion(subtotal, state.coupon, state.unitId) : { discount: 0 };
    return C.totals(state.cart, state.points, state.redeem, state.enrolled, campaign.discount);
  }
  function foodPhoto(p, className = '') {
    return `<img class="food-photo ${className}" src="${escape(p.image)}" alt="Imagem ilustrativa de ${escape(p.name)}" loading="lazy" decoding="async">`;
  }
  function showView(view, focus = false) {
    if (!['cardapio', 'pedidos', 'fidelidade', 'promocoes', 'conta'].includes(view)) view = 'cardapio';
    activeView = view;
    document.querySelectorAll('.view').forEach(el => { el.hidden = el.id !== `view-${view}`; });
    document.querySelectorAll('[data-view]').forEach(button => {
      const selected = button.dataset.view === view;
      button.classList.toggle('active', selected);
      if (selected) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    });
    $('#mobile-cart').hidden = !state.cart.length || view !== 'cardapio';
    if (focus) { $('#main').focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  }
  function renderContext() {
    $('#unit-select').innerHTML = D.units.map(u => `<option value="${u.id}">${escape(u.name)}</option>`).join('');
    $('#unit-select').value = state.unitId;
    $('#channel-select').value = state.channel;
    document.body.dataset.channel = state.channel;
    const u = C.unit(state.unitId);
    $('#unit-status').textContent = u.open ? `Aberta • ${u.hours}` : 'Fechada neste cenário';
    $('#unit-status').classList.toggle('closed', !u.open);
    $('#menu-subtitle').textContent = `${u.region} • Unidade com cozinha ${u.kitchen}`;
    $('#cart-unit').textContent = `${u.name} • Retirada na loja`;
    $('#june-toggle').checked = state.june;
  }
  function renderMenu() {
    $('#categories').innerHTML = D.categories.map(name => `<button class="category-button" data-category="${name}" aria-pressed="${category === name}">${name}</button>`).join('');
    const products = D.products.filter(p => p.units.includes(state.unitId) && (category === 'Todos' || p.category === category) && normalize(`${p.name} ${p.description}`).includes(normalize(search)));
    $('#menu-results').textContent = `${products.length} ${products.length === 1 ? 'produto' : 'produtos'} nesta seleção`;
    $('#products').innerHTML = products.length ? products.map(p => {
      const seasonal = C.inSeason(p, state.june);
      const remaining = state.stock[state.unitId][p.id] - C.quantityInCart(state.cart, p.id);
      const unavailable = !seasonal || remaining <= 0 || !C.unit(state.unitId).open;
      const badge = !seasonal ? 'Fora de temporada' : remaining <= 0 ? 'Esgotado' : p.tag;
      return `<article class="product-card"><div class="product-image">${foodPhoto(p)}${badge ? `<span class="product-tag ${unavailable ? 'unavailable' : ''}">${badge}</span>` : ''}</div><div class="product-content"><h3>${p.name}</h3><p>${p.description}</p><div class="product-bottom"><strong>${C.money(p.price)}</strong><button class="add-button" data-product="${p.id}" ${unavailable ? 'disabled' : ''} aria-label="Adicionar ${p.name}">${unavailable ? 'Indisponível' : '+ Adicionar'}</button></div><span class="stock-hint">${seasonal ? `${Math.max(0, remaining)} disponíveis na unidade` : 'Disponível somente em junho'}</span></div></article>`;
    }).join('') : '<div class="empty"><span class="empty-symbol" aria-hidden="true">⌕</span><h3>Nenhum sabor por aqui</h3><p>Tente outra busca ou categoria.</p></div>';
  }
  function renderCart() {
    const quantity = state.cart.reduce((n, i) => n + i.quantity, 0), t = cartTotals();
    $('#cart-count').textContent = quantity;
    $('#cart-items').innerHTML = state.cart.length ? state.cart.map((item, index) => {
      const p = C.product(item.productId);
      const details = [...item.extraIds.map(id => C.extra(id).name), item.note].filter(Boolean).join(' • ');
      return `<div class="cart-line"><h3>${p.name}</h3>${details ? `<p class="line-detail">${escape(details)}</p>` : ''}<div class="cart-line-bottom"><div class="quantity-control"><button data-quantity="-1" data-index="${index}" aria-label="Diminuir ${p.name}">−</button><span>${item.quantity}</span><button data-quantity="1" data-index="${index}" aria-label="Aumentar ${p.name}" ${item.quantity >= 20 || C.quantityInCart(state.cart, p.id) >= state.stock[state.unitId][p.id] ? 'disabled' : ''}>+</button></div><strong>${C.money(C.linePrice(item) * item.quantity)}</strong></div><button class="remove-line" data-remove="${index}">Remover ${p.name}</button></div>`;
    }).join('') : '<div class="empty"><span class="empty-symbol" aria-hidden="true">♧</span><h3>Tem espaço para um sabor</h3><p>Escolha seus favoritos no cardápio. A gente prepara com carinho.</p></div>';
    $('#cart-totals').innerHTML = state.cart.length ? `${state.enrolled ? `<div class="redeem-row"><label class="check-row"><input type="checkbox" id="redeem-points" ${state.redeem ? 'checked' : ''} ${state.points < 100 || t.subtotal < 500 || state.coupon ? 'disabled' : ''}><span>Usar 100 pontos por R$ 5 de desconto<br><small>Seu saldo: ${state.points} pontos</small></span></label></div>` : ''}<div class="total-row"><span>Subtotal</span><span>${C.money(t.subtotal)}</span></div>${t.discount ? `<div class="total-row discount"><span>${state.coupon ? 'Desconto da campanha' : 'Desconto Clube Raízes'}</span><span>− ${C.money(t.discount)}</span></div>` : ''}<div class="total-row grand-total"><span>Total</span><span>${C.money(t.total)}</span></div>` : '';
    $('#checkout-open').disabled = Boolean(C.validateCart(state.cart, state.unitId, state.stock, state.june)) || busy;
    $('#mobile-cart-count').textContent = `${quantity} ${quantity === 1 ? 'item' : 'itens'}`;
    $('#mobile-cart-total').textContent = C.money(t.total);
    $('#mobile-cart').hidden = !quantity || activeView !== 'cardapio';
    $('#coupon-form').hidden = !state.cart.length;
    $('#coupon-remove').hidden = !state.coupon;
    $('#coupon-feedback').textContent = state.coupon ? C.promotion(t.subtotal, state.coupon, state.unitId).message : '';
    $('#coupon-code').value = state.coupon;
  }
  function renderOrders() {
    const active = state.orders.filter(o => !o.collected).length;
    $('#order-count').hidden = !active; $('#order-count').textContent = active;
    $('#orders-list').innerHTML = state.orders.length ? [...state.orders].reverse().map(order => {
      const stage = C.stage(order);
      const orderLabels = [...labels];
      if (order.fulfillment === 'local') orderLabels[2] = 'Pronto para servir';
      return `<article class="order-card"><div class="order-header"><div><h2>Pedido ${escape(order.code)}</h2><p class="order-meta">${escape(C.unit(order.unitId).name)} • ${channelNames[order.channel]}<br>${new Date(order.createdAt).toLocaleString('pt-BR')} • ${order.payment === 'pix' ? 'Pix' : 'Cartão'} aprovado (simulação)</p></div><span class="order-status">${orderLabels[stage]}</span></div><div class="order-summary">${order.items.map(i => `<span><span>${i.quantity}× ${C.product(i.productId).name}${i.extraIds.length ? ` + ${i.extraIds.map(id => C.extra(id).name).join(', ')}` : ''}</span><b>${C.money(C.linePrice(i) * i.quantity)}</b></span>`).join('')}<span><span>Desconto</span><b>${C.money(order.discount)}</b></span><span><strong>Total pago (simulado)</strong><strong>${C.money(order.total)}</strong></span></div><ol class="timeline" aria-label="Etapas do pedido">${orderLabels.map((label, i) => `<li class="${i <= stage ? 'done' : ''} ${i === stage ? 'current' : ''}" ${i === stage ? 'aria-current="step"' : ''}>${label}</li>`).join('')}</ol><div class="order-actions"><div class="pickup-code">${order.fulfillment === 'pickup' ? 'Seu código de retirada' : 'Seu código para atendimento'}<strong>${escape(order.code)}</strong></div>${stage === 2 ? `<button class="button primary" data-collect="${escape(order.id)}">Confirmar recebimento</button>` : `<span class="small">${stage === 3 ? 'Obrigado pela visita! ♡' : 'Preparação simulada: pronto em até 30 segundos.'}</span>`}</div></article>`;
    }).join('') : '<div class="surface empty"><span class="empty-symbol" aria-hidden="true">✧</span><h3>Seu próximo pedido começa aqui</h3><p>Depois do pagamento aprovado, você acompanha seu pedido nesta tela.</p><button class="button primary" data-view="cardapio">Escolher meu sabor</button></div>';
    lastOrderStages = state.orders.map(o => `${o.id}:${C.stage(o)}`).join('|');
  }
  function renderPrivacy() {
    $('#points').textContent = state.points;
    $('#loyalty-consent').checked = state.enrolled;
    $('#loyalty-status').textContent = state.enrolled ? 'Você participa do clube. Os próximos pedidos aprovados acumulam pontos.' : 'Você ainda não aderiu. A adesão não é necessária para fazer pedidos.';
    $('#loyalty-revoke').hidden = !state.enrolled;
    $('#storage-consent').checked = state.persist;
    $('#storage-status').textContent = state.persist ? 'Armazenamento local autorizado. Você pode desativá-lo a qualquer momento.' : 'Armazenamento desativado. Os dados desta sessão desaparecem ao recarregar a página.';
  }
  function renderAudit() {
    $('#audit-log').innerHTML = `<h3>Registro demonstrativo de eventos</h3><p>Registro local sem identificação pessoal; não substitui uma auditoria de servidor.</p><ul class="audit-list">${state.audit.map(a => `<li>${new Date(a.time).toLocaleTimeString('pt-BR')} — ${escape(a.event)}</li>`).join('') || '<li>Nenhum evento nesta sessão.</li>'}</ul>`;
  }
  function renderAccount() {
    const profile = auth.current();
    $('#account-button').textContent = profile ? 'Minha conta' : 'Entrar';
    $('#account-forms').hidden = Boolean(profile); $('#account-session').hidden = !profile;
    $('#account-session').innerHTML = profile ? `<h2>Olá, ${escape(profile.alias)}</h2><p>Acesso demonstrativo ativo para ${escape(profile.email)}.</p><p class="small">Nenhum dado desta conta é persistido. Ao sair, carrinho, pedidos e pontos são apagados para proteger a próxima sessão.</p><button id="logout-button" class="button secondary">Sair e limpar sessão</button>` : '';
    $('#marketing-consent').checked = state.marketing;
    $('#marketing-status').textContent = state.marketing ? 'Sugestões desta sessão ativadas. Desmarque para revogar.' : 'Sugestões personalizadas desativadas. A campanha pública continua disponível.';
    const hasCoffee = state.orders.some(o => o.items.some(i => i.productId === 'cafe'));
    $('#campaign-recommendation').innerHTML = state.marketing ? `<p>${hasCoffee ? 'Você pediu café nesta sessão. Experimente combinar com uma tapioca na campanha RAIZES10.' : 'Experimente os sabores da casa com o cupom público RAIZES10, conforme as condições da campanha.'}</p>` : '';
  }
  function render() { renderContext(); renderMenu(); renderCart(); renderOrders(); renderPrivacy(); renderAudit(); renderAccount(); }

  function openProduct(id) {
    const p = C.product(id);
    if (!p || busy || !C.inSeason(p, state.june) || !C.unit(state.unitId).open) return;
    currentProduct = id;
    const remaining = Math.min(20, state.stock[state.unitId][id] - C.quantityInCart(state.cart, id));
    if (remaining < 1) return toast('Produto sem estoque disponível.');
    $('#product-detail').innerHTML = `${foodPhoto(p, 'dialog-product-image')}<span class="eyebrow">${p.category}</span><h2 id="product-dialog-title">${p.name}</h2><p>${p.description}</p><strong>${C.money(p.price)}</strong><p class="allergen">${p.allergens} Consulte a unidade em caso de alergia ou restrição alimentar.</p>${p.extras.length ? `<fieldset class="extras"><legend>Deixe do seu jeito (opcional)</legend>${p.extras.map(id => `<label class="check-row"><input type="checkbox" name="extra" value="${id}"><span>${C.extra(id).name}<b>+ ${C.money(C.extra(id).price)}</b></span></label>`).join('')}</fieldset>` : ''}<label class="field">Quantidade (até ${remaining})<input name="quantity" type="number" value="1" min="1" max="${remaining}" required></label><label class="field">Observação (opcional)<textarea name="note" maxlength="120" placeholder="Ex.: sem manteiga. Não inclua dados pessoais."></textarea></label>`;
    updateProductPrice(); $('#product-dialog').showModal();
  }
  function readProductForm() {
    const form = new FormData($('#product-form'));
    return { productId: currentProduct, extraIds: form.getAll('extra').sort(), quantity: Number(form.get('quantity')), note: String(form.get('note') || '').trim().slice(0, 120) };
  }
  function updateProductPrice() {
    if (!currentProduct) return;
    const item = readProductForm();
    $('#product-add').textContent = `Adicionar • ${C.money(C.linePrice(item) * Math.max(1, item.quantity || 1))}`;
  }
  function addProduct(event) {
    event.preventDefault(); if (busy) return;
    const item = readProductForm();
    if (!Number.isInteger(item.quantity) || item.quantity < 1) return toast('Informe uma quantidade válida.');
    item.key = C.itemKey(item.productId, item.extraIds, item.note);
    const existing = state.cart.find(i => i.key === item.key);
    const candidate = state.cart.map(i => ({ ...i }));
    if (existing) candidate.find(i => i.key === item.key).quantity += item.quantity; else candidate.push(item);
    const error = C.validateCart(candidate, state.unitId, state.stock, state.june);
    if (error) return toast(error);
    state.cart = candidate; save(); renderMenu(); renderCart();
    $('#product-dialog').close(); toast(`${C.product(item.productId).name} adicionado ao pedido.`);
  }
  function changeQuantity(index, change) {
    if (busy || !state.cart[index]) return;
    const candidate = state.cart.map(i => ({ ...i }));
    candidate[index].quantity += change;
    if (candidate[index].quantity <= 0) candidate.splice(index, 1);
    const error = candidate.length ? C.validateCart(candidate, state.unitId, state.stock, state.june) : '';
    if (error) return toast(error);
    state.cart = candidate; save(); renderMenu(); renderCart();
  }
  function switchUnit(id) {
    state.unitId = id; state.cart = []; state.redeem = false; state.coupon = '';
    log(`Unidade alterada para ${C.unit(id).name}.`); save(); render();
    toast(`Cardápio de ${C.unit(id).name} carregado.`);
  }
  function openCheckout() {
    if (busy) return;
    const error = C.validateCart(state.cart, state.unitId, state.stock, state.june);
    if (error) return toast(error);
    if (state.orders.length >= 100) return toast('Limite de 100 pedidos na demonstração. Reinicie para continuar.');
    const t = cartTotals();
    $('#checkout-summary').innerHTML = `<p><b>${escape(C.unit(state.unitId).name)}</b><br>Canal: ${channelNames[state.channel]}</p>${state.cart.map(i => `<div class="total-row"><span>${i.quantity}× ${C.product(i.productId).name}</span><span>${C.money(C.linePrice(i) * i.quantity)}</span></div>`).join('')}${t.discount ? `<div class="total-row discount"><span>${state.coupon ? 'Desconto da campanha' : 'Desconto fidelidade'}</span><span>− ${C.money(t.discount)}</span></div>` : ''}<div class="total-row grand-total"><span>Total</span><span>${C.money(t.total)}</span></div><p class="small">${state.enrolled ? `Você ganhará ${t.pointsEarned} pontos após a aprovação.` : 'Pedido sem participação no programa de fidelidade.'}</p>`;
    $('#payment-feedback').textContent = ''; $('#pay-button').textContent = 'Confirmar pagamento simulado';
    $('#checkout-dialog').showModal();
  }
  // Adapter de pagamento desacoplado: numa versão real, o front solicita uma sessão
  // ao back-end. A confirmação deve ser validada por webhook no servidor.
  function simulatedGateway(result) {
    return new Promise((resolve, reject) => setTimeout(() => {
      if (result === 'timeout') reject(new Error('Não foi possível confirmar o pagamento. Nenhuma cobrança foi feita nesta simulação. Tente novamente.'));
      else resolve({ approved: result === 'approved', transactionId: `demo-${Date.now()}` });
    }, 1000));
  }
  function setBusy(value) {
    busy = value;
    $('#checkout-form').setAttribute('aria-busy', String(value));
    document.querySelectorAll('#checkout-form input, #checkout-form select, #checkout-form button, #checkout-dialog [data-close], #unit-select, #channel-select, #june-toggle').forEach(el => { el.disabled = value; });
    $('#pay-button').textContent = value ? 'Aguardando o provedor…' : 'Confirmar pagamento simulado';
  }
  async function pay(event) {
    event.preventDefault(); if (busy) return;
    const error = C.validateCart(state.cart, state.unitId, state.stock, state.june);
    if (error) return toast(error);
    const payment = new FormData($('#checkout-form')).get('payment');
    const result = $('#gateway-result').value, fulfillment = $('#fulfillment').value;
    const t = cartTotals(); setBusy(true);
    $('#payment-feedback').textContent = 'Solicitando confirmação ao provedor simulado…';
    log(`Pagamento ${payment} solicitado (simulação).`);
    try {
      const response = await simulatedGateway(result);
      if (!response.approved) {
        log('Pagamento recusado; carrinho e pontos preservados.');
        $('#payment-feedback').textContent = 'Pagamento recusado. Seu carrinho foi mantido. Escolha outro resultado e tente novamente.';
        return;
      }
      // Revalidação antes de consumir estoque. Um back-end real deve fazer isto em transação.
      const inventoryError = C.validateCart(state.cart, state.unitId, state.stock, state.june);
      if (inventoryError) throw new Error(inventoryError);
      const sequence = state.orders.length + 1;
      const order = { id: `${Date.now()}-${sequence}`, code: `R${String(sequence).padStart(4, '0')}`, createdAt: Date.now(), unitId: state.unitId, channel: state.channel, fulfillment, payment, transactionId: response.transactionId, items: JSON.parse(JSON.stringify(state.cart)), total: t.total, discount: t.discount, pointsEarned: t.pointsEarned, collected: false };
      state.cart.forEach(i => { state.stock[state.unitId][i.productId] -= i.quantity; });
      state.points = state.enrolled ? state.points - t.pointsSpent + t.pointsEarned : 0;
      state.orders.push(order); state.cart = []; state.redeem = false; state.coupon = '';
      log(`Pagamento aprovado; pedido ${order.code} registrado.`); save(); render();
      $('#checkout-dialog').close(); showView('pedidos', true);
      toast(`Pedido ${order.code} confirmado! Acompanhe a preparação.`);
    } catch (error) {
      $('#payment-feedback').textContent = error.message;
      log('Falha na confirmação do pagamento; sem alteração de estoque ou pontos.');
    } finally {
      setBusy(false); renderCart(); renderAudit(); save();
    }
  }
  function revokeLoyalty() {
    state.enrolled = false; state.points = 0; state.redeem = false;
    log('Adesão à fidelidade revogada e saldo apagado.'); save(); renderPrivacy(); renderCart(); renderAudit();
    toast('Adesão revogada. Seu saldo foi apagado.');
  }
  function reset() {
    if (busy) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) { /* Estado em memória é apagado mesmo sem storage. */ }
    auth.clear(); state = freshState(); category = 'Todos'; search = ''; currentProduct = ''; lastOrderStages = '';
    $('#search').value = '';
    document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
    render(); showView('cardapio', true); toast('Demonstração reiniciada. Dados locais apagados.');
  }
  // Delegação de eventos evita recriar listeners quando o HTML das listas muda.
  document.addEventListener('click', event => {
    const target = event.target.closest('button'); if (!target) return;
    if (target.dataset.view) { if (busy) return; location.hash = target.dataset.view; showView(target.dataset.view, true); }
    if (target.dataset.close) { if (busy && target.dataset.close === 'checkout-dialog') return; $(`#${target.dataset.close}`).close(); }
    if (target.dataset.category) { category = target.dataset.category; renderMenu(); }
    if (target.dataset.product) openProduct(target.dataset.product);
    if (target.id === 'logout-button' && !busy) { auth.logout(); reset(); location.hash = 'conta'; showView('conta'); toast('Você saiu. Dados locais da sessão apagados.'); }
    if (target.dataset.quantity) changeQuantity(Number(target.dataset.index), Number(target.dataset.quantity));
    if (target.dataset.remove !== undefined && !busy) { state.cart.splice(Number(target.dataset.remove), 1); save(); renderMenu(); renderCart(); }
    if (target.dataset.collect && !busy) {
      const order = state.orders.find(o => o.id === target.dataset.collect);
      if (order && C.stage(order) === 2) { order.collected = true; log(`Recebimento de ${order.code} confirmado.`); save(); renderOrders(); renderAudit(); toast('Recebimento confirmado. Bom apetite!'); }
    }
  });
  $('#unit-select').addEventListener('change', event => {
    const selected = event.target.value; if (busy || selected === state.unitId) return;
    if (state.cart.length) { pendingUnit = selected; event.target.value = state.unitId; $('#unit-dialog').showModal(); }
    else switchUnit(selected);
  });
  $('#unit-confirm').addEventListener('click', () => { if (!busy && pendingUnit) { switchUnit(pendingUnit); pendingUnit = ''; $('#unit-dialog').close(); } });
  $('#unit-cancel').addEventListener('click', () => { pendingUnit = ''; $('#unit-dialog').close(); });
  $('#channel-select').addEventListener('change', event => { if (busy) return; state.channel = event.target.value; log(`Canal alterado para ${channelNames[state.channel]}.`); save(); renderContext(); renderAudit(); });
  $('#search').addEventListener('input', event => { search = event.target.value; renderMenu(); });
  $('#product-form').addEventListener('submit', addProduct);
  $('#product-form').addEventListener('input', updateProductPrice);
  $('#cart-totals').addEventListener('change', event => { if (event.target.id === 'redeem-points' && !busy) { state.redeem = event.target.checked; renderCart(); } });
  $('#checkout-open').addEventListener('click', openCheckout);
  $('#checkout-form').addEventListener('submit', pay);
  $('#checkout-dialog').addEventListener('cancel', event => { if (busy) event.preventDefault(); });
  $('#mobile-cart').addEventListener('click', () => { $('#cart-panel').scrollIntoView({ behavior: 'smooth' }); $('#cart-title').setAttribute('tabindex', '-1'); $('#cart-title').focus({ preventScroll: true }); });
  ['#privacy-open', '#privacy-footer'].forEach(id => $(id).addEventListener('click', () => { if (!busy) $('#privacy-dialog').showModal(); }));
  $('#storage-consent').addEventListener('change', event => { if (busy) return; state.persist = event.target.checked; log(state.persist ? 'Armazenamento local autorizado.' : 'Armazenamento local revogado.'); save(); renderPrivacy(); renderAudit(); });
  $('#loyalty-consent').addEventListener('change', event => {
    if (busy) return;
    if (event.target.checked) { state.enrolled = true; log('Adesão explícita à fidelidade.'); save(); renderPrivacy(); renderCart(); renderAudit(); toast('Você entrou no Clube Raízes. Os próximos pedidos acumulam pontos.'); }
    else revokeLoyalty();
  });
  $('#loyalty-revoke').addEventListener('click', revokeLoyalty);
  $('#june-toggle').addEventListener('change', event => {
    if (busy) return; state.june = event.target.checked;
    const removed = state.cart.filter(item => !C.inSeason(C.product(item.productId), state.june));
    state.cart = state.cart.filter(item => C.inSeason(C.product(item.productId), state.june));
    if (removed.length) toast('Produtos fora de temporada foram removidos do carrinho.');
    log(state.june ? 'Temporada junina simulada ativada.' : 'Calendário real restaurado.'); save(); renderMenu(); renderCart(); renderAudit();
  });
  ['#reset-demo', '#erase-data'].forEach(id => $(id).addEventListener('click', () => { if (!busy) $('#reset-dialog').showModal(); }));
  $('#reset-confirm').addEventListener('click', reset);
  window.addEventListener('hashchange', () => { if (!busy) showView(location.hash.slice(1)); });
  // Relógio único para a fila: nenhuma requisição contínua ou um timer por pedido.
  setInterval(() => {
    const stages = state.orders.map(o => `${o.id}:${C.stage(o)}`).join('|');
    if (stages !== lastOrderStages) { renderOrders(); if (activeView === 'pedidos') toast('O status do seu pedido foi atualizado.'); }
  }, 1000);
  function applyCoupon(code) {
    if (busy) return;
    const subtotal = C.totals(state.cart, 0, false, false).subtotal;
    const result = C.promotion(subtotal, code, state.unitId);
    if (!result.valid) { $('#coupon-feedback').textContent = result.message; toast(result.message); return; }
    state.coupon = D.campaign.code; state.redeem = false;
    log('Cupom público aplicado ao carrinho.'); save(); renderCart(); renderAudit(); toast('Cupom aplicado. O resgate de pontos fica desativado neste pedido.');
  }
  $('#coupon-form').addEventListener('submit', event => { event.preventDefault(); applyCoupon($('#coupon-code').value); });
  $('#coupon-remove').addEventListener('click', () => { if (busy) return; state.coupon = ''; save(); renderCart(); });
  $('#campaign-apply').addEventListener('click', () => { applyCoupon(D.campaign.code); if (state.coupon) { location.hash = 'cardapio'; showView('cardapio', true); } });
  $('#marketing-consent').addEventListener('change', event => { state.marketing = event.target.checked; log(state.marketing ? 'Sugestões de campanha autorizadas nesta sessão.' : 'Sugestões de campanha revogadas.'); renderAccount(); renderAudit(); });
  $('#login-form').addEventListener('submit', event => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const result = auth.login(form.get('email'), form.get('code'));
    $('#login-feedback').textContent = result.ok ? '' : result.message;
    if (result.ok) { event.currentTarget.reset(); renderAccount(); log('Acesso demonstrativo realizado.'); renderAudit(); toast('Acesso demonstrativo confirmado.'); }
  });
  $('#register-form').addEventListener('submit', event => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const result = auth.register(form.get('alias'), form.get('email'), form.get('code'));
    $('#register-feedback').textContent = result.ok ? '' : result.message;
    if (result.ok) { event.currentTarget.reset(); renderAccount(); log('Conta fictícia criada somente na memória.'); renderAudit(); toast('Conta fictícia criada. Você já entrou na demonstração.'); }
  });
  restore(); render(); showView(location.hash.slice(1));
}());
