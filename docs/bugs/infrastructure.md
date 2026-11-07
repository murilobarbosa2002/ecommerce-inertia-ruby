# Bugs: infraestrutura

Bugs relacionados a banco de dados, cache, criptografia, variáveis de ambiente e deploy. Ver `docs/bugs/README.md` para o índice geral e o template de entrada.

## CI sem `RAILS_MASTER_KEY` pro job de teste

- **Data:** 2026-11-04
- **Severidade:** alta
- **PR:** #33

### O que aconteceu

O job `test` do CI (`.github/workflows/ci.yml`) passou a falhar com `ActiveRecord::Encryption::Errors::Configuration` depois da PR do 2FA ser aberta — o `otp_secret` do model `Admin` usa `encrypts` (Active Record Encryption), que precisa decriptar `config/credentials.yml.enc` em runtime, mesmo em ambiente de teste.

### Causa raiz

Até então, nenhum código do projeto dependia de decriptar credentials em runtime — só o `master.key` local era necessário pra editar credentials, nunca pra rodar a aplicação/testes. O CI nunca precisou da variável `RAILS_MASTER_KEY`, então ela nunca tinha sido configurada como secret do repositório.

### Como foi encontrado

CI da PR do 2FA (#32) falhando no job `test`, com o erro de configuração do Active Record Encryption no log.

### Impacto

Bloqueava completamente o CI de qualquer PR que precisasse rodar os testes depois da introdução do 2FA — nenhum merge seguro possível sem essa variável.

### Correção

Secret `RAILS_MASTER_KEY` criado no repositório GitHub (`gh secret set RAILS_MASTER_KEY < config/master.key`) e referenciado no `env` do job `test` em `.github/workflows/ci.yml`.

### Verificação

Confirmado pelo próprio CI: o job `test` voltou a passar depois da correção, no mesmo PR que a introduziu (isolado em PR própria, mergeado antes de reabrir/continuar a PR do 2FA).

## CVEs do Rails 8.1.4 (um crítico) sinalizados pelo bundler-audit

- **Data:** 2026-11-05
- **Severidade:** crítica
- **PR:** #36

### O que aconteceu

O job `scan_ruby` do CI começou a falhar numa PR de documentação (sem nenhuma mudança de código), sinalizando 14 vulnerabilidades no Rails 8.1.4 — a base de dados do `bundler-audit` (`ruby-advisory-db`) tinha sido atualizada com um lote de advisories novos pro Rails, incluindo uma crítica (`GHSA-f3w6-w445-fwh9`, leitura/escrita arbitrária de arquivo na análise de imagem do Active Storage) e uma alta (`GHSA-v924-7rp8-4mxh`, possível RCE em preview de vídeo).

### Causa raiz

Vulnerabilidade na própria versão do Rails usada pelo projeto (`8.1.4`), descoberta e divulgada depois do lançamento dessa versão — não é um erro de configuração do projeto, é uma dependência que ficou vulnerável com o tempo.

### Como foi encontrado

CI de uma PR não relacionada (documentação) falhando no job `scan_ruby`, deixando claro que o problema era pré-existente no `main`, não introduzido por essa PR.

### Impacto

Qualquer deploy rodando Rails 8.1.4 ficava exposto às vulnerabilidades listadas, a mais grave permitindo leitura/escrita arbitrária de arquivo via análise de imagem do Active Storage. Também bloqueava o CI de toda PR a partir daquele ponto (check obrigatório).

### Correção

`bundle update rails` (o `Gemfile` já fixa `~> 8.1.4`, que permite a atualização de patch) atualizando todas as gems do Rails pra `8.1.4.1`, versão que corrige todos os advisories listados.

### Verificação

`bin/bundler-audit` limpo (0 vulnerabilidades, eram 14) depois da atualização; `bin/brakeman`, `bundle exec rubocop` e `bundle exec rspec` (121 examples) confirmados limpos/verdes na mesma PR, pra garantir que o bump de patch não quebrou nada.
