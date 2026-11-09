import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PanelLayout from "@/components/admin/PanelLayout";
import { admin_session_path } from "@/routes";

const { routerDeleteMock, usePageMock } = vi.hoisted(() => ({
  routerDeleteMock: vi.fn(),
  usePageMock: vi.fn<
    () => {
      props: { current_admin_permissions: string[] };
      flash?: { notice?: string; alert?: string };
    }
  >(),
}));

vi.mock("@inertiajs/react", () => ({
  Head: () => null,
  router: { delete: routerDeleteMock },
  usePage: () => usePageMock(),
}));

describe("PanelLayout", () => {
  beforeEach(() => {
    routerDeleteMock.mockClear();
    usePageMock.mockReturnValue({ props: { current_admin_permissions: [] } });
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
    usePageMock.mockReturnValue({ props: { current_admin_permissions: [] } });

    render(<PanelLayout title="Painel">{null}</PanelLayout>);

    expect(
      screen.queryByRole("link", { name: "Gerenciar admins" }),
    ).not.toBeInTheDocument();
  });

  it("mostra o link Gerenciar admins com a permissão manage_admins", () => {
    usePageMock.mockReturnValue({
      props: { current_admin_permissions: ["manage_admins"] },
    });

    render(<PanelLayout title="Painel">{null}</PanelLayout>);

    expect(
      screen.getByRole("link", { name: "Gerenciar admins" }),
    ).toBeInTheDocument();
  });

  it("mostra o flash de notice quando presente", () => {
    usePageMock.mockReturnValue({
      props: { current_admin_permissions: [] },
      flash: { notice: "Admin criado com sucesso" },
    });

    render(<PanelLayout title="Painel">{null}</PanelLayout>);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Admin criado com sucesso",
    );
  });

  it("mostra o flash de alert quando presente", () => {
    usePageMock.mockReturnValue({
      props: { current_admin_permissions: [] },
      flash: { alert: "E-mail já cadastrado" },
    });

    render(<PanelLayout title="Painel">{null}</PanelLayout>);

    expect(screen.getByRole("alert")).toHaveTextContent("E-mail já cadastrado");
  });
});
