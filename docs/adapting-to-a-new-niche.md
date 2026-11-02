# Adaptando este template para um novo negócio/nicho

Este projeto é white-label **dentro do escopo de e-commerce de produtos digitais** (ver `docs/adr/0007-digital-products-only-scope.md`): o domínio core é agnóstico de marca/conteúdo dentro desse escopo, e a adaptação para um negócio específico que também vende produtos digitais acontece através de **configuração e conteúdo**, não de alteração do core. Este guia descreve o processo esperado para criar uma nova instância a partir do template.

**Importante:** isso vale para negócios que vendem produtos digitais. Se o seu objetivo é vender produtos físicos (ou qualquer coisa que exija frete, estoque físico, logística), este template **não serve via configuração** — veja a seção 5.

## 1. Fork/clone

1. Faça um fork (ou clone, se for uso privado) do repositório.
2. Configure seu próprio deploy (um banco, um processo — ver `docs/adr/0002-single-store-instance-not-multitenant.md`; este template não é multi-tenant).
3. Renomeie o que for específico de identidade (nome do app, domínio, variáveis de ambiente de branding) — isso é customização de instância, não mudança de core.

## 2. O que é configuração vs. o que é core

- **Configuração**: o que muda de um negócio para outro, feito pelo painel admin/CMS, sem alterar código.
- **Core**: o código que é igual para qualquer negócio que use o template — ao adaptar o template para o seu nicho, você não deveria precisar mexer nele.

| Configuração (via painel admin/CMS — muda por negócio) | Core (código igual para qualquer negócio) |
| --- | --- |
| Quais páginas estão ativas (landing page, hot page, institucional) | Modelagem de catálogo, carrinho, checkout, pedidos |
| Conteúdo e textos das páginas | Regras de negócio de preço/estoque/pagamento |
| SEO (meta tags, etc.) | Autenticação/autorização |
| Tema visual, identidade da marca | Integrações de infraestrutura (banco, gateway de pagamento) |

Se adaptar o template para o seu negócio exigir mudar algo da coluna "core", isso é um sinal de que o core está acoplado a um nicho específico — veja `docs/adr/0004-clean-architecture-solid-as-baseline.md` antes de prosseguir, e considere se a mudança deveria virar configuração para todo mundo (contribuída de volta, ver seção 4) em vez de ficar só no seu fork.

## 3. Criando um novo tipo de página

Como não há page builder visual (`docs/adr/0003-fully-custom-admin-no-page-builder.md`), um novo tipo de página (ex. uma landing page com layout diferente) é trabalho de código:

1. Implemente o componente/view da página seguindo os padrões já existentes.
2. Exponha a opção de ativá-la no painel de CMS.
3. Cubra com testes (ver seção "Testes" do `CONTRIBUTING.md`).
4. Se a decisão tiver implicação arquitetural relevante, registre um ADR.

## 4. Contribuindo essas mudanças de volta

Se a adaptação feita para o seu nicho for genericamente útil (ex. um novo tipo de página que outros negócios também usariam), considere abrir um PR no projeto original — veja [`CONTRIBUTING.md`](../CONTRIBUTING.md). Isso não é obrigatório (a licença MIT não exige), mas ajuda o template a crescer.

## 5. Saindo do escopo de produtos digitais (ex. produtos físicos)

Este template não modela frete, estoque físico, peso/dimensão de produto nem endereço de entrega (`docs/adr/0007-digital-products-only-scope.md`). Vender produtos físicos a partir deste código **não é uma questão de configuração** — é um trabalho de modelagem de domínio novo: checkout com endereço de entrega, cálculo de frete/transportadora, controle de estoque físico, etc. Trate isso como um fork com desenvolvimento real, seguindo os mesmos princípios de arquitetura (`docs/adr/0004-clean-architecture-solid-as-baseline.md`), e não espere que o core atual já suporte isso.
