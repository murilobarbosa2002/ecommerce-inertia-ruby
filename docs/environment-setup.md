# Configuração do ambiente (WSL)

Runbook de como o ambiente de desenvolvimento desta máquina foi configurado, passo a passo. Serve pra (1) uma pessoa replicar o mesmo ambiente numa máquina nova, ou (2) instruir uma IA a ler este arquivo e configurar/instalar com base no que já foi feito. Só descreve o que **realmente já foi executado** — passos ainda não feitos ficam na seção "Pendente", não como instrução hipotética.

Ver também `docs/adr/0005-native-wsl-dev-environment.md` (por que ambiente nativo, sem Docker pra aplicação) e `docs/adr/0008-docker-allowed-for-auxiliary-tooling.md` (por que Docker é permitido só pra ferramentas auxiliares).

## Pré-requisitos

- Windows com WSL2 e uma distro Ubuntu instalada.
- VS Code com a extensão **Remote-WSL** — é dentro do WSL que o Claude Code (e todo o resto) roda de fato, mesmo a janela do VS Code estando no Windows.
- Docker Desktop no Windows, só se for usar alguma ferramenta auxiliar que precise de container (ver seção de MCP abaixo) — não é necessário pra rodar a aplicação.

## O que já foi feito nesta máquina

### Sistema base

Ubuntu 26.04.1 LTS. `apt update && apt upgrade` já rodado antes de qualquer configuração abaixo.

### GitHub CLI (`gh`)

Status: feito.

```bash
sudo apt install gh
gh auth login       # fluxo OAuth via navegador — escolher HTTPS como protocolo
gh auth setup-git   # faz o git usar essa mesma autenticação (push/pull sem pedir token)
```

Verificação: `gh auth status` mostra autenticado; `git push`/`git pull` via HTTPS funcionam sem pedir usuário/senha/token.

### Git hooks do repositório (Husky)

Status: feito.

```bash
pnpm add -D husky @commitlint/cli @commitlint/config-conventional lint-staged
pnpm exec husky init
```

Husky gerencia `pre-commit` (lint-staged: ESLint/Prettier/Rubocop nos arquivos staged), `commit-msg` (commitlint + bloqueio de atribuição de IA, que substitui o antigo `.githooks/commit-msg`) e `pre-push` (suíte completa: `bundle exec rspec` + `pnpm test`) — ver `CONTRIBUTING.md`, seção "Git hooks", para o detalhe de cada um. Ativado automaticamente pelo script `prepare` do `package.json`, que `pnpm install` roda sozinho — **não precisa de nenhum passo manual em clone novo**, diferente do esquema anterior baseado em `core.hooksPath`.

### Docker Desktop + integração WSL

Status: habilitado, com uma pegadinha de permissão encontrada e documentada.

Passos feitos do lado Windows (não dá pra automatizar por aqui, é interface gráfica):

1. Abrir o Docker Desktop no Windows.
2. Settings → Resources → WSL Integration → habilitar a distro Ubuntu usada.
3. Apply & Restart.

**Pegadinha:** isso adiciona o usuário ao grupo `docker` do Linux, mas uma sessão do WSL que já estava aberta **antes** de habilitar a integração não reconhece essa permissão — `docker ps` dá `permission denied while trying to connect to the docker API`. Resolução: fechar a conexão Remote-WSL do VS Code (ou rodar `wsl --shutdown` no PowerShell do Windows) e reabrir, pra iniciar uma sessão nova que já carrega o grupo atualizado. Verificação: `groups` deve listar `docker` entre os grupos do usuário atual.

### Markdownlint

Status: feito, do lado do editor.

Extensão `davidanson.vscode-markdownlint` instalada no VS Code (Remote-WSL). Regras do projeto em `.markdownlint.json` na raiz do repo — sem configuração adicional necessária, a extensão lê o arquivo automaticamente.

### Todo Tree (rastreio de pendências no código)

Status: feito.

