# 0034 - Shell do painel admin: navegação como dado e sidebar recolhível

## Status

Aceito

## Contexto

O painel admin tinha uma barra horizontal fixa com os links escritos direto no `PanelLayout`, cada um condicionado por uma checagem de permissão repetida no JSX. Crescer esse menu (a tela de auditoria, o catálogo e os pedidos já estão previstos) significava editar o layout toda vez, e a barra não comporta mais do que quatro ou cinco itens, nem agrupamento, nem versão mobile.

Os links também eram âncoras comuns (`<a href>`), que recarregam a página inteira a cada navegação. Num painel Inertia isso joga fora o ganho da navegação sem recarga e faz o layout (sidebar, tema) piscar entre páginas.

## Decisão

**Menu como dado.** Os itens vivem em `app/frontend/config/adminNavigation.ts`: seções com itens que declaram chave, rótulo (chave de I18n tipada), ícone, rota (helper de `@/routes`), caminho-base opcional pra marcar o item ativo em subpáginas e a permissão exigida. Item novo é uma entrada nesse arquivo; a `Sidebar` não muda (aberto pra extensão, fechado pra modificação). O perfil do admin fica no menu do usuário, não na navegação.

**Lógica de navegação em funções puras** (`app/frontend/lib/navigation/`): `filterNavigation` esconde itens sem permissão (e seções que ficam vazias) e `findActiveNavItem` acha o item da URL atual, com a raiz (`/`) só casando exata e, entre dois candidatos, vencendo o caminho mais específico. O mesmo resultado alimenta a sidebar, o drawer mobile e o breadcrumb.

**Peças do shell**, cada uma no seu componente (`docs/adr/0019`): `Sidebar` (desktop), `MobileNav` (drawer pelo Radix Dialog, abaixo de `lg`), `SidebarNav`/`SidebarItem`/`SidebarBrand` (compartilhados entre os dois), `Topbar`, `Breadcrumbs` e `UserMenu`. `PanelLayout` só compõe. Navegação usa o `Link` do Inertia, sem recarregar a página; o drawer fecha ao navegar, porque o layout persiste entre páginas.

**Sidebar recolhível**, com a preferência guardada no `localStorage` por `useSidebarState` (hook global em `hooks/`, `useSyncExternalStore` sem Provider, mesmo racional do `useTheme`, `docs/adr/0020`). Recolhida, mostra só os ícones; o rótulo continua como nome acessível e aparece num tooltip. Falha de `localStorage` (modo privado, bloqueado) nunca quebra a página: só perde a preferência.

**Identidade vinda do servidor.** `AdminPanel::BaseController` passa a compartilhar `current_admin` (e-mail e papel) e `store` (nome e URL do logo) em toda página autenticada. `store` lê `StoreSetting.first`, não `StoreSetting.instance`: o segundo cria o registro quando não existe, e compartilhar props numa requisição GET nunca deve escrever no banco.

## Consequências

- Adicionar uma tela ao painel é: criar a página, a rota e uma entrada em `adminNavigation.ts`.
- Mais um nível de componentes em `components/admin/` (uma pasta por peça do shell).
- Todo teste de página que renderiza o `PanelLayout` precisa de `Link` no mock de `@inertiajs/react` (`Link: "a"` basta); os mocks existentes foram atualizados.
- Cada página autenticada passa a serializar mais duas props pequenas e faz uma consulta extra (`StoreSetting.first`) por requisição; aceitável pelo tamanho do dado, e revisitável com cache se virar custo real.
- O breadcrumb sai da própria navegação (seção e item); página fora do menu (ex. perfil) mostra só o título.
