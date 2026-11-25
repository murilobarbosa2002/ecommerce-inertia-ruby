import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import RolesIndex from "@/pages/Admin/Roles/Index";
import { edit_admin_role_path, new_admin_role_path } from "@/routes";

const { routerReloadMock } = vi.hoisted(() => ({
  routerReloadMock: vi.fn(),
}));

vi.mock("@inertiajs/react", () => ({
  Head: () => null,
  Link: "a",
  router: { reload: routerReloadMock },
  usePage: () => ({
    props: {
      current_admin_permissions: ["manage_roles"],
      current_admin_two_factor_enabled: true,
    },
    component: "test",
  }),
}));

function desktopTable() {
  return screen.getByRole("table");
}

describe("Admin/Roles/Index", () => {
  const roles = {
    records: [
      {
        id: 1,
        name: "owner",
        permission_ids: [1, 2],
        permission_keys: ["manage_admins", "manage_roles"],
      },
      {
        id: 2,
        name: "suporte",
        permission_ids: [1],
        permission_keys: ["manage_admins"],
      },
    ],
    page: 1,
    total_pages: 1,
    total_count: 2,
  };

  it("lista os papéis com nome e chips de permissão", () => {
    render(<RolesIndex roles={roles} />);

    const table = within(desktopTable());
    const ownerRowElement = table.getByText("owner").closest("tr");
    expect(ownerRowElement).not.toBeNull();
    const ownerRow = within(ownerRowElement as HTMLElement);
    expect(ownerRow.getByText("manage_admins")).toBeInTheDocument();
    expect(ownerRow.getByText("manage_roles")).toBeInTheDocument();
    expect(table.getByText("suporte")).toBeInTheDocument();
  });

  it("mostra quantos papéis existem no total na descrição", () => {
    render(<RolesIndex roles={roles} />);

    expect(screen.getByText("2 papéis no total")).toBeInTheDocument();
  });

  it("linka pra edição de um papel pelo menu de ações da linha", async () => {
    const user = userEvent.setup();
    render(<RolesIndex roles={roles} />);

    const actionButtons = within(desktopTable()).getAllByRole("button", {
      name: "Ações",
    });
    await user.click(actionButtons[0]);

    expect(
      await screen.findByRole("menuitem", { name: "Editar" }),
    ).toHaveAttribute("href", edit_admin_role_path(1));
  });

  it("linka pra criar um papel novo", () => {
    render(<RolesIndex roles={roles} />);

    expect(screen.getByRole("link", { name: "Novo papel" })).toHaveAttribute(
      "href",
      new_admin_role_path(),
    );
  });
});
