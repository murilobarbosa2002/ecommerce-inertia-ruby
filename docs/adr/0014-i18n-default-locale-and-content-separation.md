# 0014 - pt-BR como locale padrão e separação de conteúdo de I18n

## Status

Aceito

## Contexto

Durante a implementação da identidade de admin (`docs/adr/0013`), o mantenedor apontou que texto literal direto no código (prompt de CLI, mensagem de sucesso) deveria estar separado em arquivo editável sem precisar tocar código Ruby/TypeScript. Isso levou à adoção de I18n do Rails pra todo texto visível a humano a partir de agora — CLI, e-mail, formulário, mensagem de erro.

Até este ADR, a aplicação não tinha nenhum arquivo de locale customizado (só o stub padrão `config/locales/en.yml`, gerado pelo scaffold e nunca usado — removido por este ADR). O locale padrão era o `:en` implícito do Rails, mesmo todo o resto do projeto (docs, ADRs, convenções, todo conteúdo já escrito) sendo em português.

## Decisão

**`config.i18n.default_locale = :"pt-BR"`** em `config/application.rb` — consistente com o resto do projeto já sendo em português. Não há motivo pra conteúdo visível a usuário (admin hoje, cliente no futuro) ficar em inglês enquanto tudo em volta é português.

**Gem `rails-i18n`** adicionado — fornece as traduções oficiais do próprio framework pra pt-BR (mensagens de validação do ActiveRecord/ActiveModel, como "has already been taken" → "já está em uso", formato de data/hora, pluralização). Sem isso, teríamos uma mistura de mensagem customizada em português com mensagem de framework em inglês.

**Conteúdo de I18n é organizado em arquivos separados por categoria**, não um arquivo genérico único:

- `config/locales/pt-BR.yml` — conteúdo real do produto (model, atributo, formulário, e-mail, página).
- `config/locales/cli.pt-BR.yml` — texto de ferramentas internas de linha de comando (rake tasks).

São categorias de responsabilidade e de frequência/risco de mudança bem diferentes: CLI é uso interno do mantenedor, baixíssima frequência de mudança; conteúdo de produto é visto por usuário final, pode precisar de revisão/ajuste de tom com mais cuidado. Misturar os dois num arquivo só dificultaria encontrar e revisar cada categoria.

**Regra geral, também em `CONTRIBUTING.md`**: todo texto novo visível a humano passa por chave de locale (`I18n.t`/`t`), nunca string literal direto no código. A única exceção aceitável é texto de debug/log interno que nunca é visto por humano fora de desenvolvimento.

## Consequências

- Todo PR que adicionar texto visível a humano (formulário, e-mail, mensagem de erro, página) precisa decidir em qual arquivo de locale a chave entra (produto vs CLI) e seguir a convenção de chave por área (ex. `cli.admin.create.*` hoje; `mailers.*`/`admin.*` conforme esses recursos forem chegando).
- Mensagens de validação existentes que antes assumiam o texto padrão em inglês do Rails (ex. em teste) precisaram ser atualizadas pro texto em português correspondente — isso não é um bug introduzido, é consequência direta e esperada da mudança de locale padrão.
- Se o projeto um dia precisar de suporte a múltiplos idiomas de verdade (ex. adaptação pra outro mercado via `docs/adapting-to-a-new-niche.md`), a estrutura de arquivo por locale já está pronta pra isso — só precisa adicionar o arquivo do novo locale, sem reestruturar nada.
