import { useTranslation } from "react-i18next";

import SidebarItem from "@/components/admin/sidebar-item/SidebarItem";

import { type SidebarNavProps } from "./SidebarNav.types";

export default function SidebarNav({
  sections,
  activeItemKey,
  collapsed = false,
  onNavigate,
}: SidebarNavProps) {
  const { t } = useTranslation();

  // overflow-x-hidden é explícito mesmo sem nenhum conteúdo pensado pra
  // rolar na horizontal: ao expandir a sidebar, o rótulo de cada item
  // aparece de uma vez (sem animação própria) enquanto a largura do <aside>
  // ainda está em transição CSS, deixando o conteúdo do nav mais largo que
  // o nav por ~150ms. Com overflow-x no valor inicial (visible) e
  // overflow-y em auto, a spec de overflow do CSS força o overflow-x
  // computado também pra auto — e o navegador desenha a barra de rolagem
  // horizontal nativa durante essa janela (ver docs/bugs/code-structure.md).
  return (
    <nav
      aria-label={t("shared.panelLayout.sidebar.navLabel")}
      className="flex-1 space-y-6 overflow-x-hidden overflow-y-auto px-3 py-4"
    >
      {sections.map((section) => (
        <div key={section.key}>
          {collapsed ? (
            <div className="mx-auto mb-2 h-px w-6 bg-line" aria-hidden="true" />
          ) : (
            <p className="mb-2 px-3 text-xs font-semibold tracking-wider text-fg-subtle uppercase">
              {t(section.labelKey)}
            </p>
          )}
          <ul className="space-y-1">
            {section.items.map((item) => (
              <li key={item.key}>
                <SidebarItem
                  icon={item.icon}
                  label={t(item.labelKey)}
                  href={item.href()}
                  active={item.key === activeItemKey}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
