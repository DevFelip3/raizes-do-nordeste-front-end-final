// Cenários positivos e negativos de conta e campanhas.
const test = require('node:test');
const assert = require('node:assert/strict');
const { createService } = require('../js/auth.js');
const C = require('../js/core.js');
const date = new Date('2026-10-18T12:00:00-03:00');
const cart = [{productId:'cafe',quantity:6,extraIds:[],note:''}];
test('conta de teste permite acesso com credenciais públicas', () => {
 const auth=createService();assert.equal(auth.login('cliente@exemplo.test','123456').ok,true);assert.equal(auth.current().alias,'Cliente Demo');
});
test('login incorreto não cria sessão', () => {const a=createService();assert.equal(a.login('cliente@exemplo.test','000000').ok,false);assert.equal(a.current(),null);});
test('cadastro fictício cria conta e permite novo acesso na mesma sessão', () => {const a=createService();assert.equal(a.register('Visitante','visita@exemplo.test','123456').ok,true);a.logout();assert.equal(a.login('visita@exemplo.test','123456').ok,true);});
test('cadastro bloqueia endereço real', () => assert.equal(createService().register('Visitante','pessoa@gmail.com','123456').ok,false));
test('cadastro bloqueia apelido curto', () => assert.equal(createService().register('A','a@exemplo.test','123456').ok,false));
test('cadastro duplicado é rejeitado', () => {const a=createService();assert.equal(a.register('Outro','cliente@exemplo.test','123456').ok,false);});
test('cadastro aceita somente a senha pública da demonstração', () => assert.equal(createService().register('Visitante','teste@exemplo.test','minhasenha').ok,false));
test('sair encerra sessão de identidade', () => {const a=createService();a.login('cliente@exemplo.test','123456');a.logout();assert.equal(a.current(),null);a.register('Novo','novo@exemplo.test','123456');a.clear();assert.equal(a.login('novo@exemplo.test','123456').ok,false);});
test('contas fictícias não atravessam instâncias', () => {const a=createService();a.register('Novo','novo@exemplo.test','123456');assert.equal(createService().login('novo@exemplo.test','123456').ok,false);});
test('consumidor não altera perfil interno pelo objeto retornado', () => {const a=createService();a.login('cliente@exemplo.test','123456');a.current().alias='Alterado';assert.equal(a.current().alias,'Cliente Demo');});
test('campanha calcula dez por cento em centavos', () => assert.equal(C.promotion(5000,'RAIZES10','recife',date).discount,500));
test('cupom ignora caixa e espaços laterais', () => assert.equal(C.promotion(3000,' raizes10 ','recife',date).valid,true));
test('campanha respeita teto de dez reais', () => assert.equal(C.promotion(30000,'RAIZES10','recife',date).discount,1000));
test('cupom abaixo do mínimo é recusado', () => assert.equal(C.promotion(2999,'RAIZES10','recife',date).valid,false));
test('cupom inválido é recusado', () => assert.equal(C.promotion(5000,'OUTRO','recife',date).valid,false));
test('cupom incompatível com unidade é recusado', () => assert.equal(C.promotion(5000,'RAIZES10','salvador',date).valid,false));
test('campanha expirada e futura são recusadas', () => {assert.equal(C.promotion(5000,'RAIZES10','recife',new Date('2027-01-02T12:00:00Z')).valid,false);assert.equal(C.promotion(5000,'RAIZES10','recife',new Date('2025-12-30T12:00:00Z')).valid,false);});
test('campanha não acumula com o resgate de pontos', () => {const t=C.totals(cart,100,true,true,354);assert.equal(t.discount,354);assert.equal(t.pointsSpent,0);assert.equal(t.pointsEarned,31);});
test('desconto nunca produz total negativo', () => assert.equal(C.totals(cart,0,false,false,100000).total,0));
