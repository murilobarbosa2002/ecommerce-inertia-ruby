import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Home } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import MobileNav from "@/components/admin/mobile-nav/MobileNav";
import { type NavSection } from "@/lib/navigation/navigation.types";

vi.mock("@inertiajs/react", () => ({ Link: "a" }));

const sections: NavSection[] = [
  {
    key: "general",
    labelKey: "shared.panelLayout.sections.general",
    items: [
      {
        key: "dashboard",
        labelKey: "shared.panelLayout.nav.dashboard",
        icon: Home,
        href: () => "#painel",
      },
    ],
  },
];

function renderMobileNav() {
  return render(
    <MobileNav
      sections={sections}
      activeItemKey="dashboard"
      brandName="Loja Aurora"
      logoUrl={null}
    />,
  );
}

describe("MobileNav", () => {
  it("começa fechado, só com o botão de menu", () => {
    renderMobileNav();

    expect(
      screen.getByRole("button", { name: "Abrir menu" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("abre o drawer com a marca e a navegação", async () => {
    const user = userEvent.setup();
    renderMobileNav();

    await user.click(screen.getByRole("button", { name: "Abrir menu" }));

    const dialog = await screen.findByRole("dialog", {
      name: "Menu de navegação",
    });
    expect(dialog).toHaveTextContent("Loja Aurora");
    expect(screen.getByRole("link", { name: "Painel" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("fecha ao escolher um item (o layout persiste entre páginas do Inertia)", async () => {
    const user = userEvent.setup();
    renderMobileNav();
    await user.click(screen.getByRole("button", { name: "Abrir menu" }));

    await user.click(await screen.findByRole("link", { name: "Painel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("fecha pelo botão de fechar", async () => {
    const user = userEvent.setup();
    renderMobileNav();
    await user.click(screen.getByRole("button", { name: "Abrir menu" }));

    await user.click(
      await screen.findByRole("button", { name: "Fechar menu" }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("fecha com Esc", async () => {
    const user = userEvent.setup();
    renderMobileNav();
    await user.click(screen.getByRole("button", { name: "Abrir menu" }));
    await screen.findByRole("dialog");

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
