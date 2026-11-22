import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Avatar from "@/components/shared/avatar/Avatar";

describe("Avatar", () => {
  it("expõe o nome como texto alternativo do contêiner", () => {
    render(<Avatar name="Ana Souza" />);

    expect(screen.getByRole("img", { name: "Ana Souza" })).toBeInTheDocument();
  });

  it("mostra as iniciais quando não há foto", () => {
    render(<Avatar name="Ana Souza" />);

    expect(screen.getByText("AS")).toBeInTheDocument();
  });

  it("gera as iniciais a partir de um e-mail", () => {
    render(<Avatar name="carlos.lima@loja.com" />);

    expect(screen.getByText("CL")).toBeInTheDocument();
  });

  it("mantém o nome acessível quando há foto (ainda carregando)", () => {
    render(<Avatar name="Ana Souza" src="https://exemplo.test/ana.png" />);

    expect(screen.getByRole("img", { name: "Ana Souza" })).toBeInTheDocument();
  });

  it("size=md é o padrão e size=lg aumenta", () => {
    const { rerender } = render(<Avatar name="Ana Souza" />);
    expect(screen.getByRole("img")).toHaveClass("size-10");

    rerender(<Avatar name="Ana Souza" size="lg" />);
    expect(screen.getByRole("img")).toHaveClass("size-14");
  });

  it("aplica a className passada", () => {
    render(<Avatar name="Ana Souza" className="ring-2" />);

    expect(screen.getByRole("img")).toHaveClass("ring-2");
  });
});
