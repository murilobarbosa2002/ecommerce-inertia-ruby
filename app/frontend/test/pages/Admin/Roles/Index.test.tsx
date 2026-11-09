import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import RolesIndex from "@/pages/Admin/Roles/Index";
import { edit_admin_role_path, new_admin_role_path } from "@/routes";

vi.mock("@inertiajs/react", () => ({
  Head: () => null,
  usePage: () => ({
    props: {
      current_admin_permissions: ["manage_roles"],
      current_admin_two_factor_enabled: true,
    },
    component: "test",
  }),
}));

describe("Admin/Roles/Index", () => {
  const roles = [
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
  ];

  it("lista os papéis com nome e permissões", () => {
    render(<RolesIndex roles={roles} />);

    expect(screen.getByText("owner")).toBeInTheDocument();
    expect(screen.getByText("manage_admins, manage_roles")).toBeInTheDocument();
    expect(screen.getByText("suporte")).toBeInTheDocument();
    expect(screen.getByText("manage_admins")).toBeInTheDocument();
  });

  it("linka pra edição de cada papel", () => {
    render(<RolesIndex roles={roles} />);

    const editLinks = screen.getAllByRole("link", { name: "Editar" });
    expect(editLinks[0]).toHaveAttribute("href", edit_admin_role_path(1));
    expect(editLinks[1]).toHaveAttribute("href", edit_admin_role_path(2));
  });

  it("linka pra criar um papel novo", () => {
    render(<RolesIndex roles={roles} />);

    expect(screen.getByRole("link", { name: "Novo papel" })).toHaveAttribute(
      "href",
      new_admin_role_path(),
    );
  });
});
