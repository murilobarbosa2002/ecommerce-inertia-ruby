import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PasswordEdit from "@/pages/Admin/Password/Edit";
import { admin_password_path } from "@/routes";

const { routerPatchMock } = vi.hoisted(() => ({ routerPatchMock: vi.fn() }));

vi.mock("@inertiajs/react", () => ({
  Head: () => null,
  router: { patch: routerPatchMock },
  usePage: () => ({ flash: {} }),
}));

describe("Admin/Password/Edit", () => {
  beforeEach(() => {
    routerPatchMock.mockClear();
  });

  it("envia a nova senha pra /admin/passwords/:token", async () => {
    const user = userEvent.setup();
    render(<PasswordEdit token="um-token-assinado" />);

    await user.type(screen.getByLabelText("Nova senha"), "nova-senha-123");
    await user.type(
      screen.getByLabelText("Confirme a nova senha"),
      "nova-senha-123",
    );
    await user.click(screen.getByRole("button", { name: "Redefinir senha" }));

    await waitFor(() => {
      expect(routerPatchMock).toHaveBeenCalledWith(
        admin_password_path("um-token-assinado"),
        { password: "nova-senha-123", password_confirmation: "nova-senha-123" },
      );
    });
  });

  it("não envia e mostra erro quando as senhas não coincidem", async () => {
    const user = userEvent.setup();
    render(<PasswordEdit token="um-token-assinado" />);

    await user.type(screen.getByLabelText("Nova senha"), "nova-senha-123");
    await user.type(
      screen.getByLabelText("Confirme a nova senha"),
      "senha-diferente",
    );
    await user.click(screen.getByRole("button", { name: "Redefinir senha" }));

    expect(
      await screen.findByText("As senhas não coincidem"),
    ).toBeInTheDocument();
    expect(routerPatchMock).not.toHaveBeenCalled();
  });

  it("não envia e mostra erro quando os campos estão vazios", async () => {
    const user = userEvent.setup();
    render(<PasswordEdit token="um-token-assinado" />);

    await user.click(screen.getByRole("button", { name: "Redefinir senha" }));

    expect(await screen.findByText("Informe a nova senha")).toBeInTheDocument();
    expect(
      screen.getByText("A confirmação de senha é obrigatória"),
    ).toBeInTheDocument();
    expect(routerPatchMock).not.toHaveBeenCalled();
  });
});
