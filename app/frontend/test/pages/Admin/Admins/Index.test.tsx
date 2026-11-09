import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AdminsIndex from "@/pages/Admin/Admins/Index";
import { edit_admin_admin_path, new_admin_admin_path } from "@/routes";

vi.mock("@inertiajs/react", () => ({
  Head: () => null,
  router: { delete: vi.fn() },
  usePage: () => ({
    props: {
      current_admin_permissions: ["manage_admins"],
      current_admin_two_factor_enabled: true,
    },
    component: "test",
  }),
}));

describe("Admin/Admins/Index", () => {
  const admins = [
    {
      id: 1,
      email_address: "dono@example.com",
      role_id: 1,
      role_name: "owner",
    },
    {
      id: 2,
      email_address: "suporte@example.com",
      role_id: 2,
      role_name: "suporte",
    },
  ];

  it("lista os admins com e-mail e papel", () => {
    render(<AdminsIndex admins={admins} />);

    expect(screen.getByText("dono@example.com")).toBeInTheDocument();
    expect(screen.getByText("owner")).toBeInTheDocument();
    expect(screen.getByText("suporte@example.com")).toBeInTheDocument();
    expect(screen.getByText("suporte")).toBeInTheDocument();
  });

  it("linka pra edição de cada admin", () => {
    render(<AdminsIndex admins={admins} />);

    const editLinks = screen.getAllByRole("link", { name: "Editar" });
    expect(editLinks[0]).toHaveAttribute("href", edit_admin_admin_path(1));
    expect(editLinks[1]).toHaveAttribute("href", edit_admin_admin_path(2));
  });

  it("linka pra criar um admin novo", () => {
    render(<AdminsIndex admins={admins} />);

    expect(screen.getByRole("link", { name: "Novo admin" })).toHaveAttribute(
      "href",
      new_admin_admin_path(),
    );
  });
});