Extensão `gruntfuggly.todo-tree` instalada no VS Code (Remote-WSL). Convenção de tags documentada em `CONTRIBUTING.md`, seção "Padrões de código" — `TODO`, `FIXME` e `PENDING-FRONTEND` (tag própria deste projeto, pra pendência de backend que só é resolvível quando a página/tela correspondente do frontend existir). Configuração compartilhada em `.vscode/settings.json` (cores/ícones por tag, pastas excluídas do scan).

**Pegadinha real encontrada (dupla):**

1. A extensão depende de um binário `ripgrep` pra escanear o código (`vscode-ripgrep`, baixado via `npm install` da própria extensão) — nesta máquina esse download nunca aconteceu (rede bloqueada pelo Portmaster no momento da instalação da extensão), e a extensão falhava silenciosamente: painel "TODOs" sempre vazio, comandos `todo-tree.refresh`/`todo-tree.showFlatView` dando "command not found" no Command Palette. A mensagem de erro real (`Failed to find vscode-ripgrep`) só aparece como notificação própria da extensão, não nos logs óbvios — é preciso checar `~/.vscode-server/data/logs/<sessão mais recente>/exthost*/remoteexthost.log` em busca de erros de ativação da extensão pra achar a causa raiz quando o sintoma é só "não funciona".
2. Mesmo depois de instalar o `ripgrep` do sistema e apontar a extensão pra ele, o aviso continuou — a chave de configuração certa é **`todo-tree.ripgrep.ripgrep`** (aninhada um nível a mais), não `todo-tree.ripgrep` como a mensagem de erro da própria extensão sugere de forma abreviada (`"set 'todo-tree.ripgrep' to point to the executable"`). Confirmado lendo o `contributes.configuration` do `package.json` da extensão instalada (`~/.vscode-server/extensions/gruntfuggly.todo-tree-*/package.json`) — VS Code ignora silenciosamente chave de configuração desconhecida, sem avisar que o nome está errado.

Resolvido instalando ripgrep como pacote de sistema (caminho estável, não depende do hash de build do VS Code Server, que muda a cada atualização):

```bash
sudo apt update && sudo apt install -y ripgrep
```

E apontando `todo-tree.ripgrep.ripgrep` pro binário instalado (`/usr/bin/rg`) em `.vscode/settings.json`.

Verificação: `rg --version` funciona fora do VS Code; painel "TODOs" do Todo Tree lista os comentários `TODO`/`FIXME`/`PENDING-FRONTEND` existentes no código depois de um reload da janela.

### MCP servers — configuração

Status: `.mcp.json` criado com Playwright, Chrome DevTools, GitHub e Tidewave — os quatro confirmados conectando (`claude mcp list` → `✔ Connected` em todos; Tidewave só fica assim com `bin/dev` rodando no momento do comando).

- **Playwright** e **Chrome DevTools**: rodam via `pnpm dlx`. Por padrão, os dois esperam o Google Chrome "de verdade" instalado em `/opt/google/chrome/chrome` — mas nesta máquina só existe **Chromium** (`sudo apt install chromium-browser`, ver seção "Navegador" abaixo; Chrome nunca foi instalado). Sem apontar pro binário certo, os dois falham ao abrir página (Playwright com `Chromium distribution 'chrome' is not found`; Chrome DevTools com erro de protocolo `Target closed`). Corrigido com flags explícitas em `.mcp.json`: `--executable-path`/`--executablePath` apontando pra `/usr/bin/chromium-browser` e `--no-sandbox` (mesmo padrão já usado pelo Cuprite nos testes). Confirmado funcionando de ponta a ponta (navegação + snapshot de página reais via chamada direta do protocolo MCP). **Headed, não headless, de propósito**: diferente do Cuprite (testes automatizados, sem necessidade de janela), esses dois MCPs são usados interativamente — o mantenedor quer ver o navegador abrindo de verdade, pra acompanhar visualmente o que o agente está fazendo. O WSLg desta máquina já suporta isso nativamente (`DISPLAY`/`WAYLAND_DISPLAY` configurados, confirmado funcionando: janela abriu no desktop do Windows). Por isso nenhuma das duas entradas tem `--headless`.
- **GitHub**: roda via Docker (`docs/adr/0008`). Status: feito.
  1. Personal Access Token **fine-grained** criado em github.com/settings/personal-access-tokens/new, escopo só neste repo ("Only select repositories"), permissões em **Repository permissions** (não "Account permissions", que não tem relação com o que o MCP faz): Contents/Pull requests/Issues = Read and write.
  2. Exportado como variável de ambiente, **nunca num arquivo do repo**: `export GITHUB_PAT="github_pat_..."` no `~/.bashrc` (prefixo `github_pat_`, não `ghp_` — esse é o de token clássico), depois `source ~/.bashrc`. O `.mcp.json` referencia `${GITHUB_PAT}` — o valor real nunca é commitado.
  3. Depois de exportar, as aprovações de MCP de projeto precisam ser renovadas: `claude` (dentro do diretório do projeto) pede aprovação dos servidores do `.mcp.json` na primeira vez; `claude mcp list` confirma `✔ Connected` em todos.
