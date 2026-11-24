import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminsNew from "@/pages/Admin/Admins/New";
import { admin_admins_path } from "@/routes";

const { routerPostMock } = vi.hoisted(() => ({ routerPostMock: vi.fn() }));

vi.mock("@inertiajs/react", () => ({
  Head: () => null,
  Link: "a",
  router: { post: routerPostMock },
  usePage: () => ({
    props: {
      current_admin_permissions: ["manage_admins"],
      current_admin_two_factor_enabled: true,
    },
    component: "test",
  }),
}));

const roles = [{ id: 1, name: "owner" }];

describe("Admin/Admins/New", () => {
  beforeEach(() => {
    routerPostMock.mockClear();
  });

  it("cria um admin com os dados digitados, incluindo a senha gerada", async () => {
    const user = userEvent.setup();
    render(<AdminsNew roles={roles} />);

    await user.type(screen.getByLabelText("Nome"), "Novo");
    await user.type(screen.getByLabelText("Sobrenome"), "Admin");
    await user.type(screen.getByLabelText("E-mail"), "novo-admin@example.com");
    await user.click(screen.getByRole("button", { name: "Gerar senha" }));
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "owner" }));
    await user.type(
      screen.getByLabelText("Motivo da criação"),
      "Novo admin da equipe de suporte",
    );
    await user.click(screen.getByRole("button", { name: "Criar admin" }));

    await waitFor(() => {
      expect(routerPostMock).toHaveBeenCalledWith(admin_admins_path(), {
        email_address: "novo-admin@example.com",
        first_name: "Novo",
        last_name: "Admin",
        phone: "",
        password: expect.any(String) as string,
        password_confirmation: expect.any(String) as string,
        role_id: "1",
        change_reason: "Novo admin da equipe de suporte",
      });
    });
    const [, data] = routerPostMock.mock.calls[0] as [
      string,
      { password: string; password_confirmation: string },
    ];
    expect(data.password).toHaveLength(20);
    expect(data.password).toBe(data.password_confirmation);
  });

  it("aceita um celular no formato brasileiro e envia junto", async () => {
    const user = userEvent.setup();
    render(<AdminsNew roles={roles} />);

    await user.type(screen.getByLabelText("Nome"), "Novo");
    await user.type(screen.getByLabelText("Sobrenome"), "Admin");
    await user.type(screen.getByLabelText("E-mail"), "novo-admin@example.com");
    await user.type(screen.getByLabelText("Celular (opcional)"), "11988887777");
    await user.click(screen.getByRole("button", { name: "Gerar senha" }));
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "owner" }));
    await user.type(
      screen.getByLabelText("Motivo da criação"),
      "Novo admin da equipe de suporte",
    );
    await user.click(screen.getByRole("button", { name: "Criar admin" }));

    await waitFor(() => {
      expect(routerPostMock).toHaveBeenCalledWith(
        admin_admins_path(),
        expect.objectContaining({ phone: "11988887777" }),
      );
    });
  });

  it("mostra erro quando o celular informado não tem o formato esperado", async () => {
    const user = userEvent.setup();
    render(<AdminsNew roles={roles} />);

    await user.type(screen.getByLabelText("Celular (opcional)"), "123");
    await user.click(screen.getByRole("button", { name: "Criar admin" }));

    expect(
      await screen.findByText("Informe um celular válido (DDD + 9 dígitos)"),
    ).toBeInTheDocument();
    expect(routerPostMock).not.toHaveBeenCalled();
  });

  it("não envia e mostra erro quando os campos obrigatórios estão vazios", async () => {
    const user = userEvent.setup();
    render(<AdminsNew roles={roles} />);

    await user.click(screen.getByRole("button", { name: "Criar admin" }));

    expect(await screen.findByText("Informe o nome")).toBeInTheDocument();
    expect(screen.getByText("Informe o sobrenome")).toBeInTheDocument();
    expect(screen.getByText("Informe o e-mail")).toBeInTheDocument();
    expect(screen.getByText("Informe a senha")).toBeInTheDocument();
    expect(screen.getByText("O papel é obrigatório")).toBeInTheDocument();
    expect(screen.getByText("Informe o motivo da criação")).toBeInTheDocument();
    expect(routerPostMock).not.toHaveBeenCalled();
  });
});
