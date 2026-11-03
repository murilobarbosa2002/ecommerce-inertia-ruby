# 0011 - Tidewave como MCP server de debugging em desenvolvimento

## Status

Aceito

## Contexto

O plano original de MCP servers (`docs/adr/0008`) previa `rails-dev-mcp` (`obie/rails-dev-mcp`) como ferramenta de debugging via agente de IA. Essa gem foi tentada e descartada — o binário quebra ao iniciar por um bug real na própria gem (única versão publicada, sem atualização desde o lançamento), documentado em detalhe em `docs/environment-setup.md`. `rails-dev-mcp` só cobria controle de processo (start/stop/logs do servidor), nunca debugging de runtime de verdade (executar código, consultar o banco, inspecionar models).

Avaliadas duas alternativas que dão acesso de runtime:

- **Tidewave** (`tidewave-ai/tidewave_rails`): integra como Railtie, expõe endpoint HTTP local (`/tidewave/mcp`, Streamable HTTP JSON-RPC 2.0) com ferramentas `project_eval` (Ruby arbitrário no processo da app), `execute_sql_query`, `get_logs`, `get_models`, `get_source_location`, `get_docs`.
- **rails-active-mcp** (`GoodPie/rails-active-mcp`): ferramentas equivalentes (`console_execute`, `safe_query`, `dry_run`, `model_info`), mas com filtragem por "nível de risco" (bloqueia padrões como `eval`/comando de sistema, loga outros) em vez de restrição estrutural de ambiente — precisa de `production_mode!`/`development_mode!` configurados explicitamente para não rodar fora de dev.

Ambas dão, na prática, o equivalente a um `rails console` aberto para o agente de IA — a diferença relevante é **onde** essa superfície de risco é contida.

## Decisão

**Tidewave** é o MCP server de debugging deste projeto. Critério decisivo: Tidewave é dev-only por arquitetura, não por configuração — a gem entra no `group :development` do `Gemfile` e portanto nunca é carregada em produção, e por padrão só aceita conexão de localhost (reforçado explicitamente em `config/environments/development.rb`, mesmo repetindo o default da gem, para não depender de um default que pode mudar numa versão futura). `rails-active-mcp` depende de alguém configurar o modo certo para não expor isso fora de dev — uma lista de padrões bloqueados é heurística, não garantia; preferimos a decisão que não existe fora do ambiente certo em vez da decisão que precisa ser lembrada de bloquear o ambiente errado.

Configuração:

- `Gemfile`: `gem "tidewave"` dentro do `group :development`.
- `config/environments/development.rb`: `config.tidewave.allow_remote_access = false` e `config.tidewave.preferred_orm = :active_record`, fixados explicitamente.
- `.mcp.json`: entrada `tidewave` do tipo `"http"`, apontando para `http://localhost:3000/tidewave/mcp` — só conecta com `bin/dev` rodando.

## Consequências

- O agente de IA ganha, em desenvolvimento, acesso equivalente a um `rails console`: pode executar qualquer Ruby no processo da app, rodar SQL direto, ler logs, inspecionar models — poder real, não uma API restrita. Isso é aceito porque fica contido a `:development` por arquitetura da gem, consistente com os princípios de `docs/adr/0010` (segurança como baseline, não aspiração).
- O MCP só conecta com o servidor de desenvolvimento rodando (`bin/dev`); sem isso, a entrada em `.mcp.json` fica com conexão falha, sem travar o restante da sessão do Claude Code.
- `rails-dev-mcp` fica formalmente substituído como plano de debugging — não reavaliar essa gem a menos que receba uma versão nova corrigindo o bug documentado em `docs/environment-setup.md`.
- Se este projeto algum dia precisar de uma ferramenta equivalente acessível fora de `:development` (ex. um ambiente de staging para depuração remota controlada), isso exige um novo ADR avaliando o trade-off de segurança — nunca estender `allow_remote_access` sem essa decisão registrada.
