/* Dados fictícios separados da interface: futuramente, este catálogo pode vir de uma API.
 * Preços são expressos em CENTAVOS para evitar erros de arredondamento com moedas.
 * O padrão UMD disponibiliza os mesmos dados no navegador e nos testes com Node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RaizesData = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  return {
    units: [
      { id: 'recife', name: 'Recife • Boa Vista', region: 'Pernambuco', open: true, hours: '07h às 20h', kitchen: 'completa' },
      { id: 'joao-pessoa', name: 'João Pessoa • Centro', region: 'Paraíba', open: true, hours: '07h às 19h', kitchen: 'reduzida' },
      { id: 'salvador', name: 'Salvador • Rio Vermelho', region: 'Bahia', open: false, hours: '08h às 18h', kitchen: 'completa' }
    ],
    campaign: { code: 'RAIZES10', name: 'Um sabor a mais no seu dia', minimum: 3000, percent: 10, cap: 1000, units: ['recife', 'joao-pessoa'], from: '2026-01-01', until: '2026-12-31' },
    categories: ['Todos', 'Cuscuz', 'Tapiocas', 'Doces', 'Bebidas', 'Juninos'],
    extras: [
      { id: 'queijo', name: 'Queijo coalho', price: 350 },
      { id: 'carne', name: 'Carne de sol', price: 600 },
      { id: 'manteiga', name: 'Manteiga de garrafa', price: 200 }
    ],
    products: [
      { id: 'cuscuz-sol', name: 'Cuscuz com carne de sol', category: 'Cuscuz', description: 'Cuscuz fofinho, carne de sol desfiada e queijo coalho. Um abraço no prato.', price: 2190, image: 'images/cuscuz-carne-sol.jpg', tag: 'Queridinho da casa', allergens: 'Contém leite e derivados.', extras: ['queijo', 'carne', 'manteiga'], units: ['recife', 'salvador'], stocks: { recife: 15, salvador: 8 } },
      { id: 'tapioca-queijo', name: 'Tapioca de queijo coalho', category: 'Tapiocas', description: 'Tapioca feita na hora, com queijo coalho dourado e um toque de manteiga.', price: 1490, image: 'images/tapioca-queijo.jpg', tag: 'Clássico nordestino', allergens: 'Contém leite e derivados.', extras: ['queijo', 'carne', 'manteiga'], units: ['recife', 'joao-pessoa', 'salvador'], stocks: { recife: 20, 'joao-pessoa': 12, salvador: 10 } },
      { id: 'cuscuz-ovo', name: 'Cuscuz com ovo', category: 'Cuscuz', description: 'O simples que conquista: cuscuz de milho, ovo e manteiga de garrafa.', price: 1290, image: 'images/cuscuz-ovo.jpg', tag: '', allergens: 'Contém ovo e leite.', extras: ['queijo', 'manteiga'], units: ['recife', 'joao-pessoa', 'salvador'], stocks: { recife: 18, 'joao-pessoa': 8, salvador: 12 } },
      { id: 'bolo', name: 'Bolo de macaxeira', category: 'Doces', description: 'Uma fatia cremosa, receita de família, com coco e aquele sabor de casa.', price: 890, image: 'images/bolo-macaxeira.jpg', tag: 'Receita de família', allergens: 'Contém leite e ovo.', extras: [], units: ['recife', 'joao-pessoa', 'salvador'], stocks: { recife: 10, 'joao-pessoa': 0, salvador: 6 } },
      { id: 'cafe', name: 'Café coado', category: 'Bebidas', description: 'Café passado na hora. Aroma de manhã boa em cada xícara.', price: 590, image: 'images/cafe-coado.jpg', tag: '', allergens: 'Sem alergênicos adicionados; consulte a unidade sobre contaminação cruzada.', extras: [], units: ['recife', 'joao-pessoa', 'salvador'], stocks: { recife: 30, 'joao-pessoa': 20, salvador: 20 } },
      { id: 'suco', name: 'Suco de cajá', category: 'Bebidas', description: 'Refrescante e cheio de personalidade. Feito com polpa de cajá, 300 ml.', price: 990, image: 'images/suco-caja.jpg', tag: '', allergens: 'Sem alergênicos adicionados; consulte a unidade sobre contaminação cruzada.', extras: [], units: ['recife', 'joao-pessoa', 'salvador'], stocks: { recife: 12, 'joao-pessoa': 9, salvador: 10 } },
      { id: 'tapioca-coco', name: 'Tapioca de coco', category: 'Tapiocas', description: 'Coco ralado e leite condensado em uma tapioca delicada e quentinha.', price: 1390, image: 'images/tapioca-coco.jpg', tag: '', allergens: 'Contém leite e derivados.', extras: [], units: ['recife', 'joao-pessoa'], stocks: { recife: 10, 'joao-pessoa': 7 } },
      { id: 'canjica', name: 'Canjica da Francisca', category: 'Juninos', description: 'Milho, leite e canela em uma receita especial para celebrar São João.', price: 1190, image: 'images/canjica.jpg', tag: 'Especial de junho', allergens: 'Contém leite e derivados.', extras: [], months: [6], units: ['recife', 'salvador'], stocks: { recife: 8, salvador: 5 } }
    ]
  };
}));
