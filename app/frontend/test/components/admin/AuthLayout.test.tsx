import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AuthLayout from "@/components/admin/AuthLayout";

interface MockPage {
  flash?: { notice?: string; alert?: string };
  props?: { store?: { name: string | null; logo_url: string | null } };
}

const usePageMock = vi.fn<() => MockPage>();

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

  describe("painel de marca", () => {
    it("usa o nome padrão quando a loja não tem nome", () => {
      usePageMock.mockReturnValue({});

      render(<AuthLayout title="Entrar">{null}</AuthLayout>);

      expect(screen.getByText("Ecommerce Inertia Ruby")).toBeInTheDocument();
    });

    it("usa o nome configurado da loja", () => {
      usePageMock.mockReturnValue({
        props: { store: { name: "Loja Aurora", logo_url: null } },
      });

      render(<AuthLayout title="Entrar">{null}</AuthLayout>);

      expect(screen.getByText("Loja Aurora")).toBeInTheDocument();
      expect(
        screen.queryByText("Ecommerce Inertia Ruby"),
      ).not.toBeInTheDocument();
    });

    it("mostra o logo da loja quando há um", () => {
      usePageMock.mockReturnValue({
        props: { store: { name: "Loja Aurora", logo_url: "/logo.png" } },
      });

      const { container } = render(
        <AuthLayout title="Entrar">{null}</AuthLayout>,
      );

      expect(
        container.querySelector('img[src="/logo.png"]'),
      ).toBeInTheDocument();
    });
  });
});
