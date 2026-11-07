# Bugs: estrutura de código

Bugs relacionados a organização de código, namespace, arquitetura e convenção de nomes. Ver `docs/bugs/README.md` para o índice geral e o template de entrada.

## Namespace `Admin::` colidia com o model `Admin`

- **Data:** 2026-11-04
- **Severidade:** média
- **PR:** #28

### O que aconteceu

Ao criar o primeiro controller do painel (`Admin::SessionsController`), definir `module Admin; class SessionsController; end; end` levantava `TypeError: Admin is not a module` — o Ruby não permite reabrir uma classe já existente (`class Admin < ApplicationRecord`, o model) como módulo de namespace.

### Causa raiz

`Admin` já existia como classe (o model), e Ruby trata `module`/`class` com o mesmo nome em escopos incompatíveis como erro de tipo — isso só aparece executando o código (carregando o arquivo do controller), não é detectável lendo a definição isoladamente.

### Como foi encontrado

Ao tentar criar o primeiro controller do painel administrativo sob o namespace `Admin::`, a aplicação falhava ao carregar com `TypeError: Admin is not a module`.

### Impacto

Bloqueava completamente a criação de qualquer controller/service sob o namespace `Admin::` enquanto o model `Admin` existisse — qualquer tentativa de seguir a convenção óbvia de nomenclatura (`Admin::SessionsController` pro painel do `Admin`) falhava.

### Correção

Controllers do painel passaram a usar o namespace Ruby `AdminPanel::` em vez de `Admin::`, mantendo a URL/route helper como `admin_session_path` etc. via `namespace :admin, module: "admin_panel"` em `routes.rb` — só a classe Ruby muda de nome, não a rota pública.

### Verificação

Confirmado que `AdminPanel::SessionsController` carrega e resolve normalmente, enquanto uma tentativa deliberada de usar `Admin::SessionsController` reproduz o `TypeError` original. Documentado em `CONTRIBUTING.md` como regra geral: nome de namespace de controller/service nunca pode colidir com o nome de um model já existente.
