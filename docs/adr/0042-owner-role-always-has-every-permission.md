# 0042 - Papel owner sempre tem toda permissão existente

## Status

Aceito. Reverte a prática, até aqui informal (nunca formalizada como decisão própria em ADR, só em comentário de `db/seeds.rb`), de deixar `manage_store_settings` e `delete_admin` de fora do papel `owner` por padrão, exigindo concessão deliberada pela tela de papéis.

## Contexto

`docs/adr/0021` decidiu o modelo de RBAC (papel com permissões configuráveis), mas nunca fixou uma regra geral sobre o que o papel `owner` deveria ter por padrão. Na prática, `db/seeds.rb` foi acumulando uma mistura: `manage_admins`/`manage_roles`/`reset_two_factor`/`view_audit_log` concedidas automaticamente ao `owner` desde o bootstrap, enquanto `manage_store_settings` (`docs/adr/0030`) e `delete_admin` (`docs/adr/0041`) ficavam de fora de propósito, com o raciocínio de que uma ação sensível o bastante merecia concessão deliberada em vez de automática.

Essa mistura criava um problema real: `owner` é, por definição, o papel de maior confiança do sistema (é quem o bootstrap/CLI sempre atribui ao primeiro admin, e é o único papel que existe garantidamente em qualquer ambiente) — mas podia, na prática, ficar sem conseguir fazer uma ação sensível no próprio painel que ele mesmo administra, até alguém lembrar de ir na tela de papéis conceder manualmente. Cada permissão nova corria o risco de repetir essa escolha caso a caso, sem um critério único.

## Decisão

O papel `owner` sempre tem **toda** `Permission` que existe no sistema, automaticamente, sem exceção — nunca depende de concessão manual pela tela de papéis, nem de `db/seeds.rb` conhecer essa permissão pelo nome. Em código, isso significa:

- `db/seeds.rb` cria cada `Permission` normalmente (`find_or_create_by!`, cada uma com sua própria descrição), mas a concessão ao `owner` não é mais feita permissão a permissão — no fim do arquivo, depois que toda `Permission` já foi criada, um único laço (`Permission.find_each { |p| owner_role.permissions << p unless ... }`) garante que `owner` tenha absolutamente todas.
- Uma permissão nova criada no futuro (seja em `db/seeds.rb`, seja por uma migration/feature que crie `Permission` diretamente) é pega por esse laço sem precisar de nenhuma linha nova pra conceder ao `owner` — só precisa existir no banco antes desse laço rodar.
- Isso não afeta nenhum outro papel: um papel novo continua nascendo sem nenhuma permissão, exatamente como hoje.

## Consequências

- `owner` nunca mais fica sem conseguir fazer alguma ação sensível no próprio painel por falta de concessão manual esquecida — é, na prática, o papel "super-admin" do sistema, e o código agora reflete isso de forma explícita em vez de implícita/acumulada.
- Uma permissão cuja intenção seja **nunca** valer pro `owner` (hipótese não existente até aqui) exigiria uma exceção própria, deliberada e documentada — não é o caso de nenhuma permissão hoje.
- `spec/db/seeds_spec.rb` ganha um teste que prova a garantia pra qualquer permissão, inclusive uma criada depois de um primeiro `db:seed` já ter rodado (não só pras permissões que o arquivo conhece pelo nome hoje) — é essa cobertura que torna a promessa "toda permissão, sempre" confiável a longo prazo, não só verdadeira no momento em que foi escrita.
- `docs/adr/0030`/`docs/adr/0041` continuam válidos quanto ao resto do que decidiram (existência da permissão, o que ela libera, guardas específicas de cada ação) — só a parte de "não concedida ao owner por padrão" deixa de valer.
