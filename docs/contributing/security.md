# Segurança

Ver [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md) para o índice completo de convenções, e [`../../SECURITY.md`](../../SECURITY.md) para como reportar uma vulnerabilidade (este arquivo é sobre prática de desenvolvimento, não sobre o processo de disclosure).

Segurança é baseline obrigatório, não aspiração, guiado pelo [OWASP Top 10](https://owasp.org/Top10/) (ver `docs/adr/0010-security-practices-as-baseline.md` para o racional completo):

- **Validação sempre no servidor.** Validação de formulário no frontend (Zod) é UX — a autoridade final é o backend (validações do ActiveRecord + strong parameters). Nunca confie só na validação do cliente.
- **Dado que cruza fronteira de confiança é validado em runtime, não só tipado em compile-time.** Resposta de API externa, payload de formulário, webhook — valide com Zod e infira o tipo TypeScript do schema (`z.infer`), nunca deixe tipo e validação divergirem.
- **Query sempre parametrizada** — nunca interpolar valor vindo de usuário em SQL cru; use os métodos do ActiveRecord.
- **Strong parameters sempre explícito** — nunca `permit!`; liste os campos esperados.
- **Autorização não é autenticação.** Toda ação que acessa um recurso verifica que o usuário atual tem permissão sobre *aquele* recurso específico — nunca confie em `params[:id]` sozinho.
- **CSRF e escaping automático (Rails/React) nunca são desligados** sem um ADR justificando o porquê.
- **Dado sensível é criptografado em repouso** — `encrypts` (Active Record Encryption nativo do Rails) para PII sensível, não só senha.
- **Senha nunca em texto puro nem criptografia reversível** — sempre hash (`has_secure_password`/bcrypt).
- **Qualquer geração de valor aleatório sensível (senha, token) usa uma fonte criptograficamente segura — nunca `Math.random()` no frontend** (`crypto.getRandomValues`) **nem `rand`/`Random` puro no backend** (`SecureRandom`). `Math.random()`/`Random` não são adequados pra nada sensível — são previsíveis o suficiente pra um atacante reconstruir a sequência. Ver `app/frontend/lib/generatePassword.ts` (gerador de senha do painel) como referência.
- **Dado de pagamento nunca é armazenado pelo nosso banco** — sempre via token de um gateway de pagamento (nunca número de cartão, CVV, etc. tocando nosso banco).
- **Segredo nunca commitado** — Rails credentials (`master.key` fora do git) ou variável de ambiente, nunca hardcoded.
- **Log nunca expõe dado sensível** — estenda `config.filter_parameters` sempre que um novo campo sensível entrar no domínio (já cobre senha/e-mail/token/etc. por padrão).

`brakeman` e `bundler-audit` (CI) pegam sintomas automaticamente (SQLi, XSS, dependência vulnerável) — essas regras evitam a causa, não substituem a ferramenta.
