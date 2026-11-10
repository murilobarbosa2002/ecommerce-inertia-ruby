import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import FormField from "@/components/shared/form-field/FormField";

// register() de verdade devolve { name, onChange, onBlur, ref } — só o
// suficiente pro FormField espalhar no Input é simulado aqui, sem precisar
// de um useForm real (docs/adr/0026).
const fakeRegister = {
  name: "email_address",
  onChange: vi.fn(),
  onBlur: vi.fn(),
  ref: vi.fn(),
};

describe("FormField", () => {
  it("renderiza label associada ao input via htmlFor/id", () => {
    render(
      <FormField id="email_address" label="E-mail" register={fakeRegister} />,
    );

    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
  });

  it("não mostra erro quando error não é informado", () => {
    render(
      <FormField id="email_address" label="E-mail" register={fakeRegister} />,
    );

    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).not.toHaveClass("border-red-500");
  });

  it("mostra a mensagem de erro e marca o input como inválido quando error é informado", () => {
    render(
      <FormField
        id="email_address"
        label="E-mail"
        error="Informe o e-mail"
        register={fakeRegister}
      />,
    );

    expect(screen.getByText("Informe o e-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toHaveClass("border-red-500");
  });

  it("repassa props nativas do input (type, autoComplete, inputMode)", () => {
    render(
      <FormField
        id="otp_code"
        label="Código"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        register={{ ...fakeRegister, name: "otp_code" }}
      />,
    );

    const input = screen.getByLabelText("Código");
    expect(input).toHaveAttribute("inputMode", "numeric");
    expect(input).toHaveAttribute("autoComplete", "one-time-code");
  });

  it("espalha o register no input (name chega até o elemento real)", () => {
    render(
      <FormField id="email_address" label="E-mail" register={fakeRegister} />,
    );

    expect(screen.getByLabelText("E-mail")).toHaveAttribute(
      "name",
      "email_address",
    );
  });
});
