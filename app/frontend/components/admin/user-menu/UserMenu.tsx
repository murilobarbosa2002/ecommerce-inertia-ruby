import { Link } from "@inertiajs/react";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";

import Avatar from "@/components/shared/avatar/Avatar";
import DropdownMenu from "@/components/shared/dropdown-menu/DropdownMenu";
import DropdownMenuContent from "@/components/shared/dropdown-menu/dropdown-menu-content/DropdownMenuContent";
import DropdownMenuItem from "@/components/shared/dropdown-menu/dropdown-menu-item/DropdownMenuItem";
import DropdownMenuLabel from "@/components/shared/dropdown-menu/dropdown-menu-label/DropdownMenuLabel";
import DropdownMenuSeparator from "@/components/shared/dropdown-menu/dropdown-menu-separator/DropdownMenuSeparator";
import DropdownMenuTrigger from "@/components/shared/dropdown-menu/dropdown-menu-trigger/DropdownMenuTrigger";

import { type UserMenuProps } from "./UserMenu.types";

export default function UserMenu({
  email,
  roleName,
  profileHref,
  onSignOut,
}: UserMenuProps) {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button
          type="button"
          aria-label={t("shared.panelLayout.userMenu.label")}
          className="flex items-center gap-2 rounded-full p-1 pr-2 transition-colors select-none hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <Avatar name={email} size="sm" />
          <ChevronDown
            className="hidden size-4 text-fg-muted sm:block"
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          <span className="block truncate text-sm font-semibold text-fg">
            {email}
          </span>
          <span className="block truncate">{roleName}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={profileHref}>
            <UserRound className="size-4" aria-hidden="true" />
            {t("shared.panelLayout.profile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem tone="danger" onSelect={onSignOut}>
          <LogOut className="size-4" aria-hidden="true" />
          {t("shared.panelLayout.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
