import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PanelLayout from "@/components/admin/PanelLayout";
import { admin_session_path } from "@/routes";

const { routerDeleteMock, usePageMock } = vi.hoisted(() => ({
  routerDeleteMock: vi.fn(),
  usePageMock: vi.fn<
    () => {
      props: {
        current_admin_permissions: string[];
        current_admin_two_factor_enabled: boolean;
      };
      flash?: { notice?: string; alert?: string };
      component: string;
    }
  >(),
}));

vi.mock("@inertiajs/react", () => ({
  Head: () => null,
  router: { delete: routerDeleteMock },
  usePage: () => usePageMock(),
}));

// Com 2FA ativo (igual à maioria dos testes, que não são sobre o aviso
// obrigatório) e numa página qualquer fora do fluxo de setup — sem isso, o
// Dialog apareceria e esconderia o resto da página via aria-hidden
// (hideOthers do Radix), quebrando getByRole nos testes que não são sobre
// o próprio Dialog.
const defaultPageProps = {
  props: {
    current_admin_permissions: [] as string[],
    current_admin_two_factor_enabled: true,
  },
  component: "Admin/Dashboard/Show",
};

describe("PanelLayout", () => {
  beforeEach(() => {
    routerDeleteMock.mockClear();
    usePageMock.mockReturnValue(defaultPageProps);
  });

  it("renderiza a marca e o conteúdo", () => {
    render(
      <PanelLayout title="Painel">
        <p>conteúdo da página</p>
      </PanelLayout>,
    );

    expect(screen.getByText("Ecommerce Inertia Ruby")).toBeInTheDocument();
    expect(screen.getByText("conteúdo da página")).toBeInTheDocument();
  });

  it("encerra a sessão ao clicar em Sair", async () => {
    const user = userEvent.setup();
    render(<PanelLayout title="Painel">{null}</PanelLayout>);

    await user.click(screen.getByRole("button", { name: "Sair" }));

    expect(routerDeleteMock).toHaveBeenCalledWith(admin_session_path());
  });

  it("não mostra o link Gerenciar admins sem a permissão manage_admins", () => {
    render(<PanelLayout title="Painel">{null}</PanelLayout>);

    expect(
      screen.queryByRole("link", { name: "Gerenciar admins" }),
    ).not.toBeInTheDocument();
  });

  it("mostra o link Gerenciar admins com a permissão manage_admins", () => {
    usePageMock.mockReturnValue({
      ...defaultPageProps,
      props: {
        ...defaultPageProps.props,
        current_admin_permissions: ["manage_admins"],
      },
    });

    render(<PanelLayout title="Painel">{null}</PanelLayout>);

    expect(
      screen.getByRole("link", { name: "Gerenciar admins" }),
    ).toBeInTheDocument();
  });

  it("mostra o link Perfil sempre, independente de permissão", () => {
    render(<PanelLayout title="Painel">{null}</PanelLayout>);

    expect(screen.getByRole("link", { name: "Perfil" })).toBeInTheDocument();
  });

  it("mostra o flash de notice quando presente", () => {
    usePageMock.mockReturnValue({
      ...defaultPageProps,
      flash: { notice: "Admin criado com sucesso" },
    });

    render(<PanelLayout title="Painel">{null}</PanelLayout>);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Admin criado com sucesso",
    );
  });

  it("mostra o flash de alert quando presente", () => {
    usePageMock.mockReturnValue({
      ...defaultPageProps,
      flash: { alert: "E-mail já cadastrado" },
    });

    render(<PanelLayout title="Painel">{null}</PanelLayout>);

    expect(screen.getByRole("alert")).toHaveTextContent("E-mail já cadastrado");
  });

  describe("aviso obrigatório de 2FA", () => {
    it("aparece quando o admin não tem 2FA ativo", () => {
      usePageMock.mockReturnValue({
        ...defaultPageProps,
        props: {
          ...defaultPageProps.props,
          current_admin_two_factor_enabled: false,
        },
      });

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
      usePageMock.mockReturnValue({
        ...defaultPageProps,
        props: {
          ...defaultPageProps.props,
          current_admin_two_factor_enabled: false,
        },
        component: "Admin/TwoFactor/New",
      });

      render(<PanelLayout title="Painel">{null}</PanelLayout>);

      expect(
        screen.queryByText("Autenticação de dois fatores obrigatória"),
      ).not.toBeInTheDocument();
    });
  });
});