- **Rails Dev MCP** (`obie/rails-dev-mcp`): **tentado e descartado.** `gem install rails-dev-mcp` instala, mas o binário quebra ao iniciar: `NoMethodError: undefined method 'argument' for class RailsDevMCP::Tools::StartDevServer`. Investigado antes de desistir (não foi só "não funcionou, pula") — o método `argument` (singular) que a gem chama não existe em nenhuma versão disponível do `fast-mcp` (testado 1.0.0, a mais próxima da data de lançamento da gem em jul/2025, e 1.6.0, a atual); `fast-mcp` 1.6.0 só tem `arguments` (plural), num módulo `Mcp::Tool`, não `FastMcp::Tool`. É bug real na gem (única versão publicada, 0.1.0, sem atualização desde o lançamento), não erro de configuração daqui. Gem desinstalada, não faz parte do `.mcp.json`. Reavaliar só se a gem receber uma versão nova.
- **Tidewave** (`tidewave-ai/tidewave_rails`): substitui o Rails Dev MCP como ferramenta de debugging via agente de IA — decisão registrada em `docs/adr/0011`. Gem `tidewave` no `group :development` do `Gemfile` (nunca carregada em produção), com `config.tidewave.allow_remote_access = false` fixado explicitamente em `config/environments/development.rb`. Expõe endpoint HTTP local em `/tidewave/mcp` (Ruby eval, SQL, logs, introspecção de models) — registrado em `.mcp.json` como `"type": "http"` apontando pra `http://localhost:3000/tidewave/mcp`. **Só conecta com `bin/dev` rodando**: inicie o servidor de desenvolvimento antes de abrir uma sessão do Claude Code, senão essa entrada fica com conexão falha (sem travar o restante da sessão). **Achado durante o uso**: o Tidewave injeta um `<script>` remoto de `https://tidewave.ai` em toda página carregada em dev (`config.tidewave.toolbar`, default `true`) — é a UI visual da toolbar dele, não os MCP tools (que não dependem disso). Revisado com o mantenedor e **mantido ligado** de propósito, fixado explicitamente em `config/environments/development.rb` (não é um esquecimento).

### CLI standalone do Claude Code

Status: feito.

```bash
curl -fsSL https://claude.ai/install.sh | bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
```

Compartilha a mesma config (`~/.claude`) da extensão do VS Code — não precisou de login separado. Verificação: `claude --version` e `claude auth status`.

### Navegador (Chromium) — pro Chrome DevTools MCP

Status: feito.

```bash
sudo apt install -y chromium-browser
```

No Ubuntu, isso instala via snap automaticamente (pacote `chromium-browser` é só um transicional). Verificação: `chromium-browser --version`.

### `sudo` sem senha, escopado (apt + postgresql)

Status: feito.

