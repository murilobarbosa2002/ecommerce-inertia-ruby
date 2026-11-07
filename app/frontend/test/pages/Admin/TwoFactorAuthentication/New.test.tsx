import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import TwoFactorAuthenticationNew from "@/pages/Admin/TwoFactorAuthentication/New";

const { routerPostMock } = vi.hoisted(() => ({ routerPostMock: vi.fn() }));

vi.mock("@inertiajs/react", () => ({
  Head: () => null,
  router: { post: routerPostMock },
  usePage: () => ({ flash: {} }),
}));

describe("Admin/TwoFactorAuthentication/New", () => {
  beforeEach(() => {
    routerPostMock.mockClear();
  });

  it("envia o código TOTP de 6 dígitos pra /admin/two-factor", async () => {
    const user = userEvent.setup();
    render(<TwoFactorAuthenticationNew />);

    await user.type(screen.getByLabelText("Código"), "123456");
    await user.click(screen.getByRole("button", { name: "Verificar" }));

    await waitFor(() => {
      expect(routerPostMock).toHaveBeenCalledWith("/admin/two-factor", {
        otp_code: "123456",
      });
    });
  });

  it("envia um código de recuperação de 10 caracteres sem rejeitar o tamanho", async () => {
    const user = userEvent.setup();
    render(<TwoFactorAuthenticationNew />);

    await user.type(screen.getByLabelText("Código"), "ab12cd34ef");
    await user.click(screen.getByRole("button", { name: "Verificar" }));

    await waitFor(() => {
      expect(routerPostMock).toHaveBeenCalledWith("/admin/two-factor", {
        otp_code: "ab12cd34ef",
      });
    });
  });

  it("não envia e mostra erro quando o código está vazio", async () => {
    const user = userEvent.setup();
    render(<TwoFactorAuthenticationNew />);

    await user.click(screen.getByRole("button", { name: "Verificar" }));

    expect(await screen.findByText("Informe o código")).toBeInTheDocument();
    expect(routerPostMock).not.toHaveBeenCalled();
  });
});
