import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import TwoFactorNew from "@/pages/Admin/TwoFactor/New";
import { admin_two_factor_path } from "@/routes";

const { routerPostMock } = vi.hoisted(() => ({ routerPostMock: vi.fn() }));

vi.mock("@inertiajs/react", () => ({
  Head: () => null,
  router: { post: routerPostMock, delete: vi.fn() },
  usePage: () => ({
    props: {
      current_admin_permissions: [],
      current_admin_two_factor_enabled: true,
    },
    component: "test",
    flash: {},
  }),
}));

describe("Admin/TwoFactor/New", () => {
  beforeEach(() => {
    routerPostMock.mockClear();
  });

  const props = {
    provisioning_uri: "otpauth://totp/Example:admin@example.com?secret=ABC",
    qr_code_svg: '<svg role="img" aria-label="QR code"></svg>',
  };

  it("renderiza o QR code e a URI de provisionamento", () => {
    render(<TwoFactorNew {...props} />);

    expect(screen.getByRole("img", { name: "QR code" })).toBeInTheDocument();
    expect(screen.getByText(props.provisioning_uri)).toBeInTheDocument();
  });

  it("envia o código de confirmação pra ativar o 2FA", async () => {
    const user = userEvent.setup();
    render(<TwoFactorNew {...props} />);

    await user.type(screen.getByLabelText("Código de confirmação"), "123456");
    await user.click(screen.getByRole("button", { name: "Ativar" }));

    await waitFor(() => {
      expect(routerPostMock).toHaveBeenCalledWith(admin_two_factor_path(), {
        otp_code: "123456",
      });
    });
  });

  it("não envia e mostra erro quando o código está vazio", async () => {
    const user = userEvent.setup();
    render(<TwoFactorNew {...props} />);

    await user.click(screen.getByRole("button", { name: "Ativar" }));

    expect(await screen.findByText("Informe o código")).toBeInTheDocument();
    expect(routerPostMock).not.toHaveBeenCalled();
  });
});
