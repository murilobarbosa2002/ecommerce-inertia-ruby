import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PanelLayout from "@/components/admin/PanelLayout";
import { admin_session_path } from "@/routes";

const { routerDeleteMock } = vi.hoisted(() => ({ routerDeleteMock: vi.fn() }));

vi.mock("@inertiajs/react", () => ({
  Head: () => null,
  router: { delete: routerDeleteMock },
}));

describe("PanelLayout", () => {
  beforeEach(() => {
    routerDeleteMock.mockClear();
  });

  it("renderiza a marca e o conteúdo", () => {
    render(
      <PanelLayout title="Painel">
        <p>conteúdo da página</p>
      </PanelLayout>,
    );

    expect(screen.getByText("Ecommerce Inertia Ruby")).toBeInTheDocument();
    expect(screen.getByText("conteúdo da página")).toBeInTheDocument();
  });

  it("encerra a sessão ao clicar em Sair", async () => {
    const user = userEvent.setup();
    render(<PanelLayout title="Painel">{null}</PanelLayout>);

    await user.click(screen.getByRole("button", { name: "Sair" }));

    expect(routerDeleteMock).toHaveBeenCalledWith(admin_session_path());
  });
});
