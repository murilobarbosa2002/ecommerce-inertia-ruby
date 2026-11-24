import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PanelLayout from "@/components/admin/panel-layout/PanelLayout";
import {
  admin_admins_path,
  admin_profile_path,
  admin_session_path,
  root_path,
} from "@/routes";

interface MockPage {
  props: {
    current_admin_permissions: string[];
    current_admin_two_factor_enabled: boolean;
    current_admin?: {
      email_address: string;
      first_name: string;
      last_name: string;
      role_name: string;
    } | null;
    store?: { name: string | null; logo_url: string | null };
  };
  flash?: { notice?: string; alert?: string };
  component: string;
  url?: string;
}

const { routerDeleteMock, usePageMock } = vi.hoisted(() => ({
  routerDeleteMock: vi.fn(),
  usePageMock: vi.fn<() => MockPage>(),
}));

vi.mock("@inertiajs/react", () => ({
  Head: () => null,
  Link: "a",
  router: { delete: routerDeleteMock },
  usePage: () => usePageMock(),
}));

// Com 2FA ativo (igual à maioria dos testes, que não são sobre o aviso
// obrigatório) e numa página qualquer fora do fluxo de setup — sem isso, o
// Dialog apareceria e esconderia o resto da página via aria-hidden
// (hideOthers do Radix), quebrando getByRole nos testes que não são sobre
// o próprio Dialog.
const defaultPage: MockPage = {
  props: {
    current_admin_permissions: [],
    current_admin_two_factor_enabled: true,
    current_admin: {
      email_address: "ana.souza@loja.com",
      first_name: "Ana",
      last_name: "Souza",
      role_name: "Gerente",
    },
    store: { name: null, logo_url: null },
  },
  component: "Admin/Dashboard/Show",
  url: "/",
};

function withPermissions(permissions: string[]): MockPage {
  return {
    ...defaultPage,
    props: { ...defaultPage.props, current_admin_permissions: permissions },
  };
}

