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

## Pendente (Etapa 2 — ambiente da aplicação)

Nada abaixo foi executado ainda. Esta seção é atualizada com os comandos reais conforme cada item é de fato feito, não antes:

- [ ] Pacotes de sistema via apt (`build-essential`, `libssl-dev`, `libyaml-dev`, `libpq-dev`, `postgresql`, etc.)
- [ ] `mise` (gerenciador de versão) + Ruby + Node nas versões pinadas em `mise.toml`
- [ ] PostgreSQL rodando como serviço systemd
- [ ] Scaffold da aplicação Rails + Inertia + React
- [ ] RSpec, Rubocop, Brakeman, Vitest, Playwright instalados e configurados
- [ ] `.mcp.json` com Playwright MCP e GitHub MCP configurados e conectando de verdade (hoje falhariam por falta de Node/credencial)
- [ ] CI do GitHub Actions validado rodando de ponta a ponta num PR real

## Pra replicar esse ambiente do zero

1. Leia este arquivo inteiro antes de começar.
2. Siga a seção "O que já foi feito" na ordem.
3. A seção "Pendente" ainda não tem passo a passo aqui — ela vira instrução real conforme a Etapa 2 acontece, para não documentar um plano hipotético como se já tivesse sido executado.
