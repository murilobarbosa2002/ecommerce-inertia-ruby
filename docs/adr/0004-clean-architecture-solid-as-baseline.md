# 0004 - Clean Code, Clean Architecture e SOLID como baseline

## Status

Aceito

## Contexto

O projeto é um template open source e white-label (licença MIT, ver `docs/adr/0006-open-source-mit-license.md`) reutilizado para negócios de nichos diferentes entre si. Isso cria uma pressão concreta — não só estética — por arquitetura limpa: toda vez que o template for adaptado para um novo nicho, o custo dessa adaptação depende diretamente de quão acoplado o domínio core está a decisões específicas de um nicho anterior.

## Decisão

O projeto segue explicitamente **Clean Code**, **Clean Architecture** e **SOLID** como baseline obrigatório, não como aspiração informal:

- Regra de negócio isolada em objetos de domínio/service objects, fora de controllers e callbacks de ActiveRecord.
- Dependências apontam para dentro: infraestrutura (banco, gateways de pagamento, e-mail) implementa interfaces que o domínio define, nunca o contrário.
- Qualquer coisa específica de nicho/negócio (textos, tema, quais páginas existem, SEO) é **configuração** injetada no domínio core — o core nunca depende de detalhes de um nicho específico.
- Classes pequenas, com responsabilidade única (SRP); composição preferida a herança profunda.
- Nomes revelam intenção; comentários só quando explicam um "porquê" não óbvio.

## Consequências

- Mais disciplina e, possivelmente, mais código de "glue" (interfaces, service objects) do que uma abordagem Rails mais "convencional"/ativa-registro-cêntrica. Esse custo é aceito deliberadamente em troca de reuso real entre adoções do template em nichos diferentes.
- Reviews de código e de testes devem avaliar não só "funciona" mas "está no lugar certo" e "o teste de fato verifica o comportamento certo" (ver seção de Testes em `CONTRIBUTING.md`).
- Ao avaliar PRs/alterações futuras, um controller engordando, lógica de negócio em callback, ou uma feature de nicho vazando para model/service compartilhado é motivo de revisão antes de seguir.
