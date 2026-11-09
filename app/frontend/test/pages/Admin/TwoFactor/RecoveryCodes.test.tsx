import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import TwoFactorRecoveryCodes from "@/pages/Admin/TwoFactor/RecoveryCodes";
import { root_path } from "@/routes";

const {
  routerVisitMock,
  downloadTextFileMock,
  downloadRecoveryCodesImageMock,
} = vi.hoisted(() => ({
  routerVisitMock: vi.fn(),
  downloadTextFileMock: vi.fn(),
  downloadRecoveryCodesImageMock: vi.fn(),
}));

vi.mock("@/lib/downloadTextFile", () => ({ default: downloadTextFileMock }));
vi.mock("@/lib/downloadRecoveryCodesImage", () => ({
  default: downloadRecoveryCodesImageMock,
}));

vi.mock("@inertiajs/react", () => ({
  Head: () => null,
  router: { visit: routerVisitMock, delete: vi.fn() },
  usePage: () => ({
    props: {
      current_admin_permissions: [],
      current_admin_two_factor_enabled: true,
    },
    component: "test",
    flash: {},
  }),
}));

describe("Admin/TwoFactor/RecoveryCodes", () => {
  const recoveryCodes = Array.from(
    { length: 10 },
    (_, i) => `code-${String(i)}`,
  );

  it("lista todos os códigos de recuperação", () => {
    render(<TwoFactorRecoveryCodes recovery_codes={recoveryCodes} />);

    recoveryCodes.forEach((code) => {
      expect(screen.getByText(code)).toBeInTheDocument();
    });
  });

  it("vai pro dashboard ao clicar em Continuar", async () => {
    const user = userEvent.setup();
    render(<TwoFactorRecoveryCodes recovery_codes={recoveryCodes} />);

    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(routerVisitMock).toHaveBeenCalledWith(root_path());
  });

  it("baixa os códigos como .txt ao clicar em Baixar .txt", async () => {
    const user = userEvent.setup();
    render(<TwoFactorRecoveryCodes recovery_codes={recoveryCodes} />);

    await user.click(screen.getByRole("button", { name: "Baixar .txt" }));

    expect(downloadTextFileMock).toHaveBeenCalledWith(
      "codigos-de-recuperacao.txt",
      recoveryCodes.join("\n"),
    );
  });

  it("baixa os códigos como imagem ao clicar em Salvar como imagem", async () => {
    const user = userEvent.setup();
    render(<TwoFactorRecoveryCodes recovery_codes={recoveryCodes} />);

    await user.click(
      screen.getByRole("button", { name: "Salvar como imagem" }),
    );

    expect(downloadRecoveryCodesImageMock).toHaveBeenCalledWith(
      recoveryCodes,
      "Guarde seus códigos de recuperação",
      "codigos-de-recuperacao.png",
    );
  });
});
