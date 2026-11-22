import { Store } from "lucide-react";

import { type SidebarBrandProps } from "./SidebarBrand.types";
import { sidebarBrand } from "./SidebarBrand.variants";

export default function SidebarBrand({
  name,
  logoUrl,
  collapsed = false,
  bordered = true,
}: SidebarBrandProps) {
  const slots = sidebarBrand({ collapsed, bordered });

  return (
    <div className={slots.root()}>
      <span className={slots.mark()}>
        {logoUrl ? (
          // O nome da loja já aparece ao lado (ou no título da página) — o
          // logo é decorativo, então não repete o nome pro leitor de tela.
          <img src={logoUrl} alt="" className="size-full object-cover" />
        ) : (
          <Store className="size-5" aria-hidden="true" />
        )}
      </span>
      {collapsed ? <span className="sr-only">{name}</span> : null}
      {!collapsed && <span className={slots.name()}>{name}</span>}
    </div>
  );
}
