import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Home } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import Sidebar from "@/components/admin/sidebar/Sidebar";
import SidebarBrand from "@/components/admin/sidebar-brand/SidebarBrand";
import SidebarItem from "@/components/admin/sidebar-item/SidebarItem";
import SidebarNav from "@/components/admin/sidebar-nav/SidebarNav";
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
        href: () => "/",
      },
      {
        key: "admins",
        labelKey: "shared.panelLayout.nav.admins",
        icon: Home,
        href: () => "/admin/admins",
      },
    ],
  },
];

describe("SidebarBrand", () => {
  it("mostra o nome da loja e o ícone padrão sem logo", () => {
    const { container } = render(
      <SidebarBrand name="Loja Aurora" logoUrl={null} />,
    );

    expect(screen.getByText("Loja Aurora")).toBeInTheDocument();
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("usa o logo quando há um, como imagem decorativa", () => {
    const { container } = render(
      <SidebarBrand name="Loja" logoUrl="/logo.png" />,
    );

    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "/logo.png");
    expect(img).toHaveAttribute("alt", "");
  });

  it("recolhida, esconde o nome da tela mas o mantém pro leitor de tela", () => {
    render(<SidebarBrand name="Loja Aurora" logoUrl={null} collapsed />);

    expect(screen.getByText("Loja Aurora")).toHaveClass("sr-only");
  });
});

describe("SidebarBrand (borda)", () => {
  it("tem a linha divisória por padrão e a remove com bordered=false", () => {
    const { container, rerender } = render(
      <SidebarBrand name="Loja" logoUrl={null} />,
    );
    expect(container.firstChild).toHaveClass("border-b");

    rerender(<SidebarBrand name="Loja" logoUrl={null} bordered={false} />);
    expect(container.firstChild).not.toHaveClass("border-b");
  });
});

describe("SidebarItem", () => {
  it("é um link com o rótulo e o destino", () => {
    render(
      <SidebarItem
        icon={Home}
        label="Admins"
        href="/admin/admins"
        active={false}
      />,
    );

    expect(screen.getByRole("link", { name: "Admins" })).toHaveAttribute(
      "href",
      "/admin/admins",
    );
  });

  it("marca aria-current=page só quando ativo", () => {
    const { rerender } = render(
      <SidebarItem icon={Home} label="Admins" href="/a" active />,
    );
    expect(screen.getByRole("link")).toHaveAttribute("aria-current", "page");

    rerender(
      <SidebarItem icon={Home} label="Admins" href="/a" active={false} />,
    );
    expect(screen.getByRole("link")).not.toHaveAttribute("aria-current");
  });

  it("destaca o ativo com a cor de acento", () => {
    render(<SidebarItem icon={Home} label="Admins" href="/a" active />);

    expect(screen.getByRole("link")).toHaveClass(
      "bg-accent-soft",
      "text-accent-text",
    );
  });

  it("recolhido, o rótulo vira texto só pra leitor de tela", () => {
    render(
      <SidebarItem
        icon={Home}
        label="Admins"
        href="/a"
        active={false}
        collapsed
      />,
    );

    expect(screen.getByText("Admins")).toHaveClass("sr-only");
    expect(screen.getByRole("link", { name: "Admins" })).toBeInTheDocument();
  });

  it("recolhido, mostra o rótulo num tooltip ao focar", async () => {
    const user = userEvent.setup();
    render(
      <SidebarItem
        icon={Home}
        label="Admins"
        href="/a"
        active={false}
        collapsed
      />,
    );

    await user.tab();

    expect(await screen.findByRole("tooltip")).toHaveTextContent("Admins");
  });

  it("chama onNavigate ao clicar", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <SidebarItem
        icon={Home}
        label="Admins"
        href="#"
        active={false}
        onNavigate={onNavigate}
      />,
    );

    await user.click(screen.getByRole("link", { name: "Admins" }));

    expect(onNavigate).toHaveBeenCalledOnce();
  });
});

describe("SidebarNav", () => {
  it("agrupa os itens sob o título da seção", () => {
    render(<SidebarNav sections={sections} activeItemKey={null} />);

    expect(screen.getByText("Geral")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("marca como atual só o item cuja chave é a ativa", () => {
    render(<SidebarNav sections={sections} activeItemKey="admins" />);

    expect(screen.getByRole("link", { name: "Admins" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Painel" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("recolhida, esconde o título da seção", () => {
    render(<SidebarNav sections={sections} activeItemKey={null} collapsed />);

    expect(screen.queryByText("Geral")).not.toBeInTheDocument();
  });

  it("é uma região de navegação rotulada", () => {
    render(<SidebarNav sections={sections} activeItemKey={null} />);

    expect(
      screen.getByRole("navigation", { name: "Navegação principal" }),
    ).toBeInTheDocument();
  });
});

describe("Sidebar", () => {
  const baseProps = {
    sections,
    activeItemKey: null,
    brandName: "Loja",
    logoUrl: null,
    onToggleCollapsed: vi.fn(),
  };

  it("expandida, o botão oferece recolher", () => {
    render(<Sidebar {...baseProps} collapsed={false} />);

    expect(
      screen.getByRole("button", { name: "Recolher menu" }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("recolhida, o botão oferece expandir", () => {
    render(<Sidebar {...baseProps} collapsed />);

    expect(
      screen.getByRole("button", { name: "Expandir menu" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("chama onToggleCollapsed ao clicar no botão", async () => {
    const user = userEvent.setup();
    const onToggleCollapsed = vi.fn();
    render(
      <Sidebar
        {...baseProps}
        collapsed={false}
        onToggleCollapsed={onToggleCollapsed}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Recolher menu" }));

    expect(onToggleCollapsed).toHaveBeenCalledOnce();
  });

  it("a largura acompanha o estado", () => {
    const { container, rerender } = render(
      <Sidebar {...baseProps} collapsed={false} />,
    );
    expect(container.querySelector("aside")).toHaveClass("w-64");

    rerender(<Sidebar {...baseProps} collapsed />);
    expect(container.querySelector("aside")).toHaveClass("w-18");
  });

  it("some no mobile (a navegação vem pelo drawer)", () => {
    const { container } = render(<Sidebar {...baseProps} collapsed={false} />);

    expect(container.querySelector("aside")).toHaveClass("hidden", "lg:flex");
  });

  // Reproduzir em jsdom o tooltip preso na tela (bug real, ver
  // docs/bugs/code-structure.md) depende de timing de hover real do
  // navegador — não dá pra simular de forma confiável aqui. Esta asserção
  // testa a causa raiz diretamente: antes da correção, alternar collapsed
  // trocava o tipo do elemento na árvore (Tooltip vs. botão puro),
  // desmontando e remontando o botão a cada clique — é esse remount que
  // interrompe o fechamento controlado do Radix e deixa o tooltip aberto
  // preso no body. Com o botão sempre dentro do mesmo Tooltip (variando só
  // se o Content é renderizado), o nó do DOM se mantém entre as trocas.
  it("mantém o mesmo nó do botão ao alternar collapsed, sem remontar o tooltip", () => {
    const { rerender } = render(<Sidebar {...baseProps} collapsed />);
    const buttonBefore = screen.getByRole("button", { name: "Expandir menu" });

    rerender(<Sidebar {...baseProps} collapsed={false} />);
    const buttonAfter = screen.getByRole("button", { name: "Recolher menu" });

    expect(buttonAfter).toBe(buttonBefore);
  });
});