describe("PanelLayout", () => {
  beforeEach(() => {
    routerDeleteMock.mockClear();
    localStorage.clear();
    usePageMock.mockReturnValue(defaultPage);
  });

  it("renderiza o conteúdo da página", () => {
    render(
      <PanelLayout title="Painel">
        <p>conteúdo da página</p>
      </PanelLayout>,
    );

    expect(screen.getByText("conteúdo da página")).toBeInTheDocument();
  });

  describe("marca da loja", () => {
    it("usa o nome padrão quando a loja não tem nome", () => {
      render(<PanelLayout title="Painel">{null}</PanelLayout>);

      expect(screen.getByText("Ecommerce Inertia Ruby")).toBeInTheDocument();
    });

    it("usa o nome configurado da loja", () => {
      usePageMock.mockReturnValue({
        ...defaultPage,
        props: {
          ...defaultPage.props,
          store: { name: "Loja Aurora", logo_url: null },
        },
      });

      render(<PanelLayout title="Painel">{null}</PanelLayout>);

      expect(screen.getByText("Loja Aurora")).toBeInTheDocument();
      expect(
        screen.queryByText("Ecommerce Inertia Ruby"),
      ).not.toBeInTheDocument();
    });

    it("mostra o logo da loja quando há um", () => {
      usePageMock.mockReturnValue({
        ...defaultPage,
        props: {
          ...defaultPage.props,
          store: { name: "Loja Aurora", logo_url: "/logo.png" },
        },
      });

      const { container } = render(
        <PanelLayout title="Painel">{null}</PanelLayout>,
      );

      expect(
        container.querySelector('img[src="/logo.png"]'),
      ).toBeInTheDocument();
    });
  });

  describe("navegação lateral", () => {
    it("mostra o Painel pra qualquer admin, sem permissão", () => {
      render(<PanelLayout title="Painel">{null}</PanelLayout>);

      const nav = screen.getByRole("navigation", {
        name: "Navegação principal",
      });
      expect(within(nav).getByRole("link", { name: "Painel" })).toHaveAttribute(
        "href",
        root_path(),
      );
    });

    it.each([
      ["manage_admins", "Admins"],
      ["manage_roles", "Papéis"],
      ["manage_store_settings", "Configurações da loja"],
    ])("o item de %s só aparece com a permissão", (permission, label) => {
      const { unmount } = render(
        <PanelLayout title="Painel">{null}</PanelLayout>,
      );
      expect(
        screen.queryByRole("link", { name: label }),
      ).not.toBeInTheDocument();
      unmount();

      usePageMock.mockReturnValue(withPermissions([permission]));
      render(<PanelLayout title="Painel">{null}</PanelLayout>);

      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    });

    it("esconde a seção Administração inteira quando nenhum item dela é permitido", () => {
      render(<PanelLayout title="Painel">{null}</PanelLayout>);

      const nav = screen.getByRole("navigation", {
        name: "Navegação principal",
      });
      expect(within(nav).queryByText("Administração")).not.toBeInTheDocument();
      expect(within(nav).getByText("Geral")).toBeInTheDocument();
    });

    it("marca como página atual o item que corresponde à URL", () => {
      usePageMock.mockReturnValue({
        ...withPermissions(["manage_admins", "manage_roles"]),
        url: "/admin/admins",
      });

      render(<PanelLayout title="Admins">{null}</PanelLayout>);

      expect(screen.getByRole("link", { name: "Admins" })).toHaveAttribute(
        "aria-current",
        "page",
      );
      expect(screen.getByRole("link", { name: "Papéis" })).not.toHaveAttribute(
        "aria-current",
      );
      expect(screen.getByRole("link", { name: "Painel" })).not.toHaveAttribute(
        "aria-current",
      );
    });

    it("mantém o item ativo em subpáginas (ex. editar)", () => {
      usePageMock.mockReturnValue({
        ...withPermissions(["manage_admins"]),
        url: `${admin_admins_path()}/3/edit`,
      });

      render(<PanelLayout title="Editar admin">{null}</PanelLayout>);

      expect(screen.getByRole("link", { name: "Admins" })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });
  });

  describe("breadcrumbs", () => {
    it("mostra seção e item quando a página está na navegação", () => {
      usePageMock.mockReturnValue({
        ...withPermissions(["manage_admins"]),
        url: "/admin/admins",
      });

      render(<PanelLayout title="Admins">{null}</PanelLayout>);

      const crumbs = screen.getByRole("navigation", { name: "Você está em" });
      expect(within(crumbs).getByText("Administração")).toBeInTheDocument();
      expect(within(crumbs).getByText("Admins")).toHaveAttribute(
        "aria-current",
        "page",
      );
    });

    it("cai no título da página quando ela não está na navegação (ex. perfil)", () => {
      usePageMock.mockReturnValue({ ...defaultPage, url: "/admin/profile" });

      render(<PanelLayout title="Perfil">{null}</PanelLayout>);

      const crumbs = screen.getByRole("navigation", { name: "Você está em" });
      expect(within(crumbs).getByText("Perfil")).toHaveAttribute(
        "aria-current",
        "page",
      );
    });
  });

  describe("sidebar recolhível", () => {
    it("começa expandida e recolhe ao clicar, guardando a preferência", async () => {
      const user = userEvent.setup();
      render(<PanelLayout title="Painel">{null}</PanelLayout>);

      await user.click(screen.getByRole("button", { name: "Recolher menu" }));

      expect(
        screen.getByRole("button", { name: "Expandir menu" }),
      ).toHaveAttribute("aria-expanded", "false");
      expect(localStorage.getItem("sidebar-collapsed")).toBe("true");
    });

    it("começa recolhida quando a preferência salva é essa", () => {
      localStorage.setItem("sidebar-collapsed", "true");

      render(<PanelLayout title="Painel">{null}</PanelLayout>);

      expect(
        screen.getByRole("button", { name: "Expandir menu" }),
      ).toBeInTheDocument();
    });

    it("recolhida, os itens continuam com nome acessível (rótulo só some da tela)", () => {
      localStorage.setItem("sidebar-collapsed", "true");

      render(<PanelLayout title="Painel">{null}</PanelLayout>);

      expect(screen.getByRole("link", { name: "Painel" })).toBeInTheDocument();
    });
  });

  describe("menu do usuário", () => {
    it("mostra e-mail e papel do admin ao abrir", async () => {
      const user = userEvent.setup();
      render(<PanelLayout title="Painel">{null}</PanelLayout>);

      await user.click(screen.getByRole("button", { name: "Menu da conta" }));

      expect(await screen.findByText("ana.souza@loja.com")).toBeInTheDocument();
      expect(screen.getByText("Gerente")).toBeInTheDocument();
    });

    it("leva ao perfil", async () => {
      const user = userEvent.setup();
      render(<PanelLayout title="Painel">{null}</PanelLayout>);

      await user.click(screen.getByRole("button", { name: "Menu da conta" }));

      expect(
        await screen.findByRole("menuitem", { name: "Perfil" }),
      ).toHaveAttribute("href", admin_profile_path());
    });

    it("encerra a sessão ao escolher Sair", async () => {
      const user = userEvent.setup();
      render(<PanelLayout title="Painel">{null}</PanelLayout>);

      await user.click(screen.getByRole("button", { name: "Menu da conta" }));
      await user.click(await screen.findByRole("menuitem", { name: "Sair" }));

      expect(routerDeleteMock).toHaveBeenCalledWith(admin_session_path());
    });
  });

  it("mostra o flash de notice quando presente", () => {
    usePageMock.mockReturnValue({
      ...defaultPage,
      flash: { notice: "Admin criado com sucesso" },
    });

    render(<PanelLayout title="Painel">{null}</PanelLayout>);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Admin criado com sucesso",
    );
  });

  it("mostra o flash de alert quando presente", () => {
    usePageMock.mockReturnValue({
      ...defaultPage,
      flash: { alert: "E-mail já cadastrado" },
    });

    render(<PanelLayout title="Painel">{null}</PanelLayout>);

    expect(screen.getByRole("alert")).toHaveTextContent("E-mail já cadastrado");
  });

  describe("aviso obrigatório de 2FA", () => {
    const withoutTwoFactor = (component: string): MockPage => ({
      ...defaultPage,
      props: { ...defaultPage.props, current_admin_two_factor_enabled: false },
      component,
    });

    it("aparece quando o admin não tem 2FA ativo", () => {
      usePageMock.mockReturnValue(withoutTwoFactor("Admin/Dashboard/Show"));

      render(<PanelLayout title="Painel">{null}</PanelLayout>);

      expect(
        screen.getByText("Autenticação de dois fatores obrigatória"),
      ).toBeInTheDocument();
    });

    it("não aparece quando o admin já tem 2FA ativo", () => {
      render(<PanelLayout title="Painel">{null}</PanelLayout>);

      expect(
        screen.queryByText("Autenticação de dois fatores obrigatória"),
      ).not.toBeInTheDocument();
    });

    it("não aparece nas próprias páginas de configurar o 2FA, mesmo sem 2FA ativo", () => {
      usePageMock.mockReturnValue(withoutTwoFactor("Admin/TwoFactor/New"));

      render(<PanelLayout title="Painel">{null}</PanelLayout>);

      expect(
        screen.queryByText("Autenticação de dois fatores obrigatória"),
      ).not.toBeInTheDocument();
    });
  });
});
