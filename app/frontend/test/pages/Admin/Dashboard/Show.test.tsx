import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import DashboardShow from "@/pages/Admin/Dashboard/Show";

const { routerPatchMock } = vi.hoisted(() => ({ routerPatchMock: vi.fn() }));

vi.mock("@inertiajs/react", () => ({
  Head: () => null,
  Link: "a",
  router: { patch: routerPatchMock, delete: vi.fn(), reload: vi.fn() },
  usePage: () => ({
    props: {
      current_admin_permissions: ["manage_admins", "manage_roles"],
      current_admin_two_factor_enabled: true,
    },
    component: "Admin/Dashboard/Show",
  }),
}));

const baseProps = {
  stats: { total_admins: 3, admins_without_two_factor: 1 },
  activity: null,
  quick_action_keys: [],
};

describe("Admin/Dashboard/Show", () => {
  it("renderiza o título do painel", () => {
    render(<DashboardShow {...baseProps} />);

    expect(screen.getByRole("heading", { name: "Painel" })).toBeInTheDocument();
  });

  it("mostra os cartões de métrica com os valores recebidos", () => {
    render(<DashboardShow {...baseProps} />);

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Total de admins")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Sem 2FA ativo")).toBeInTheDocument();
  });

  it("não mostra o card de atividade quando activity é null (sem permissão view_audit_log)", () => {
    render(<DashboardShow {...baseProps} activity={null} />);

    expect(screen.queryByText("Atividade recente")).not.toBeInTheDocument();
  });

  it("mostra o card de atividade quando activity vem preenchido", () => {
    render(
      <DashboardShow
        {...baseProps}
        activity={{
          events: [
            {
              id: 1,
              event_type: "login_succeeded",
              happened_at: "2026-11-22T10:00:00Z",
              admin_email: "admin@example.com",
              performed_by_admin_email: "admin@example.com",
              metadata: {},
            },
          ],
          page: 1,
          per_page: 10,
          total_count: 1,
          total_pages: 1,
        }}
      />,
    );

    expect(screen.getByText("Atividade recente")).toBeInTheDocument();
    expect(screen.getByText("admin@example.com fez login")).toBeInTheDocument();
  });

  it("mostra os atalhos permitidos pelo admin logado quando nenhum foi escolhido ainda", () => {
    render(<DashboardShow {...baseProps} quick_action_keys={[]} />);

    expect(
      screen.getByRole("link", { name: "Novo admin" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Novo papel" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Configurações da loja" }),
    ).not.toBeInTheDocument();
  });

  it("mostra só os atalhos escolhidos, dentro dos permitidos", () => {
    render(<DashboardShow {...baseProps} quick_action_keys={["new_admin"]} />);

    expect(
      screen.getByRole("link", { name: "Novo admin" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Novo papel" }),
    ).not.toBeInTheDocument();
  });

  it("salva os atalhos escolhidos no diálogo de configurar", async () => {
    const user = userEvent.setup();
    render(<DashboardShow {...baseProps} quick_action_keys={["new_admin"]} />);

    await user.click(
      screen.getByRole("button", { name: "Configurar atalhos" }),
    );
    await user.click(screen.getByRole("checkbox", { name: "Novo papel" }));
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(routerPatchMock).toHaveBeenCalledWith(
      "/admin/quick_actions",
      { quick_action_keys: ["new_admin", "new_role"] },
      expect.objectContaining({
        onFinish: expect.any(Function) as () => void,
      }),
    );
  });
});
