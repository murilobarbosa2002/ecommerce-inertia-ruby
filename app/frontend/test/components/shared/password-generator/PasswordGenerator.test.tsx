import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import PasswordGenerator from "@/components/shared/password-generator/PasswordGenerator";

describe("PasswordGenerator", () => {
  it("gera uma senha com o tamanho padrão e chama onGenerate", async () => {
    const user = userEvent.setup();
    const onGenerate = vi.fn();
    render(<PasswordGenerator onGenerate={onGenerate} />);

    await user.click(screen.getByRole("button", { name: "Gerar senha" }));

    expect(onGenerate).toHaveBeenCalledOnce();
    const generated = onGenerate.mock.calls[0]?.[0] as string;
    expect(generated).toHaveLength(20);
  });

  it("gera uma senha só com minúsculas quando as três opções são desmarcadas", async () => {
    const user = userEvent.setup();
    const onGenerate = vi.fn();
    render(<PasswordGenerator onGenerate={onGenerate} />);

    await user.click(screen.getByRole("checkbox", { name: "Maiúsculas" }));
    await user.click(screen.getByRole("checkbox", { name: "Números" }));
    await user.click(
      screen.getByRole("checkbox", { name: "Caracteres especiais" }),
    );
    await user.click(screen.getByRole("button", { name: "Gerar senha" }));

    const generated = onGenerate.mock.calls[0]?.[0] as string;
    expect(generated).toMatch(/^[a-z]+$/);
  });

  it("respeita a quantidade de caracteres configurada", async () => {
    const user = userEvent.setup();
    const onGenerate = vi.fn();
    render(<PasswordGenerator onGenerate={onGenerate} />);

    const lengthInput = screen.getByLabelText("Quantidade de caracteres");
    await user.clear(lengthInput);
    await user.type(lengthInput, "32");
    await user.click(screen.getByRole("button", { name: "Gerar senha" }));

    const generated = onGenerate.mock.calls[0]?.[0] as string;
    expect(generated).toHaveLength(32);
  });

  it("limita a quantidade de caracteres ao máximo de 72 (bcrypt), mesmo digitando um valor maior", async () => {
    const user = userEvent.setup();
    const onGenerate = vi.fn();
    render(<PasswordGenerator onGenerate={onGenerate} />);

    const lengthInput = screen.getByLabelText("Quantidade de caracteres");
    await user.clear(lengthInput);
    await user.type(lengthInput, "500");
    await user.click(screen.getByRole("button", { name: "Gerar senha" }));

    const generated = onGenerate.mock.calls[0]?.[0] as string;
    expect(generated).toHaveLength(72);
  });

  it("não quebra ao gerar com o campo de quantidade vazio", async () => {
    const user = userEvent.setup();
    const onGenerate = vi.fn();
    render(<PasswordGenerator onGenerate={onGenerate} />);

    const lengthInput = screen.getByLabelText("Quantidade de caracteres");
    await user.clear(lengthInput);
    await user.click(screen.getByRole("button", { name: "Gerar senha" }));

    expect(onGenerate).toHaveBeenCalledOnce();
    const generated = onGenerate.mock.calls[0]?.[0] as string;
    expect(generated.length).toBeGreaterThanOrEqual(8);
  });

  it("copia a senha gerada pro clipboard e mostra confirmação", async () => {
    // userEvent.setup() sempre substitui navigator.clipboard pelo stub dele
    // (achado real: Object.defineProperty antes do setup() parecia não ter
    // efeito nenhum, porque o setup() sobrescrevia de novo por cima) —
    // definir o mock depois do setup(), não antes.
    const user = userEvent.setup({ writeToClipboard: false });
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      configurable: true,
    });
    render(<PasswordGenerator onGenerate={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Gerar senha" }));
    await user.click(screen.getByRole("button", { name: "Copiar" }));

    expect(writeTextMock).toHaveBeenCalledOnce();
    expect(
      await screen.findByRole("button", { name: "Copiado!" }),
    ).toBeInTheDocument();
  });
});
