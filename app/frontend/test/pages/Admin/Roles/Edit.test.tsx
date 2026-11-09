import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import RolesEdit from "@/pages/Admin/Roles/Edit";
import { admin_role_path } from "@/routes";

const { routerPatchMock } = vi.hoisted(() => ({ routerPatchMock: vi.fn() }));

vi.mock("@inertiajs/react", () => ({
  Head: () => null,
  router: { patch: routerPatchMock },
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
const role = { id: 5, name: "suporte", permission_ids: [1] };

describe("Admin/Roles/Edit", () => {
  beforeEach(() => {
    routerPatchMock.mockClear();
  });

  it("vem preenchido com o nome e as permissões atuais do papel", () => {
    render(<RolesEdit role={role} permissions={permissions} />);

    expect(screen.getByLabelText("Nome")).toHaveValue("suporte");
    expect(
      screen.getByRole("checkbox", {
        name: "Criar, listar e editar outros admins",
      }),
    ).toBeChecked();
    expect(
      screen.getByRole("checkbox", {
        name: "Criar papéis e configurar quais permissões cada um tem",
      }),
    ).not.toBeChecked();
  });

  it("atualiza as permissões marcadas, enviando pro papel correto", async () => {
    const user = userEvent.setup();
    render(<RolesEdit role={role} permissions={permissions} />);

    await user.click(
      screen.getByRole("checkbox", {
        name: "Criar papéis e configurar quais permissões cada um tem",
      }),
    );
    await user.type(
      screen.getByLabelText("Motivo da alteração"),
      "Concedendo acesso a papéis",
    );
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() => {
      expect(routerPatchMock).toHaveBeenCalledWith(admin_role_path(role.id), {
        name: "suporte",
        permission_ids: [1, 2],
        change_reason: "Concedendo acesso a papéis",
      });
    });
  });

  it("não envia e mostra erro quando o motivo está vazio", async () => {
    const user = userEvent.setup();
    render(<RolesEdit role={role} permissions={permissions} />);

    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(
      await screen.findByText("Informe o motivo da alteração"),
    ).toBeInTheDocument();
    expect(routerPatchMock).not.toHaveBeenCalled();
  });
});
