import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ProfileShow from "@/pages/Admin/Profile/Show";
import {
  admin_profile_path,
  admin_two_factor_path,
  new_admin_two_factor_path,
} from "@/routes";

const { routerPatchMock, routerDeleteMock } = vi.hoisted(() => ({
  routerPatchMock: vi.fn(),
  routerDeleteMock: vi.fn(),
}));

vi.mock("@inertiajs/react", () => ({
  Head: () => null,
  router: { patch: routerPatchMock, delete: routerDeleteMock },
  usePage: () => ({
    props: {
      current_admin_permissions: [],
      current_admin_two_factor_enabled: true,
    },
    component: "test",
    flash: {},
  }),
}));

describe("Admin/Profile/Show", () => {
  beforeEach(() => {
    routerPatchMock.mockClear();
    routerDeleteMock.mockClear();
  });

  it("troca a senha com os dados digitados", async () => {
    const user = userEvent.setup();
    render(<ProfileShow two_factor_enabled />);

    await user.type(screen.getByLabelText("Senha atual"), "senha-atual-123");
    await user.type(screen.getByLabelText("Nova senha"), "senha-nova-456");
    await user.type(
      screen.getByLabelText("Confirme a nova senha"),
      "senha-nova-456",
    );
    await user.click(screen.getByRole("button", { name: "Trocar senha" }));

    await waitFor(() => {
      expect(routerPatchMock).toHaveBeenCalledWith(admin_profile_path(), {
        current_password: "senha-atual-123",
        password: "senha-nova-456",
        password_confirmation: "senha-nova-456",
      });
    });
  });

  it("mostra erro quando a confirmação de senha não bate", async () => {
    const user = userEvent.setup();
    render(<ProfileShow two_factor_enabled />);

    await user.type(screen.getByLabelText("Senha atual"), "senha-atual-123");
    await user.type(screen.getByLabelText("Nova senha"), "senha-nova-456");
    await user.type(
      screen.getByLabelText("Confirme a nova senha"),
      "outra-coisa",
    );
    await user.click(screen.getByRole("button", { name: "Trocar senha" }));

    expect(
      await screen.findByText("As senhas não coincidem"),
    ).toBeInTheDocument();
    expect(routerPatchMock).not.toHaveBeenCalled();
  });

  it("mostra o status ativo do 2FA e permite desativar com a senha atual", async () => {
    const user = userEvent.setup();
    render(<ProfileShow two_factor_enabled />);

    expect(screen.getByText("Ativa")).toBeInTheDocument();

    await user.type(
      screen.getByLabelText("Senha atual pra desativar"),
      "senha-atual-123",
    );
    await user.click(screen.getByRole("button", { name: "Desativar" }));

    await waitFor(() => {
      expect(routerDeleteMock).toHaveBeenCalledWith(admin_two_factor_path(), {
        data: { password: "senha-atual-123" },
      });
    });
  });

  it("mostra o status inativo do 2FA com link pra ativar", () => {
    render(<ProfileShow two_factor_enabled={false} />);

    expect(screen.getByText("Inativa")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ativar" })).toHaveAttribute(
      "href",
      new_admin_two_factor_path(),
    );
  });
});
