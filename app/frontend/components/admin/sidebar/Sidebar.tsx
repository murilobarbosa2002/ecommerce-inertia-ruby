import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

import SidebarBrand from "@/components/admin/sidebar-brand/SidebarBrand";
import SidebarNav from "@/components/admin/sidebar-nav/SidebarNav";
import Button from "@/components/shared/button/Button";
import Tooltip from "@/components/shared/tooltip/Tooltip";

import { type SidebarProps } from "./Sidebar.types";
import { sidebar } from "./Sidebar.variants";

export default function Sidebar({
  sections,
  activeItemKey,
  brandName,
  logoUrl,
  collapsed,
  onToggleCollapsed,
}: SidebarProps) {
  const { t } = useTranslation();
  const toggleLabel = collapsed
    ? t("shared.panelLayout.sidebar.expand")
    : t("shared.panelLayout.sidebar.collapse");
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  const toggle = (
    <Button
      type="button"
      intent="ghost"
      size={collapsed ? "icon" : "md"}
      aria-label={toggleLabel}
      aria-expanded={!collapsed}
      onClick={onToggleCollapsed}
      className={collapsed ? "mx-auto" : "w-full justify-start"}
    >
      <ToggleIcon className="size-5" aria-hidden="true" />
      {!collapsed && toggleLabel}
    </Button>
  );

  return (
    <aside className={sidebar({ collapsed })}>
      <SidebarBrand name={brandName} logoUrl={logoUrl} collapsed={collapsed} />
      <SidebarNav
        sections={sections}
        activeItemKey={activeItemKey}
        collapsed={collapsed}
      />
      <div className="border-t border-line p-3">
        {collapsed ? (
          <Tooltip content={toggleLabel} side="right">
            {toggle}
          </Tooltip>
        ) : (
          toggle
        )}
      </div>
    </aside>
  );
}
