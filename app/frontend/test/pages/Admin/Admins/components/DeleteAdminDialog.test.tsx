import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const { routerDeleteMock } = vi.hoisted(() => ({
  routerDeleteMock: vi.fn(),
}));

vi.mock("@inertiajs/react", () => ({
  router: { delete: routerDeleteMock },
}));

import DeleteAdminDialog from "@/pages/Admin/Admins/components/DeleteAdminDialog";
import { admin_admin_path } from "@/routes";

function renderDialog(
  overrides: Partial<Parameters<typeof DeleteAdminDialog>[0]> = {},
) {
  const props = {
    adminId: 7,
    open: true,
    onOpenChange: vi.fn(),
    ...overrides,
  };

  return { ...render(<DeleteAdminDialog {...props} />), props };
}

describe("DeleteAdminDialog", () => {
  it("não renderiza nada quando não está open", () => {
    renderDialog({ open: false });

    expect(screen.queryByText("Excluir esse admin?")).not.toBeInTheDocument();
  });

  it("exige senha e motivo antes de enviar", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Excluir admin" }));

    expect(
      await screen.findByText("Informe a senha atual"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Informe o motivo da exclusão"),
    ).toBeInTheDocument();
    expect(routerDeleteMock).not.toHaveBeenCalled();
  });

  it("envia senha e motivo pro endpoint de exclusão quando preenchido", async () => {
    const user = userEvent.setup();
    renderDialog({ adminId: 42 });

    await user.type(screen.getByLabelText("Sua senha atual"), "Password123!");
    await user.type(
      screen.getByLabelText("Motivo da exclusão"),
      "Conta de teste não é mais necessária",
    );
    await user.click(screen.getByRole("button", { name: "Excluir admin" }));

    expect(routerDeleteMock).toHaveBeenCalledWith(admin_admin_path(42), {
      data: {
        password: "Password123!",
        change_reason: "Conta de teste não é mais necessária",
      },
    });
  });

  it("cancelar chama onOpenChange(false) sem enviar nada", async () => {
    const user = userEvent.setup();
    const { props } = renderDialog();

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(props.onOpenChange).toHaveBeenCalledWith(false);
    expect(routerDeleteMock).not.toHaveBeenCalled();
  });
});
