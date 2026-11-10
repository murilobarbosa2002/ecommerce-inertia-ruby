import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import StoreSettingsEdit from "@/pages/Admin/StoreSettings/Edit";
import { admin_store_setting_path } from "@/routes";

const { routerPatchMock } = vi.hoisted(() => ({ routerPatchMock: vi.fn() }));

vi.mock("@inertiajs/react", () => ({
  Head: () => null,
  router: { patch: routerPatchMock },
  usePage: () => ({
    props: {
      current_admin_permissions: ["manage_store_settings"],
      current_admin_two_factor_enabled: true,
    },
    component: "test",
  }),
}));

describe("Admin/StoreSettings/Edit", () => {
  beforeEach(() => {
    routerPatchMock.mockClear();
  });

  it("vem preenchido com o nome atual e sem preview quando não há logo", () => {
    render(<StoreSettingsEdit name="Loja Teste" logo_url={null} />);

    expect(screen.getByLabelText("Nome da loja")).toHaveValue("Loja Teste");
    expect(screen.queryByAltText("Logo atual da loja")).not.toBeInTheDocument();
  });

  it("mostra o preview do logo atual quando logo_url existe", () => {
    render(
      <StoreSettingsEdit
        name="Loja Teste"
        logo_url="https://example.com/logo.png"
      />,
    );

    expect(screen.getByAltText("Logo atual da loja")).toHaveAttribute(
      "src",
      "https://example.com/logo.png",
    );
  });

  it("envia só name e change_reason quando nenhum arquivo novo é escolhido", async () => {
    const user = userEvent.setup();
    render(<StoreSettingsEdit name="Loja Teste" logo_url={null} />);

    await user.clear(screen.getByLabelText("Nome da loja"));
    await user.type(screen.getByLabelText("Nome da loja"), "Nova Loja");
    await user.type(
      screen.getByLabelText("Motivo da alteração"),
      "Atualizando nome",
    );
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() => {
      expect(routerPatchMock).toHaveBeenCalledWith(admin_store_setting_path(), {
        name: "Nova Loja",
        change_reason: "Atualizando nome",
        logo: undefined,
      });
    });
  });

  it("envia o arquivo escolhido no campo logo", async () => {
    const user = userEvent.setup();
    render(<StoreSettingsEdit name="Loja Teste" logo_url={null} />);
    const file = new File(["conteudo"], "logo.png", { type: "image/png" });

    await user.upload(screen.getByLabelText("Logo"), file);
    await user.type(screen.getByLabelText("Motivo da alteração"), "Logo novo");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() => {
      expect(routerPatchMock).toHaveBeenCalledWith(admin_store_setting_path(), {
        name: "Loja Teste",
        change_reason: "Logo novo",
        logo: file,
      });
    });
  });

  it("não envia e mostra erro quando o motivo está vazio", async () => {
    const user = userEvent.setup();
    render(<StoreSettingsEdit name="Loja Teste" logo_url={null} />);

    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(
      await screen.findByText("Informe o motivo da alteração"),
    ).toBeInTheDocument();
    expect(routerPatchMock).not.toHaveBeenCalled();
  });
});
