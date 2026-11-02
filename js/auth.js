/* Cadastro e autenticação DEMONSTRATIVOS. Não use este módulo em produção.
 * Só aceita endereços fictícios @exemplo.test e a senha pública 123456.
 * Contas e sessão vivem apenas na memória: nada é enviado ou salvo no navegador.
 * Produção deve usar um serviço de identidade e sessão protegida no servidor. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RaizesAuth = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function createService() {
    const accounts = [{ alias: 'Cliente Demo', email: 'cliente@exemplo.test' }];
    let session = null;
    const emailOf = value => String(value || '').trim().toLowerCase();
    function register(alias, email, code) {
      alias = String(alias || '').trim(); email = emailOf(email);
      if (alias.length < 2 || alias.length > 40) return { ok: false, message: 'Informe um apelido fictício com 2 a 40 caracteres.' };
      if (!/^[a-z0-9._+-]+@exemplo\.test$/.test(email)) return { ok: false, message: 'Use somente um e-mail fictício terminado em @exemplo.test.' };
      if (code !== '123456') return { ok: false, message: 'Nesta demonstração, use a senha pública 123456.' };
      if (accounts.some(a => a.email === email)) return { ok: false, message: 'Esse endereço fictício já está cadastrado nesta sessão.' };
      const account = { alias, email }; accounts.push(account); session = { ...account };
      return { ok: true, account: { ...account } };
    }
    function login(email, code) {
      const account = accounts.find(a => a.email === emailOf(email));
      if (!account || code !== '123456') return { ok: false, message: 'Não foi possível entrar. Confira o e-mail fictício e a senha de demonstração.' };
      session = { ...account }; return { ok: true, account: { ...account } };
    }
    return { register, login, current: () => session ? { ...session } : null, logout: () => { session = null; }, clear: () => { session = null; accounts.splice(1); } };
  }
  return { createService };
}));
