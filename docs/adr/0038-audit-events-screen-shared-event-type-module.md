# 0038 - Tela de auditoria completa e módulo compartilhado de tipo de evento

## Status

Aceito

## Contexto

O dashboard já mostra um resumo de atividade recente (`AuditEvents::RecentActivity`), mas restrito a 6 dos 17 tipos reais de `AuditEvent#event_type` — o suficiente como sinal de segurança do dia a dia, mas sem cobrir o log inteiro (ex. revisar todo evento de um admin específico, ou de um período maior). Faltava uma tela própria, só de leitura, sem esse recorte.

O ícone, o tom de cor e a tradução de cada tipo de evento já existiam, mas hardcoded dentro do `ActivityFeed` (dashboard) e cobrindo só os 6 tipos liberados ali — construir a tela nova copiando esse código duplicaria 17 traduções/ícones/tons em dois lugares, ou deixaria a tela nova sem tradução nos 11 tipos que o dashboard nunca precisou mostrar.

## Decisão

**Módulo compartilhado** (`app/frontend/lib/audit-events/`): `auditEventTypes.ts` (lista dos 17 tipos, ícone e tom por tipo, com fallback neutro pra um tipo desconhecido) e `getAuditEventDescription.ts` (frase descritiva por tipo). O `ActivityFeed` do dashboard passa a importar daqui em vez de manter sua própria cópia — continua restrito aos 6 tipos curados (`FILTERABLE_EVENT_TYPES`, que fica local a ele, já que é uma escolha de produto específica do dashboard), só parou de duplicar tradução/ícone/descrição. As chaves de i18n correspondentes (`admin.auditEvents.types.*`, `.descriptions.*`, `.filters.*`) saem de dentro de `admin.dashboard.show.activity.*` pra um namespace próprio, pelo mesmo motivo.

**`AuditEvents::Search`** (novo query object, não uma extensão de `RecentActivity`): mesmo padrão de `Admins::Search`/`Roles::Search` — busca (ILIKE no e-mail do sujeito ou do ator, via dois `LEFT JOIN` apelidados pra mesma tabela `admins`, já que `AuditEvent` tem duas `belongs_to` pra ela), ordenação (só por `happened_at`/`created_at`, única coluna que a tela expõe como cabeçalho clicável) e paginação manual. Filtro de **usuário dedicado** (`performed_by_admin_ids`, multi-select, mesmo padrão do filtro de tipo), além da busca livre — útil o suficiente (auditar as ações de uma ou mais pessoas específicas ao mesmo tempo) pra não depender só de digitar o e-mail na busca.

**Índice novo em `created_at`** (`audit_events`): o dashboard sempre filtra por um subconjunto pequeno de tipo antes de ordenar, nunca precisou de índice próprio; a tela de auditoria pode ordenar/paginar a tabela inteira sem esse recorte, então o índice evita um *seq scan* conforme o volume de eventos cresce.

**`useDataTable` ganha filtros extras genéricos** (`reload({ page, extra })`, persistidos entre chamadas): Admins/Papéis (Fase B) só tinham busca/ordenação/página; a tela de auditoria precisa também de tipo de evento, ator e período — em vez de uma versão paralela do hook só pra essa tela, `useDataTable` aceita um `extra: Record<string, string | number | boolean>` opcional, mesclado com o que já estava persistido a cada chamada. Admins/Papéis nunca passam `extra`, então continuam exatamente como estavam. A lógica desses filtros extras (6 estados inter-relacionados) fica no hook `useAuditEventFilters.ts`, ao lado do componente de filtro (`docs/adr/0029`).

## Consequências

- Tradução/ícone/tom de tipo de evento tem uma fonte só, reusável por qualquer tela futura que precise mostrar um `AuditEvent` (ex. um detalhe de versão do PaperTrail, se um dia existir).
- `useDataTable` continua um hook só, sem um segundo "useDataTableComFiltros" pra cobrir o caso de uma tela com mais filtro que busca/ordenação — o parâmetro `extra` é genérico o bastante pra qualquer filtro adicional futuro, não só os da auditoria.
- Página por padrão menor na auditoria (10, não os 20 de Admins/Papéis) — log de auditoria cresce mais rápido (um evento por ação, não por registro), então uma página menor mantém a leitura mais enxuta por padrão.
- Celular/e-mail do ator não é pesquisável de forma determinística além do ILIKE — se o volume de eventos crescer o bastante pra isso virar lento, um índice funcional ou busca full-text seria a próxima decisão, não antecipada aqui.
