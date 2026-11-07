import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SessionNew from "@/pages/Admin/Session/New";

const { routerPostMock } = vi.hoisted(() => ({ routerPostMock: vi.fn() }));

vi.mock("@inertiajs/react", () => ({
  Head: () => null,
  router: { post: routerPostMock },
  usePage: () => ({ flash: {} }),
}));

describe("Admin/Session/New", () => {
  beforeEach(() => {
    routerPostMock.mockClear();
  });

  it("envia e-mail e senha pra /admin/login", async () => {
    const user = userEvent.setup();
    render(<SessionNew />);

    await user.type(screen.getByLabelText("E-mail"), "admin@example.com");
    await user.type(screen.getByLabelText("Senha"), "senha-correta");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(routerPostMock).toHaveBeenCalledWith("/admin/login", {
        email_address: "admin@example.com",
        password: "senha-correta",
      });
    });
  });

  it("não envia e mostra erro quando os campos estão vazios", async () => {
    const user = userEvent.setup();
    render(<SessionNew />);

    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Informe o e-mail")).toBeInTheDocument();
    expect(screen.getByText("Informe a senha")).toBeInTheDocument();
    expect(routerPostMock).not.toHaveBeenCalled();
  });
});
