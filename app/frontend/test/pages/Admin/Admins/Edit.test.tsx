import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminsEdit from "@/pages/Admin/Admins/Edit";
import { admin_admin_path } from "@/routes";

const { routerPatchMock } = vi.hoisted(() => ({ routerPatchMock: vi.fn() }));

vi.mock("@inertiajs/react", () => ({
  Head: () => null,
  router: { patch: routerPatchMock },
  usePage: () => ({
    props: {
      current_admin_permissions: ["manage_admins"],
      current_admin_two_factor_enabled: true,
    },
    component: "test",
  }),
}));

const roles = [
  { id: 1, name: "owner" },
  { id: 2, name: "suporte" },
];
const admin = { id: 7, email_address: "editar@example.com", role_id: 1 };

describe("Admin/Admins/Edit", () => {
  beforeEach(() => {
    routerPatchMock.mockClear();
  });

  it("vem preenchido com o e-mail e papel atuais do admin", () => {
    render(<AdminsEdit admin={admin} roles={roles} />);

    expect(screen.getByLabelText("E-mail")).toHaveValue("editar@example.com");
    expect(screen.getByRole("combobox")).toHaveTextContent("owner");
  });

  it("atualiza o e-mail e o motivo, enviando pro admin correto", async () => {
    const user = userEvent.setup();
    render(<AdminsEdit admin={admin} roles={roles} />);

    const emailInput = screen.getByLabelText("E-mail");
    await user.clear(emailInput);
    await user.type(emailInput, "novo-email@example.com");
    await user.type(
      screen.getByLabelText("Motivo da alteração"),
      "Correção de digitação",
    );
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() => {
      expect(routerPatchMock).toHaveBeenCalledWith(admin_admin_path(admin.id), {
        email_address: "novo-email@example.com",
        role_id: "1",
        change_reason: "Correção de digitação",
      });
    });
  });

  it("permite trocar o papel selecionado", async () => {
    const user = userEvent.setup();
    render(<AdminsEdit admin={admin} roles={roles} />);

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "suporte" }));
    await user.type(
      screen.getByLabelText("Motivo da alteração"),
      "Mudança de papel",
    );
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() => {
      expect(routerPatchMock).toHaveBeenCalledWith(admin_admin_path(admin.id), {
        email_address: "editar@example.com",
        role_id: "2",
        change_reason: "Mudança de papel",
      });
    });
  });

  it("não envia e mostra erro quando o motivo está vazio", async () => {
    const user = userEvent.setup();
    render(<AdminsEdit admin={admin} roles={roles} />);

    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(
      await screen.findByText("Informe o motivo da alteração"),
    ).toBeInTheDocument();
    expect(routerPatchMock).not.toHaveBeenCalled();
  });
});
