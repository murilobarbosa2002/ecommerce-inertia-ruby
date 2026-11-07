import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Input from "@/components/shared/input/Input";

describe("Input", () => {
  it("repassa props nativas", () => {
    render(<Input aria-label="E-mail" type="email" />);

    expect(screen.getByLabelText("E-mail")).toHaveAttribute("type", "email");
  });

  it("aplica a className passada junto da variante", () => {
    render(<Input aria-label="E-mail" className="max-w-sm" />);

    expect(screen.getByLabelText("E-mail")).toHaveClass("max-w-sm");
  });

  it("encaminha o ref pro elemento input real (necessário pro register() do React Hook Form)", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input aria-label="E-mail" ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("muda de estilo quando invalid é true, sem quebrar quando omitido", () => {
    render(<Input aria-label="E-mail" invalid />);

    expect(screen.getByLabelText("E-mail")).toHaveClass("border-red-300");
  });
});
