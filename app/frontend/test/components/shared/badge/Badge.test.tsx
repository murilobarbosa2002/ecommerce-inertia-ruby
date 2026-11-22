import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Badge from "@/components/shared/badge/Badge";

describe("Badge", () => {
  it("renderiza o texto", () => {
    render(<Badge>Ativo</Badge>);

    expect(screen.getByText("Ativo")).toBeInTheDocument();
  });

  it("usa o tom neutro e o tamanho sm por padrão", () => {
    render(<Badge>Ativo</Badge>);

    expect(screen.getByText("Ativo")).toHaveClass(
      "bg-surface-muted",
      "text-fg-muted",
      "text-xs",
    );
  });

  it.each([
    ["brand", "bg-accent-soft", "text-accent-text"],
    ["success", "bg-success-soft", "text-success-text"],
    ["warning", "bg-warning-soft", "text-warning-text"],
    ["danger", "bg-danger-soft", "text-danger-text"],
    ["info", "bg-info-soft", "text-info-text"],
  ] as const)("tone=%s usa fundo e texto do estado", (tone, bg, text) => {
    render(<Badge tone={tone}>x</Badge>);

    expect(screen.getByText("x")).toHaveClass(bg, text);
  });

  it("size=md usa o texto maior", () => {
    render(<Badge size="md">x</Badge>);

    expect(screen.getByText("x")).toHaveClass("text-sm");
  });

  it("aplica a className passada", () => {
    render(<Badge className="uppercase">x</Badge>);

    expect(screen.getByText("x")).toHaveClass("uppercase");
  });
});
