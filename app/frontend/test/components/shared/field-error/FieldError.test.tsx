import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import FieldError from "@/components/shared/field-error/FieldError";

describe("FieldError", () => {
  it("renderiza a mensagem de erro", () => {
    render(<FieldError>Informe o e-mail</FieldError>);

    expect(screen.getByText("Informe o e-mail")).toBeInTheDocument();
  });
});
