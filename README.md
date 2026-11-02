# Raízes do Nordeste — código atualizado

Protótipo acadêmico Front-end com **HTML, CSS e JavaScript puro**, alinhado ao estudo de caso revisão 0.3 e ao roteiro da trilha Front-end revisão 0.6. Revisão de 18/10/2026.

## Abrir e testar

1. Extraia o ZIP completo.
2. Abra `index.html` no navegador. Não é necessário instalar dependências ou compilar.
3. Escolha uma unidade aberta, personalize produtos e use o pagamento simulado.

Com Python instalado, é possível executar na pasta do projeto:

```sh
python -m http.server 5500
```

Abra `http://localhost:5500`. Também é possível usar o Live Server no VS Code. O servidor local não publica o trabalho na internet.

## O que foi acrescentado

- Cadastro e acesso **demonstrativos**, com validação, erros e saída da conta.
- Promoções e campanhas com o cupom `RAIZES10`, regras explícitas e sugestões opcionais.
- Layout **Mobile-first**, expandido com `min-width` para 400, 760 e 1000 px.
- Fotos culinárias locais por produto e imagem principal; os arquivos são imagens separadas recortadas do atlas gerado para o projeto.
- Créditos de imagens, referência técnica e documentação navegável em `docs/index.html`.
- Casos de uso com os cinco atores, jornada do cliente e wireframes de celular e desktop.
- Plano com **30 cenários de interface** e relatório de **36 testes automatizados aprovados** das regras.

Permanecem os recursos de unidade, estoque, sazonalidade, adicionais, observações, carrinho, retorno de pagamento, acompanhamento, fidelidade e preferências de privacidade.

## Contas fictícias

A conta inicial é `cliente@exemplo.test`, com a senha pública `123456`. O cadastro aceita somente endereços fictícios terminados em `@exemplo.test` e a mesma senha pública. Não use dados ou senhas reais. Cadastro e sessão são mantidos somente na memória da página e não constituem autenticação segura.

O cliente pode comprar como visitante. Sair e limpar sessão remove carrinho, pedidos, pontos e preferências locais da demonstração. Uma implantação real precisa de um provedor de identidade e de sessões protegidas no servidor.

## Campanha e fidelidade

`RAIZES10`: 10% de desconto em subtotal de pelo menos R$ 30, com teto de R$ 10, em Recife e João Pessoa, de 01/01/2026 a 31/12/2026. Não acumula com o resgate de pontos. O código valida a data no fuso de São Paulo. Fora da vigência, o cupom é recusado.

Fidelidade opcional: 1 ponto por real pago, arredondado para baixo; 100 pontos geram R$ 5 de desconto quando o subtotal é de pelo menos R$ 5. Os pontos são calculados após aprovação, sobre o total pago. Recusa e falha não alteram saldo ou estoque.

## Privacidade

As opções de salvar dados no navegador, participar da fidelidade e receber sugestões na própria tela são separadas. A campanha pública é visível sem personalização. Não há disparo de mensagens, e-mails ou rastreamento por terceiros.

A chave `raizes-prototipo-v1` só guarda a cópia de estado quando o armazenamento é autorizado. E-mail e apelido da conta, senha e observações livres não entram nessa cópia. A recomendação personalizada também não é persistida. Revogar o armazenamento remove a cópia local; apagar os dados reinicia o cenário.

Os controles demonstram escolhas e transparência. A conformidade LGPD de uma implantação real exige avaliação jurídica e técnica específica da operação, segurança e governança de dados.

## Estrutura

| Caminho | Conteúdo |
| --- | --- |
| `index.html` | Telas, diálogos, navegação e formulários |
| `css/styles.css` | Layout Mobile-first e canais |
| `js/data.js` | Catálogo, unidades e campanha fictícios |
| `js/core.js` | Regras puras de valores, estoque, pontos e cupom |
| `js/auth.js` | Cadastro e autenticação fictícios em memória |
| `js/app.js` | Eventos, estado e provedor simulado |
| `images/*.jpg` | Fotos ilustrativas locais usadas diretamente em elementos `<img>` |
| `assets/cardapio-atlas.png` | Atlas original de geração, mantido como fonte dos recortes e para crédito |
| `assets/CREDITOS.md` | Origem e identificação das imagens |
| `docs/index.html` | Requisitos, figuras e referências no navegador |
| `docs/figuras/` | Diagramas e wireframes em SVG editável e PNG |
| `docs/REFERENCIAS.md` | Fontes institucionais e técnicas |
| `TESTES.md` | 30 cenários, entradas e saídas esperadas |
| `tests/` | Testes de regras com Node.js |
| `evidencias/` | Relatório de testes e conferências executadas |

## Executar os testes

Com Node.js instalado, na pasta do projeto:

```sh
node --test tests/*.test.js
```

O resultado inicial desta revisão foi **36 testes aprovados e nenhuma falha**. Eles cobrem regras e o serviço fictício de conta, sem executar a interface em navegador. Os testes manuais de fluxo, teclado e responsividade de `TESTES.md` permanecem pendentes. Os wireframes são modelos, não capturas de execução.

## Limites e integrações previstas

Não há cobrança real, API, banco de dados, aplicativo nativo, integração entre abas/dispositivos ou controle de permissões de funcionários. O cenário de Salvador é fixo como fechado; em João Pessoa há cozinha reduzida e bolo esgotado. O controle junino do rodapé permite testar a sazonalidade. O pedido avança para preparo após 12 s e fica pronto após 30 s, com conclusão manual.

Back-end deve controlar estoque, idempotência e transações, validar pagamentos por webhook, aplicar autorização e fornecer uma auditoria confiável. O painel de funcionários, a gestão de estoque e os indicadores estão na modelagem conceitual. A disponibilidade e o desempenho sob carga de uma rede real não foram medidos neste protótipo.

## Projeto publicado

- Site: [Raízes do Nordeste no GitHub Pages](https://devfelip3.github.io/raizes-do-nordeste-front-end-final/)
- Repositório: [raizes-do-nordeste-front-end-final](https://github.com/DevFelip3/raizes-do-nordeste-front-end-final)

O uso de IA no projeto e a origem dos recursos visuais estão registrados no documento acadêmico e nos créditos correspondentes.
