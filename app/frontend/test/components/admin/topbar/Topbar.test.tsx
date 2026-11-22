import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Breadcrumbs from "@/components/admin/breadcrumbs/Breadcrumbs";
import Topbar from "@/components/admin/topbar/Topbar";
import UserMenu from "@/components/admin/user-menu/UserMenu";

vi.mock("@inertiajs/react", () => ({ Link: "a" }));

describe("Breadcrumbs", () => {
  it("é uma região de navegação rotulada", () => {
    render(<Breadcrumbs items={["Administração", "Admins"]} />);

    expect(
      screen.getByRole("navigation", { name: "Você está em" }),
    ).toBeInTheDocument();
  });

  it("marca só o último item como a página atual", () => {
    render(<Breadcrumbs items={["Administração", "Admins"]} />);

    expect(screen.getByText("Admins")).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Administração")).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("com um item só, ele é a página atual e não há separador", () => {
    const { container } = render(<Breadcrumbs items={["Perfil"]} />);

    expect(screen.getByText("Perfil")).toHaveAttribute("aria-current", "page");
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("separadores são decorativos", () => {
    const { container } = render(<Breadcrumbs items={["A", "B", "C"]} />);

    const separators = container.querySelectorAll("svg");
    expect(separators).toHaveLength(2);
    separators.forEach((separator) => {
      expect(separator).toHaveAttribute("aria-hidden", "true");
    });
  });
});

describe("Topbar", () => {
  it("renderiza breadcrumbs, o item à esquerda e as ações à direita", () => {
    render(
      <Topbar
        breadcrumbs={["Perfil"]}
        leading={<button type="button">Menu</button>}
      >
        <button type="button">Ação</button>
      </Topbar>,
    );

    const header = screen.getByRole("banner");
    expect(within(header).getByText("Perfil")).toBeInTheDocument();
    expect(
      within(header).getByRole("button", { name: "Menu" }),
    ).toBeInTheDocument();
    expect(
      within(header).getByRole("button", { name: "Ação" }),
    ).toBeInTheDocument();
  });
});

describe("UserMenu", () => {
  const props = {
    email: "ana.souza@loja.com",
    roleName: "Gerente",
    profileHref: "/admin/profile",
    onSignOut: vi.fn(),
  };

  it("começa fechado e mostra as iniciais no avatar", () => {
    render(<UserMenu {...props} />);

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(screen.getByText("AS")).toBeInTheDocument();
  });

  it("abre com a identidade, o perfil e o sair", async () => {
    const user = userEvent.setup();
    render(<UserMenu {...props} />);

    await user.click(screen.getByRole("button", { name: "Menu da conta" }));

    const menu = await screen.findByRole("menu");
    expect(within(menu).getByText("ana.souza@loja.com")).toBeInTheDocument();
    expect(within(menu).getByText("Gerente")).toBeInTheDocument();
    expect(
      within(menu).getByRole("menuitem", { name: "Perfil" }),
    ).toHaveAttribute("href", "/admin/profile");
    expect(
      within(menu).getByRole("menuitem", { name: "Sair" }),
    ).toBeInTheDocument();
  });

  it("chama onSignOut ao escolher Sair", async () => {
    const user = userEvent.setup();
    const onSignOut = vi.fn();
    render(<UserMenu {...props} onSignOut={onSignOut} />);

    await user.click(screen.getByRole("button", { name: "Menu da conta" }));
    await user.click(await screen.findByRole("menuitem", { name: "Sair" }));

    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it("fecha com Esc sem sair", async () => {
    const user = userEvent.setup();
    const onSignOut = vi.fn();
    render(<UserMenu {...props} onSignOut={onSignOut} />);
    await user.click(screen.getByRole("button", { name: "Menu da conta" }));
    await screen.findByRole("menu");

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(onSignOut).not.toHaveBeenCalled();
  });
});
