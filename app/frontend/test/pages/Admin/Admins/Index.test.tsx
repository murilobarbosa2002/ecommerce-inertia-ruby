import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import AdminsIndex from "@/pages/Admin/Admins/Index";
import { edit_admin_admin_path, new_admin_admin_path } from "@/routes";

const { routerReloadMock, routerPostMock, usePageMock } = vi.hoisted(() => ({
  routerReloadMock: vi.fn(),
  routerPostMock: vi.fn(),
  usePageMock: vi.fn(() => ({
    props: {
      current_admin_permissions: ["manage_admins", "reset_two_factor"],
      current_admin_two_factor_enabled: true,
      current_admin_id: 999,
    },
    component: "test",
  })),
}));

vi.mock("@inertiajs/react", () => ({
  Head: () => null,
  Link: "a",
  router: { delete: vi.fn(), post: routerPostMock, reload: routerReloadMock },
  usePage: usePageMock,
}));

function desktopTable() {
  return screen.getByRole("table");
}

describe("Admin/Admins/Index", () => {
  const admins = {
    records: [
      {
        id: 1,
        email_address: "dono@example.com",
        first_name: "Ana",
        last_name: "Dona",
        phone: "11988887777",
        role_id: 1,
        role_name: "owner",
      },
      {
        id: 2,
        email_address: "suporte@example.com",
        first_name: "Bruno",
        last_name: "Suporte",
        phone: null,
        role_id: 2,
        role_name: "suporte",
      },
    ],
    page: 1,
    total_pages: 1,
    total_count: 2,
  };

  it("lista os admins com nome, e-mail, papel e celular", () => {
    render(<AdminsIndex admins={admins} />);

    const table = within(desktopTable());
    expect(table.getByText("Ana Dona")).toBeInTheDocument();
    expect(table.getByText("dono@example.com")).toBeInTheDocument();
    expect(table.getByText("owner")).toBeInTheDocument();
    expect(table.getByText("(11) 98888-7777")).toBeInTheDocument();
    expect(table.getByText("Bruno Suporte")).toBeInTheDocument();
    expect(table.getByText("suporte@example.com")).toBeInTheDocument();
    expect(table.getByText("suporte")).toBeInTheDocument();
    expect(table.getByText("—")).toBeInTheDocument();
  });

  it("mostra quantos admins existem no total na descrição", () => {
    render(<AdminsIndex admins={admins} />);

    expect(screen.getByText("2 admins no total")).toBeInTheDocument();
  });

  it("linka pra edição de um admin pelo menu de ações da linha", async () => {
    const user = userEvent.setup();
    render(<AdminsIndex admins={admins} />);

    const actionButtons = within(desktopTable()).getAllByRole("button", {
      name: "Ações",
    });
    await user.click(actionButtons[0]);

    expect(
      await screen.findByRole("menuitem", { name: "Editar" }),
    ).toHaveAttribute("href", edit_admin_admin_path(1));
  });

  it("linka pra criar um admin novo", () => {
    render(<AdminsIndex admins={admins} />);

    expect(screen.getByRole("link", { name: "Novo admin" })).toHaveAttribute(
      "href",
      new_admin_admin_path(),
    );
  });

  it("busca dispara um reload com a prop admins e o termo digitado", async () => {
    const user = userEvent.setup();
    render(<AdminsIndex admins={admins} />);

    await user.type(
      screen.getByPlaceholderText("Buscar por nome, e-mail ou papel..."),
      "ana",
    );

    expect(routerReloadMock).toHaveBeenCalledWith(
      expect.objectContaining({
        only: ["admins"],
        data: expect.objectContaining({ admins_search: "ana" }) as Record<
          string,
          unknown
        >,
      }),
    );
  });
});
