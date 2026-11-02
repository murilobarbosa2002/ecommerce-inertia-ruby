# 0007 - Escopo: e-commerce de produtos digitais apenas

## Status

Aceito

## Contexto

O template precisa de um escopo de domínio concreto para existir (não é possível modelar "e-commerce genérico para qualquer tipo de produto" sem acabar com um domínio inchado ou raso demais). Comércio de produtos físicos (frete, transportadoras, estoque físico, peso/dimensão para cálculo de envio, endereço de entrega) e comércio de produtos digitais (download, chave de licença, acesso liberado após pagamento) têm necessidades de domínio bem diferentes.

Era importante decidir qual desses dois mundos este template versão open source resolve de verdade, em vez de tentar cobrir os dois parcialmente.

## Decisão

Esta versão do template modela **exclusivamente e-commerce de produtos digitais**: venda de produtos cuja entrega, após o pagamento, é digital (download, chave/licença, acesso a conteúdo, etc.). Não há modelagem de frete, estoque físico, peso/dimensão de produto, nem endereço de entrega.

O painel de admin/CMS configura conteúdo, páginas, SEO, catálogo dos produtos digitais da loja e tema — ele **não** troca o domínio de produto (ex. não existe uma opção "ativar modo produto físico"). Adaptar este template para vender produtos físicos é um trabalho de desenvolvimento real (fork + modelagem de domínio nova: frete, estoque, logística), não uma configuração. Ver `docs/adapting-to-a-new-niche.md`.

## Consequências

- Checkout não precisa de endereço de entrega nem cálculo de frete — o fluxo de pagamento → liberação de acesso/entrega digital é o core.
- "Nicho" configurável pelo painel, neste template, significa: que tipos de produto digital a loja vende, conteúdo, marca, páginas ativas, SEO — não o tipo fundamental de comércio (físico vs. digital).
- O domínio ainda deve ser desenhado respeitando Clean Architecture/SOLID (`docs/adr/0004`), para que uma eventual extensão para produtos físicos (se algum dia for um objetivo real) seja uma adição de domínio, não uma reescrita — mas isso não é uma meta ativa desta versão, só uma consequência de arquitetura limpa, não um requisito a construir antecipadamente.
- `docs/adr/0002-single-store-instance-not-multitenant.md` e `docs/adr/0004-clean-architecture-solid-as-baseline.md` devem ser lidos à luz deste escopo: "nicho" ali se refere a variações dentro do universo de produtos digitais.
