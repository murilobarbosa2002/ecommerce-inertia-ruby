import { Link } from "@inertiajs/react";

import Tooltip from "@/components/shared/tooltip/Tooltip";

import { type SidebarItemProps } from "./SidebarItem.types";
import { sidebarItem } from "./SidebarItem.variants";

export default function SidebarItem({
  icon: Icon,
  label,
  href,
  active,
  collapsed = false,
  onNavigate,
}: SidebarItemProps) {
  const link = (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={sidebarItem({ active, collapsed })}
    >
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      {collapsed ? (
        <span className="sr-only">{label}</span>
      ) : (
        <span>{label}</span>
      )}
    </Link>
  );

  return (
    <Tooltip content={collapsed ? label : null} side="right">
      {link}
    </Tooltip>
  );
}