Para eu (IA) conseguir rodar `apt install`/`systemctl` do PostgreSQL sem interromper o usuário a cada comando, foi criado `/etc/sudoers.d/claude-code-setup`, liberando **só** `apt`/`apt-get install`/`update` e `systemctl {start,stop,restart,enable --now,status} postgresql`, mais `createuser`/`createdb`/`psql` como usuário `postgres` — nada além disso. Instalado via `visudo` (validado antes e depois de instalar, ver histórico do PR correspondente). Qualquer outro `sudo` continua pedindo senha normalmente.

### Pacotes de sistema (apt)

Status: feito.

```bash
sudo apt install -y build-essential libssl-dev libyaml-dev zlib1g-dev libreadline-dev libpq-dev postgresql postgresql-contrib
```

O pacote `postgresql` já inicializa, habilita e inicia o serviço automaticamente no Ubuntu — não precisou de passo manual de `systemctl enable`.

### `mise`: Ruby, Node e pnpm

Status: feito.

```bash
curl https://mise.run | sh
echo 'eval "$(/home/ubuntu/.local/bin/mise activate bash)"' >> ~/.bashrc
cd /home/ubuntu/projetos/ecommerce-inertia-ruby
mise use ruby@4.0.9 node@24.22.2 pnpm@12.16.1
```

Gera `mise.toml` na raiz do repo, versionado, com versões exatas pinadas (não faixas como `"4"` — reprodutibilidade real). Ruby 4.x já vem com Bundler embutido como gem padrão, não precisou `gem install bundler` separado. Verificação: `ruby -v`, `node -v`, `pnpm -v` dentro da pasta do projeto.

### PostgreSQL — role de desenvolvimento

Status: feito.

```bash
sudo -u postgres createuser -s ubuntu
```

Verificação: `pg_isready` e `psql -U ubuntu -d postgres -c "select version();"` conectam sem senha.

### ESLint + Prettier

Status: feito.

```bash
pnpm add -D eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks \
  eslint-plugin-jsx-a11y eslint-plugin-better-tailwindcss eslint-config-prettier globals \
  prettier prettier-plugin-tailwindcss
```

**Pegadinhas de versão encontradas e resolvidas** (confirmadas via pesquisa antes de fixar, não só tentativa e erro):

- **TypeScript**: o gerador do Inertia instalou TypeScript 7.0.2 (compilador nativo novo, sem API programática ainda — só chega na 7.1). `typescript-eslint` não suporta TS 7 (peer dependency trava em `<6.1.0`). Fixado em **TypeScript 6.0.3** (última estável da linha 6), não a 7.
- **ESLint**: a major atual (10.x) quebra `eslint-plugin-react` (API removida, dá erro em runtime) e `eslint-plugin-jsx-a11y` ainda não suporta oficialmente. Fixado em **ESLint 9.39.5** — a própria ESLint marca essa linha como `maintenance` (suportada), não abandonada.
- **ESLint vs. Prettier brigando por formatação**: as regras de formatação do `eslint-plugin-better-tailwindcss` (`enforce-consistent-class-order`, `enforce-consistent-line-wrapping`, `no-unnecessary-whitespace`) entravam em conflito com o Prettier (um reformatava, o outro reclamava, infinitamente). Desligadas essas três regras no `eslint.config.mjs` — Prettier + `prettier-plugin-tailwindcss` são quem formatam/ordenam classes; o ESLint só cuida de correção (classe inexistente/conflitante/duplicada).
- **Markdown fora do Prettier**: `.md` já é formatado/lintado pelo `markdownlint` — `.prettierignore` exclui `*.md` pra não ter dois formatadores competindo pelo mesmo arquivo. Config Ruby/Rails (`config/`) e workflows (`.github/`) também ficam fora do escopo do Prettier — não é código JS/TS.

Verificação: `pnpm lint`, `pnpm format:check`, `pnpm run check` (TypeScript) e `bin/rubocop` todos limpos.

### Zod, React Hook Form, Radix UI e tailwind-variants

Status: feito. Decisão completa em `docs/adr/0012-form-validation-and-ui-primitives-stack.md`.

