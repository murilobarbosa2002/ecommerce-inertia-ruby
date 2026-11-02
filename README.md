# Ecommerce Inertia Ruby

Template open source e **white-label de e-commerce de produtos digitais**, construído com [Inertia Rails](https://inertia-rails.dev/) (Ruby on Rails + React). Licenciado sob [MIT](LICENSE) — qualquer pessoa pode usar, modificar, redistribuir ou vender soluções baseadas neste código, sem precisar de permissão.

> Status: esqueleto da aplicação (Rails + Inertia + React + Tailwind) rodando. Ainda sem funcionalidades de produto/CMS — ver `docs/adr/` para o que já foi decidido.

## O que é

Escopo: **produtos digitais apenas** — entrega após pagamento é digital (download, licença/chave, acesso liberado). Sem frete, estoque físico ou logística (ver `docs/adr/0007-digital-products-only-scope.md`).

O core de e-commerce (catálogo, carrinho, checkout, pedidos) é agnóstico de marca/conteúdo por design, dentro desse escopo. Um painel de admin/CMS — **100% codado, sem page builder visual** — permite configurar cada instância para um negócio específico: quais páginas existem (landing page, hot page, institucional), conteúdo, catálogo de produtos digitais, SEO, estatísticas e gestão geral da loja. O painel configura conteúdo/marca, não troca o tipo de comércio — adaptar para produtos físicos exige fork e desenvolvimento, não é uma opção de configuração.

Cada deploy é uma instância própria e configurável (sem multi-tenancy). Ver `docs/adr/0002-single-store-instance-not-multitenant.md`.

## Decisões fixadas

- **Escopo: produtos digitais apenas.** Sem frete, estoque físico ou logística. (`docs/adr/0007`)
- **Instância única configurável**, não multi-tenant. (`docs/adr/0002`)
- **Painel de admin/CMS 100% codado à mão**, sem gem de scaffolding e sem page builder visual. (`docs/adr/0003`)
- **Ambiente de desenvolvimento nativo**, sem Docker. (`docs/adr/0005`)
- **Licença MIT, open source.** Uso, modificação e venda livres, sem necessidade de autorização. (`docs/adr/0006`)

Racional completo de cada decisão em [`docs/adr/`](docs/adr/).

## Stack

- **Backend:** Ruby on Rails + [inertia_rails](https://rubygems.org/gems/inertia_rails)
- **Frontend:** React (via Inertia.js), TypeScript, Tailwind CSS
- **Banco:** PostgreSQL
- **Testes:** RSpec + Capybara/Cuprite (backend), Vitest + React Testing Library (frontend), Playwright (e2e)
- **Qualidade:** Rubocop, Brakeman, ESLint, Prettier

Arquitetura segue explicitamente Clean Code, Clean Architecture e SOLID — ver `docs/adr/0004-clean-architecture-solid-as-baseline.md`.

## Como rodar localmente

Gerenciamento de versões via [mise](https://mise.jdx.dev/) (`mise.toml` no repo fixa as versões de Ruby/Node exatas). Comandos principais (preenchidos conforme o setup do ambiente avança):

```bash
mise install                     # instala Ruby/Node/pnpm nas versões pinadas
bin/setup                        # setup inicial do projeto (quando existir)
bin/dev                          # roda Rails + Vite
bundle exec rspec                # testes backend
pnpm test                        # testes frontend (Vitest)
pnpm dlx playwright test         # testes e2e (quando existirem)
pnpm lint                        # lint JS/TS (ESLint)
pnpm format:check                # formatação JS/TS (Prettier)
bundle exec rubocop              # lint Ruby
bundle exec brakeman             # análise de segurança
pnpm dlx markdownlint-cli2 "**/*.md"  # lint de markdown
```

Depois de clonar, ative os git hooks versionados do repositório (bloqueiam, entre outras coisas, qualquer commit com atribuição de autoria de IA — ver `CONTRIBUTING.md`):

```bash
git config core.hooksPath .githooks
```

## Usar este template para o seu próprio negócio

Veja [`docs/adapting-to-a-new-niche.md`](docs/adapting-to-a-new-niche.md) para o passo a passo de fork/adaptação.

## Contribuindo

Veja [`CONTRIBUTING.md`](CONTRIBUTING.md). Reportar vulnerabilidade de segurança: veja [`SECURITY.md`](SECURITY.md).

## Documentação

- [`CONTRIBUTING.md`](CONTRIBUTING.md) — processo de contribuição, padrões de código, testes.
- [`docs/adr/`](docs/adr/) — Architecture Decision Records (decisões de arquitetura e seus porquês).
- [`docs/adapting-to-a-new-niche.md`](docs/adapting-to-a-new-niche.md) — guia de fork/adaptação.
- [`docs/environment-setup.md`](docs/environment-setup.md) — runbook de como o ambiente de desenvolvimento foi configurado, pra replicar numa máquina nova.
- `.claude/` — configuração de agentes de IA (Claude Code) para este repositório; não é documentação do projeto para humanos.

## Licença

[MIT](LICENSE).
