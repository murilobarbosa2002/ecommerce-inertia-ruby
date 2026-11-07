import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AuthLayout from "@/components/admin/AuthLayout";

const usePageMock =
  vi.fn<() => { flash?: { notice?: string; alert?: string } }>();

vi.mock("@inertiajs/react", () => ({
  usePage: () => usePageMock(),
}));

describe("AuthLayout", () => {
  it("renders the title and children", () => {
    usePageMock.mockReturnValue({});

    render(
      <AuthLayout title="Entrar">
        <p>conteúdo da página</p>
      </AuthLayout>,
    );

    expect(screen.getByRole("heading", { name: "Entrar" })).toBeInTheDocument();
    expect(screen.getByText("conteúdo da página")).toBeInTheDocument();
  });

  it("renders flash.notice when present", () => {
    usePageMock.mockReturnValue({ flash: { notice: "Tudo certo" } });

    render(<AuthLayout title="Entrar">{null}</AuthLayout>);

    expect(screen.getByRole("status")).toHaveTextContent("Tudo certo");
  });

  it("renders flash.alert when present", () => {
    usePageMock.mockReturnValue({ flash: { alert: "Algo errado" } });

    render(<AuthLayout title="Entrar">{null}</AuthLayout>);

    expect(screen.getByRole("alert")).toHaveTextContent("Algo errado");
  });

  it("does not render flash elements when flash is an empty object", () => {
    usePageMock.mockReturnValue({ flash: {} });

    render(<AuthLayout title="Entrar">{null}</AuthLayout>);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("não quebra quando a página não tem a chave flash (comportamento real do inertia_rails sem redirect anterior)", () => {
    usePageMock.mockReturnValue({});

    render(<AuthLayout title="Entrar">{null}</AuthLayout>);

    expect(screen.getByRole("heading", { name: "Entrar" })).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
