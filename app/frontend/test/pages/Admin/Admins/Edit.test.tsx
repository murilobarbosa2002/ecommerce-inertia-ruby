import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminsEdit from "@/pages/Admin/Admins/Edit";
import { admin_admin_path, reset_two_factor_admin_admin_path } from "@/routes";

const { routerPatchMock, routerPostMock, usePageMock } = vi.hoisted(() => ({
  routerPatchMock: vi.fn(),
  routerPostMock: vi.fn(),
  usePageMock: vi.fn<
    () => {
      props: {
        current_admin_permissions: string[];
        current_admin_two_factor_enabled: boolean;
        current_admin_id: number | null;
      };
      component: string;
    }
  >(),
}));

vi.mock("@inertiajs/react", () => ({
  Head: () => null,
  router: { patch: routerPatchMock, post: routerPostMock },
  usePage: () => usePageMock(),
}));

const roles = [
  { id: 1, name: "owner" },
  { id: 2, name: "suporte" },
];
const admin = { id: 7, email_address: "editar@example.com", role_id: 1 };

const defaultPageProps = {
  props: {
    current_admin_permissions: ["manage_admins"],
    current_admin_two_factor_enabled: true,
    current_admin_id: 999,
  },
  component: "test",
};

describe("Admin/Admins/Edit", () => {
  beforeEach(() => {
    routerPatchMock.mockClear();
    routerPostMock.mockClear();
    usePageMock.mockReturnValue(defaultPageProps);
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

  describe("botão de resetar 2FA", () => {
    it("não aparece sem a permissão reset_two_factor", () => {
      render(<AdminsEdit admin={admin} roles={roles} />);

      expect(
        screen.queryByRole("button", { name: "Resetar 2FA" }),
      ).not.toBeInTheDocument();
    });

    it("não aparece na própria conta, mesmo com a permissão", () => {
      usePageMock.mockReturnValue({
        ...defaultPageProps,
        props: {
          ...defaultPageProps.props,
          current_admin_permissions: ["manage_admins", "reset_two_factor"],
          current_admin_id: admin.id,
        },
      });

      render(<AdminsEdit admin={admin} roles={roles} />);

      expect(
        screen.queryByRole("button", { name: "Resetar 2FA" }),
      ).not.toBeInTheDocument();
    });

    it("aparece pra outro admin com a permissão reset_two_factor", () => {
      usePageMock.mockReturnValue({
        ...defaultPageProps,
        props: {
          ...defaultPageProps.props,
          current_admin_permissions: ["manage_admins", "reset_two_factor"],
        },
      });

      render(<AdminsEdit admin={admin} roles={roles} />);

      expect(
        screen.getByRole("button", { name: "Resetar 2FA" }),
      ).toBeInTheDocument();
    });

    it("pede confirmação e envia a requisição quando confirmado", async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
      usePageMock.mockReturnValue({
        ...defaultPageProps,
        props: {
          ...defaultPageProps.props,
          current_admin_permissions: ["manage_admins", "reset_two_factor"],
        },
      });

      render(<AdminsEdit admin={admin} roles={roles} />);
      await user.click(screen.getByRole("button", { name: "Resetar 2FA" }));

      expect(confirmSpy).toHaveBeenCalled();
      expect(routerPostMock).toHaveBeenCalledWith(
        reset_two_factor_admin_admin_path(admin.id),
      );
    });

    it("não envia nada quando a confirmação é cancelada", async () => {
      const user = userEvent.setup();
      vi.spyOn(window, "confirm").mockReturnValue(false);
      usePageMock.mockReturnValue({
        ...defaultPageProps,
        props: {
          ...defaultPageProps.props,
          current_admin_permissions: ["manage_admins", "reset_two_factor"],
        },
      });

      render(<AdminsEdit admin={admin} roles={roles} />);
      await user.click(screen.getByRole("button", { name: "Resetar 2FA" }));

      expect(routerPostMock).not.toHaveBeenCalled();
    });
  });
});
