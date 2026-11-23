import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import QuickActions from "@/components/admin/quick-actions/QuickActions";

const { routerPatchMock } = vi.hoisted(() => ({ routerPatchMock: vi.fn() }));

vi.mock("@inertiajs/react", () => ({ router: { patch: routerPatchMock } }));

describe("QuickActions", () => {
  it("mostra o estado vazio quando o admin não tem permissão pra nenhuma ação", () => {
    render(<QuickActions permissions={[]} quickActionKeys={[]} />);

    expect(screen.getByText("Nenhum atalho disponível")).toBeInTheDocument();
  });

  it("não mostra o botão de configurar quando não há nenhuma ação permitida", () => {
    render(<QuickActions permissions={[]} quickActionKeys={[]} />);

    expect(
      screen.queryByRole("button", { name: "Configurar atalhos" }),
    ).not.toBeInTheDocument();
  });

  it("mostra todas as ações permitidas quando o admin nunca configurou nada ([])", () => {
    render(
      <QuickActions
        permissions={["manage_admins", "manage_roles"]}
        quickActionKeys={[]}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Novo admin" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Novo papel" }),
    ).toBeInTheDocument();
  });

  it("mostra só as ações escolhidas, mesmo tendo permissão pra mais", () => {
    render(
      <QuickActions
        permissions={["manage_admins", "manage_roles"]}
        quickActionKeys={["new_admin"]}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Novo admin" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Novo papel" }),
    ).not.toBeInTheDocument();
  });

  it("nunca mostra uma ação escolhida se o admin perdeu a permissão dela depois", () => {
    render(
      <QuickActions
        permissions={["manage_admins"]}
        quickActionKeys={["new_admin", "new_role"]}
      />,
    );

    expect(
      screen.queryByRole("link", { name: "Novo papel" }),
    ).not.toBeInTheDocument();
  });

  it("salva as chaves escolhidas via PATCH /admin/quick_actions", async () => {
    const user = userEvent.setup();
    render(
      <QuickActions
        permissions={["manage_admins", "manage_roles"]}
        quickActionKeys={["new_admin"]}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Configurar atalhos" }),
    );

    expect(
      screen.queryByRole("checkbox", { name: "Configurações da loja" }),
    ).not.toBeInTheDocument();

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

  it("cancelar fecha o diálogo sem salvar nada", async () => {
    const user = userEvent.setup();
    render(
      <QuickActions
        permissions={["manage_admins", "manage_roles"]}
        quickActionKeys={["new_admin"]}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Configurar atalhos" }),
    );
    await user.click(screen.getByRole("checkbox", { name: "Novo papel" }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(routerPatchMock).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
