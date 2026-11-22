import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Dialog as RadixDialog } from "radix-ui";
import { useTranslation } from "react-i18next";

import SidebarBrand from "@/components/admin/sidebar-brand/SidebarBrand";
import SidebarNav from "@/components/admin/sidebar-nav/SidebarNav";
import Button from "@/components/shared/button/Button";

import { type MobileNavProps } from "./MobileNav.types";
import { mobileNav } from "./MobileNav.variants";

// Navegação do painel no mobile: botão de menu + drawer lateral com o mesmo
// conteúdo da sidebar. Fecha ao navegar (o layout persiste entre páginas do
// Inertia, então sem isso o drawer ficaria aberto sobre a página nova).
export default function MobileNav({
  sections,
  activeItemKey,
  brandName,
  logoUrl,
}: MobileNavProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const slots = mobileNav();

  return (
    <RadixDialog.Root open={open} onOpenChange={setOpen}>
      <RadixDialog.Trigger asChild>
        <Button
          type="button"
          intent="ghost"
          size="icon"
          aria-label={t("shared.panelLayout.mobileNav.open")}
          className="lg:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </RadixDialog.Trigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={slots.overlay()} />
        <RadixDialog.Content
          aria-describedby={undefined}
          className={slots.content()}
        >
          <RadixDialog.Title className="sr-only">
            {t("shared.panelLayout.mobileNav.title")}
          </RadixDialog.Title>
          <div className="flex items-center border-b border-line">
            <div className="flex-1">
              <SidebarBrand
                name={brandName}
                logoUrl={logoUrl}
                bordered={false}
              />
            </div>
            <RadixDialog.Close asChild>
              <Button
                type="button"
                intent="ghost"
                size="icon"
                aria-label={t("shared.panelLayout.mobileNav.close")}
                className="mr-3"
              >
                <X className="size-5" aria-hidden="true" />
              </Button>
            </RadixDialog.Close>
          </div>
          <SidebarNav
            sections={sections}
            activeItemKey={activeItemKey}
            onNavigate={() => {
              setOpen(false);
            }}
          />
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
