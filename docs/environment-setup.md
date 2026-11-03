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

### Git hooks do repositório

Status: feito.

```bash
git config core.hooksPath .githooks
```

Ativa `.githooks/commit-msg`, que bloqueia qualquer commit com atribuição de autoria de IA (ver `CONTRIBUTING.md`, seção "Sem atribuição de IA"). **Precisa ser rodado de novo em qualquer novo clone** deste repositório — não é algo que se propaga sozinho.

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

### MCP servers — configuração

Status: `.mcp.json` criado com Playwright, Chrome DevTools e GitHub.

- **Playwright** e **Chrome DevTools**: rodam via `pnpm dlx` — pnpm já instalado (ver seção "mise"), prontos pra conectar.
- **GitHub**: roda via Docker (`docs/adr/0008`), depende de duas coisas pendentes do seu lado:
  1. Criar um Personal Access Token fine-grained em github.com/settings/tokens, escopo só neste repo, permissões Contents/Pull requests/Issues (read/write).
  2. Exportar como variável de ambiente, **nunca num arquivo do repo**: `export GITHUB_PAT="ghp_..."` no `~/.bashrc`, depois `source ~/.bashrc`. O `.mcp.json` referencia `${GITHUB_PAT}` — o valor real nunca é commitado.
- **Rails Dev MCP** (`obie/rails-dev-mcp`) entra no `.mcp.json` só depois que a aplicação Rails existir (seção "Pendente").

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

Ruleset criado via API (`POST /repos/<owner>/<repo>/rulesets`), aplicando na branch padrão: exige PR antes de merge, exige os checks `check`/`lint`/`scan_ruby` verdes, bloqueia force-push e exclusão da `main`. Sem exigência de aprovação de terceiro (repo de mantenedor único) e sem bypass configurado — nem admin pula a regra, o fluxo de PR+CI já seguido por convenção agora é garantido tecnicamente, mesma lógica do hook+CI de atribuição de IA.

## Pendente (Fase 2 — ambiente da aplicação)

Esta seção é atualizada com os comandos reais conforme cada item é de fato feito, não antes:

- [ ] Playwright instalado e configurado (entra quando houver fluxo de UI real pra testar, ver `CONTRIBUTING.md`)
- [ ] Gem `rails-dev-mcp` instalada e adicionada ao `.mcp.json`
- [ ] Personal Access Token do GitHub criado e `GITHUB_PAT` exportado no shell
- [ ] Playwright MCP, Chrome DevTools MCP, GitHub MCP e Rails Dev MCP todos conectando de verdade
- [ ] CI do GitHub Actions estendido com RSpec/Vitest/markdownlint (hoje tem brakeman/bundler-audit/rubocop do Rails + o check de atribuição de IA)

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

Verificação: `pnpm run check` (TypeScript) limpo, `pnpm exec vite build` compila, `bin/dev` sobe Rails (porta 3100, definida pelo gerador do Inertia) + Vite, página inicial responde HTTP 200 com `id="app"` renderizado.

## Pra replicar esse ambiente do zero

1. Leia este arquivo inteiro antes de começar.
2. Siga a seção "O que já foi feito" na ordem.
3. A seção "Pendente" ainda não tem passo a passo aqui — ela vira instrução real conforme a Etapa 2 acontece, para não documentar um plano hipotético como se já tivesse sido executado.
