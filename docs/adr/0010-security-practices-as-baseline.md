# 0010 - Práticas de segurança como baseline obrigatório

## Status

Aceito

## Contexto

Este projeto é um template de e-commerce — vai lidar com dados de clientes (nome, e-mail, endereço, eventualmente documentos) e, mesmo sendo escopo de produtos digitais (`docs/adr/0007`), ainda passa por fluxo de pagamento. Até agora a segurança do projeto dependia só de ferramentas automatizadas (`brakeman`, `bundler-audit`, Dependabot) rodando no CI, sem nenhuma convenção escrita sobre como escrever código seguro por padrão — validação, tipagem em fronteira de confiança, e como tratar dado sensível. Ferramenta automatizada pega sintoma; convenção evita o problema ser escrito.

## Decisão

Segurança segue o mesmo princípio do `docs/adr/0004` (baseline obrigatório, não aspiração), guiado pelo [OWASP Top 10](https://owasp.org/Top10/) como referência de categorias de risco. Regras concretas (detalhadas em `CONTRIBUTING.md`):

- **Validação sempre no servidor, nunca só no cliente.** Validação de formulário no frontend (Zod) é UX, não segurança — a autoridade final é o backend (validações do ActiveRecord + strong parameters).
- **Tipagem como camada de segurança, não só de DX.** A proibição de `any` já fixada (`CONTRIBUTING.md`) se estende a dado que cruza fronteira de confiança (resposta de API externa, payload de formulário, webhook) — validado em runtime com Zod, com o tipo TypeScript inferido do schema (`z.infer`), nunca tipo e validação divergindo.
- **Query sempre parametrizada.** Nunca interpolar valor vindo de usuário em SQL cru; usar os métodos do ActiveRecord.
- **Strong parameters sempre explícito.** Nunca `permit!`; sempre listar os campos esperados.
- **Autorização não é autenticação.** Toda ação que acessa um recurso verifica que o usuário atual tem permissão sobre *aquele* recurso específico (nunca confiar em `params[:id]` sozinho) — mesmo em instância única (`docs/adr/0002`), isso vale entre papéis diferentes (cliente vs. admin).
- **CSRF e escaping automático do Rails/React nunca são desligados** sem um ADR justificando o porquê.
- **Dado sensível é criptografado em repouso.** Usar `encrypts` (Active Record Encryption, nativo do Rails) para PII sensível (documento, dados de contato quando aplicável) — não só senha.
- **Senha nunca armazenada em texto puro nem criptografia reversível** — sempre hash (`has_secure_password`/bcrypt).
- **Dado de pagamento nunca é armazenado pelo nosso banco.** Sempre via token de um gateway de pagamento (nunca número de cartão, CVV, etc. tocando nosso banco de dados) — reduz escopo de PCI-DSS drasticamente.
- **Segredo nunca commitado.** Rails credentials (`config/credentials.yml.enc` + `master.key` fora do git, já configurado) ou variável de ambiente — nunca hardcoded.
- **Log nunca expõe dado sensível** — `config.filter_parameters` (já cobre senha/e-mail/token/etc. por padrão no Rails 8) é estendido sempre que um novo campo sensível for introduzido no domínio.

## Consequências

- `brakeman`/`bundler-audit` continuam automatizados no CI — pegam sintomas (SQLi, XSS, dependência vulnerável). As regras acima evitam a causa, não substituem a ferramenta.
- Antes de qualquer deploy real, revisar `config/environments/production.rb` quanto a `force_ssl` (hoje comentado, é o padrão do Rails new) — não é mudado agora porque não há ambiente de deploy configurado ainda para validar, mas fica registrado como pré-requisito, não esquecido.
- Quando autenticação/autorização forem implementadas de verdade (ainda não existem), a escolha de biblioteca/estratégia é uma decisão de arquitetura própria (novo ADR), não coberta por este documento — este ADR fixa os princípios que essa implementação futura precisa respeitar, não a implementação em si.