```bash
pnpm add zod react-hook-form @hookform/resolvers radix-ui tailwind-variants tailwind-merge
```

Testado com um formulário temporário (Zod + `zodResolver` + `useForm` + `Checkbox` do Radix UI estilizado com `tv()`) sob Vitest/jsdom — confirmou a integração de ponta a ponta antes de remover o teste (não cobria comportamento real de app). Revelou um problema real: jsdom não implementa `ResizeObserver`/Pointer Events/`scrollIntoView`, que o Radix UI usa no mount — corrigido com polyfills no-op permanentes em `app/frontend/test/setup.ts`.

### RSpec + Capybara/Cuprite (backend) e Vitest + RTL (frontend)

Status: feito.

```bash
# Gemfile: rspec-rails, factory_bot_rails, faker (grupo development+test);
# shoulda-matchers, capybara, cuprite (grupo test)
bundle install
bin/rails generate rspec:install

pnpm add -D vitest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jsdom @vitest/coverage-v8
```

`spec/rails_helper.rb` registra Cuprite (headless Chromium via CDP, usando o `chromium-browser` já instalado — `browser_path: "/usr/bin/chromium-browser"`) como driver de specs de sistema (`config.before(:each, type: :system) { driven_by :cuprite }`), inclui `FactoryBot::Syntax::Methods` e configura `shoulda-matchers`. `vite.config.ts` ganhou um bloco `test` (ambiente `jsdom`, setup em `app/frontend/test/setup.ts`).

**Pegadinha real encontrada:** o plugin `@inertiajs/vite` transforma a opção `pages: "../pages"` num `import.meta.glob("../pages/**/*{tsx,ts,jsx,js}")` interno — isso casa com qualquer `*.test.tsx` colocado dentro de `app/frontend/pages/`, e o arquivo de teste **vaza pro build de produção** (confirmado: apareceu como chunk extra no `pnpm exec vite build`). Por isso, **testes de componente nunca ficam dentro de `app/frontend/pages/`** — vivem em `app/frontend/test/pages/<mesmo-caminho>/index.test.tsx`, importando o componente real via alias `@/pages/...`.

Verificação: `bundle exec rspec` (specs de request e de sistema, Chromium real) e `pnpm test` (Vitest) passam; `pnpm exec vite build` não inclui nenhum arquivo `*.test.*` no output.

### Proteção da branch `main` no GitHub

Status: feito. Não é configuração da máquina, mas do repositório no GitHub — registrado aqui pela mesma lógica da seção de MCP/Docker (passo de plataforma, não só de código).

Ruleset criado via API (`POST /repos/<owner>/<repo>/rulesets`), aplicando na branch padrão: exige PR antes de merge, exige os checks `check`/`lint`/`scan_ruby`/`test`/`js`/`markdownlint` verdes (atualizado via `PUT` quando os jobs de `test`/`js`/`markdownlint` foram adicionados ao CI), bloqueia force-push e exclusão da `main`. Sem exigência de aprovação de terceiro (repo de mantenedor único) e sem bypass configurado — nem admin pula a regra, o fluxo de PR+CI já seguido por convenção agora é garantido tecnicamente, mesma lógica do hook+CI de atribuição de IA.

### Active Record Encryption (`otp_secret` do 2FA)

Status: feito.

Pré-requisito pro PR de 2FA (`docs/adr/0013`): `otp_secret` é dado sensível em repouso, guardado com `encrypts` (Active Record Encryption nativo do Rails, exigido por padrão em `docs/adr/0010`) — isso exige chaves de criptografia configuradas nas credentials antes de funcionar.

```bash
bin/rails db:encryption:init
```

O comando só **imprime** as três chaves geradas (`primary_key`, `deterministic_key`, `key_derivation_salt`) — não escreve em lugar nenhum sozinho. Precisam ser adicionadas manualmente em `config/credentials.yml.enc` (`bin/rails credentials:edit`, que abre no `$EDITOR`) sob a chave `active_record_encryption:`. As chaves em si nunca vão pro git (ficam só dentro do arquivo encriptado, que só abre com `config/master.key`, esse sim fora do git).

