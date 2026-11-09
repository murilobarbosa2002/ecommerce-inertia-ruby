import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import RolesNew from "@/pages/Admin/Roles/New";
import { admin_roles_path } from "@/routes";

const { routerPostMock } = vi.hoisted(() => ({ routerPostMock: vi.fn() }));

vi.mock("@inertiajs/react", () => ({
  Head: () => null,
  router: { post: routerPostMock },
  usePage: () => ({
    props: {
      current_admin_permissions: ["manage_roles"],
      current_admin_two_factor_enabled: true,
    },
    component: "test",
  }),
}));

const permissions = [
  {
    id: 1,
    key: "manage_admins",
    description: "Criar, listar e editar outros admins",
  },
  {
    id: 2,
    key: "manage_roles",
    description: "Criar papéis e configurar quais permissões cada um tem",
  },
];

describe("Admin/Roles/New", () => {
  beforeEach(() => {
    routerPostMock.mockClear();
  });

  it("cria um papel com as permissões marcadas", async () => {
    const user = userEvent.setup();
    render(<RolesNew permissions={permissions} />);

    await user.type(screen.getByLabelText("Nome"), "gerente");
    await user.click(
      screen.getByRole("checkbox", {
        name: "Criar, listar e editar outros admins",
      }),
    );
    await user.type(
      screen.getByLabelText("Motivo da criação"),
      "Papel novo pro time de gerência",
    );
    await user.click(screen.getByRole("button", { name: "Criar papel" }));

    await waitFor(() => {
      expect(routerPostMock).toHaveBeenCalledWith(admin_roles_path(), {
        name: "gerente",
        permission_ids: [1],
        change_reason: "Papel novo pro time de gerência",
      });
    });
  });

  it("permite desmarcar uma permissão já marcada", async () => {
    const user = userEvent.setup();
    render(<RolesNew permissions={permissions} />);

    await user.type(screen.getByLabelText("Nome"), "gerente");
    const manageAdmins = screen.getByRole("checkbox", {
      name: "Criar, listar e editar outros admins",
    });
    const manageRoles = screen.getByRole("checkbox", {
      name: "Criar papéis e configurar quais permissões cada um tem",
    });
    await user.click(manageAdmins);
    await user.click(manageRoles);
    await user.click(manageAdmins);
    await user.type(
      screen.getByLabelText("Motivo da criação"),
      "Só gerenciar papéis",
    );
    await user.click(screen.getByRole("button", { name: "Criar papel" }));

    await waitFor(() => {
      expect(routerPostMock).toHaveBeenCalledWith(admin_roles_path(), {
        name: "gerente",
        permission_ids: [2],
        change_reason: "Só gerenciar papéis",
      });
    });
  });

  it("não envia e mostra erro quando os campos obrigatórios estão vazios", async () => {
    const user = userEvent.setup();
    render(<RolesNew permissions={permissions} />);

    await user.click(screen.getByRole("button", { name: "Criar papel" }));

    expect(
      await screen.findByText("Informe o nome do papel"),
    ).toBeInTheDocument();
    expect(screen.getByText("Informe o motivo da criação")).toBeInTheDocument();
    expect(routerPostMock).not.toHaveBeenCalled();
  });
});
