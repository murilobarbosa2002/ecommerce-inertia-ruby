import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PasswordNew from "@/pages/Admin/Password/New";

const { routerPostMock } = vi.hoisted(() => ({ routerPostMock: vi.fn() }));

vi.mock("@inertiajs/react", () => ({
  Head: () => null,
  router: { post: routerPostMock },
  usePage: () => ({ flash: {} }),
}));

describe("Admin/Password/New", () => {
  beforeEach(() => {
    routerPostMock.mockClear();
  });

  it("envia o e-mail pra /admin/passwords", async () => {
    const user = userEvent.setup();
    render(<PasswordNew />);

    await user.type(screen.getByLabelText("E-mail"), "admin@example.com");
    await user.click(screen.getByRole("button", { name: "Enviar instruções" }));

    await waitFor(() => {
      expect(routerPostMock).toHaveBeenCalledWith("/admin/passwords", {
        email_address: "admin@example.com",
      });
    });
  });

  it("não envia e mostra erro quando o e-mail está vazio", async () => {
    const user = userEvent.setup();
    render(<PasswordNew />);

    await user.click(screen.getByRole("button", { name: "Enviar instruções" }));

    expect(await screen.findByText("Informe o e-mail")).toBeInTheDocument();
    expect(routerPostMock).not.toHaveBeenCalled();
  });
});