Verificação: `Rails.application.credentials.active_record_encryption.present?` retorna `true`; criar um registro com atributo `encrypts` e consultar a coluna direto no banco (`Model.connection.select_value(...)`) mostra o valor cifrado, diferente do valor em texto puro lido via o model.

## Pendente (Fase 2 — ambiente da aplicação)

Esta seção é atualizada com os comandos reais conforme cada item é de fato feito, não antes:

- [ ] Playwright instalado como dependência de dev e usado em testes reais (entra quando houver fluxo de UI real pra testar, ver `CONTRIBUTING.md` — o Playwright MCP já conecta, ver seção "MCP servers" acima, mas isso é só a ferramenta de automação, não os testes em si)

### Scaffold da aplicação (Rails + Inertia + React + pnpm)

Status: feito.

```bash
rails new . --skip-javascript --skip-asset-pipeline --database=postgresql --skip-test
bundle add inertia_rails
rails generate inertia:install --framework=react --typescript --vite --tailwind --no-interactive
```

**pnpm em vez de npm:** o gerador do `inertia_rails`/`vite_rails` usa `npm` por padrão. Depois de gerar, foi preciso:

```bash
rm -rf node_modules package-lock.json
pnpm install   # gera pnpm-lock.yaml
```

E corrigir `bin/setup` (`npm install` → `pnpm install`). TypeScript sob pnpm precisa de um ajuste adicional — `pnpm`'s isolamento estrito de `node_modules` quebra a resolução de tipos de `@inertiajs/core` — resolvido com `.npmrc`:

```ini
public-hoist-pattern[]=@inertiajs/core
```

Ver `docs/adr/0009-pnpm-as-node-package-manager.md` para o porquê de usar pnpm.

Verificação: `pnpm run check` (TypeScript) limpo, `pnpm exec vite build` compila, `bin/dev` sobe Rails + Vite, página inicial responde HTTP 200 com `id="app"` renderizado.

**Bug real encontrado e corrigido depois (não na geração original):** o `Procfile.dev` gerado lista `vite` antes de `web` — o `foreman` (usado por `bin/dev`) desloca a porta de cada processo em +100 por posição na lista, então o Rails subia na **3100**, não 3000. Isso não é "definido pelo gerador do Inertia" (erro de atribuição que ficou nesta mesma seção por um tempo) — é só ordem no Procfile. Isso quebrava silenciosamente o Tidewave MCP (`.mcp.json` aponta pra `http://localhost:3000/tidewave/mcp`, fixo) sempre que alguém seguisse o fluxo documentado (`bin/dev`), só funcionando por acidente quando testado via `bin/rails server -p 3000` direto. Corrigido invertendo a ordem no `Procfile.dev` (`web` primeiro) — confirmado com Playwright MCP navegando pra `http://localhost:3000` e recebendo a página renderizada de verdade (React montado, sem erro de console).

**Outro resquício encontrado no caminho:** `app/views/layouts/application.html.erb` tinha `stylesheet_link_tag "application"` (tag do asset pipeline padrão do Rails), mas o scaffold foi gerado com `--skip-asset-pipeline` — sem Propshaft/Sprockets, essa tag sempre 404ava (`GET /stylesheets/application.css` → 404), confirmado como erro de console real ao navegar pela página via Playwright MCP. Removida a tag e o arquivo vazio `app/assets/stylesheets/application.css` que ela referenciava — o CSS real da aplicação já vem 100% do Vite (`vite_stylesheet_tag "application"`, linha seguinte, inalterada).

## Pra replicar esse ambiente do zero

1. Leia este arquivo inteiro antes de começar.
2. Siga a seção "O que já foi feito" na ordem.
3. A seção "Pendente" ainda não tem passo a passo aqui — ela vira instrução real conforme a Etapa 2 acontece, para não documentar um plano hipotético como se já tivesse sido executado.
