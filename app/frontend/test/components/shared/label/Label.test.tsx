import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Label from "@/components/shared/label/Label";

describe("Label", () => {
  it("renderiza o conteúdo e associa com o controle via htmlFor", () => {
    render(
      <>
        <Label htmlFor="email_address">E-mail</Label>
        <input id="email_address" />
      </>,
    );

    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
  });

  it("aplica a className passada junto da variante", () => {
    render(
      <Label htmlFor="email_address" className="max-w-sm">
        E-mail
      </Label>,
    );

    expect(screen.getByText("E-mail")).toHaveClass("max-w-sm");
  });

  it("não é selecionável (rótulo é chrome de formulário, não conteúdo)", () => {
    render(<Label htmlFor="email_address">E-mail</Label>);

    expect(screen.getByText("E-mail")).toHaveClass("select-none");
  });
});
