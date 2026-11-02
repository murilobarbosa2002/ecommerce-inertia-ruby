# 0002 - Instância única configurável, não multi-tenant

## Status

Aceito

## Contexto

O projeto é um template open source (ver `docs/adr/0006-open-source-mit-license.md`) para e-commerce de produtos digitais (ver `docs/adr/0007-digital-products-only-scope.md`), reutilizável por negócios diferentes dentro desse escopo. Havia duas formas plausíveis de suportar múltiplos usos do template:

1. Uma única aplicação multi-tenant, onde várias lojas convivem no mesmo banco, isoladas por `tenant_id` ou schema.
2. Uma instância por adoção do template: quem for usar o template roda seu próprio deploy, configurado (conteúdo, catálogo, marca) através de um painel de CMS.

## Decisão

Cada deploy é uma **instância própria** da aplicação (um deploy, um banco), configurada através do painel de CMS. Não há isolamento multi-tenant dentro do mesmo banco/processo. Importante: essa configuração é de conteúdo/catálogo/marca dentro do domínio fixo de produtos digitais (`docs/adr/0007`) — o painel não troca o tipo fundamental de comércio (ex. não vira um e-commerce de produtos físicos por configuração).

## Consequências

- Modelagem de dados, autenticação e rotas assumem contexto de "uma loja" — sem necessidade de `tenant_id` em todo lugar, sem risco de vazamento de dados entre tenants.
- Adotar o template para um novo negócio = novo deploy configurado, não um novo registro de tenant num sistema compartilhado. Mais simples de operar e de raciocinar sobre segurança/isolamento.
- Trade-off aceito: não há economia de infraestrutura de rodar "todas as lojas" num único processo/banco; cada deploy tem seu próprio custo de hospedagem, a cargo de quem o opera. Dado que o template não se propõe a ser um SaaS multi-tenant de massa, esse trade-off é aceitável.
- Se no futuro surgir a necessidade de uma oferta SaaS multi-tenant de fato (fork ou variante do template), isso exigirá um novo ADR e uma revisão estrutural do data model (não é só "ligar uma flag").
