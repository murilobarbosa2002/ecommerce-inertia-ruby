import { render, screen } from "@testing-library/react";
import { Inbox } from "lucide-react";
import { describe, expect, it } from "vitest";

import EmptyState from "@/components/shared/empty-state/EmptyState";

describe("EmptyState", () => {
  it("renderiza título e descrição", () => {
    render(<EmptyState title="Nada por aqui" description="Crie o primeiro." />);

    expect(
      screen.getByRole("heading", { name: "Nada por aqui" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Crie o primeiro.")).toBeInTheDocument();
  });

  it("usa h3 por padrão e aceita outro nível", () => {
    const { rerender } = render(<EmptyState title="Vazio" />);
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();

    rerender(<EmptyState title="Vazio" titleAs="h2" />);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("não renderiza descrição nem ícone quando não são passados", () => {
    const { container } = render(<EmptyState title="Vazio" />);

    expect(container.querySelector("p")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("renderiza o ícone escondido da acessibilidade", () => {
    const { container } = render(<EmptyState title="Vazio" icon={Inbox} />);

    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("renderiza a ação passada como filho", () => {
    render(
      <EmptyState title="Vazio">
        <button type="button">Criar</button>
      </EmptyState>,
    );

    expect(screen.getByRole("button", { name: "Criar" })).toBeInTheDocument();
  });

  it("aplica a className passada", () => {
    const { container } = render(<EmptyState title="Vazio" className="py-4" />);

    expect(container.firstChild).toHaveClass("py-4");
  });
});
