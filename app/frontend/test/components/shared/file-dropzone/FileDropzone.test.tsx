import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import FileDropzone from "@/components/shared/file-dropzone/FileDropzone";

const defaultProps = {
  id: "logo",
  accept: ["image/png", "image/jpeg", "image/svg+xml"],
  maxSize: 2 * 1024 * 1024,
  previewAlt: "Logo atual",
  instructions: "Arraste uma imagem ou clique para selecionar",
  removeLabel: "Cancelar seleção",
  invalidTypeError: "O arquivo precisa ser PNG, JPEG ou SVG",
  tooLargeError: "O arquivo não pode passar de 2MB",
};

describe("FileDropzone", () => {
  it("mostra o preview existente quando não há arquivo novo", () => {
    render(
      <FileDropzone
        {...defaultProps}
        value={null}
        onChange={vi.fn()}
        previewUrl="https://example.com/logo.png"
      />,
    );

    expect(screen.getByAltText("Logo atual")).toHaveAttribute(
      "src",
      "https://example.com/logo.png",
    );
  });

  it("chama onChange com o arquivo válido escolhido", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FileDropzone {...defaultProps} value={null} onChange={onChange} />);
    const file = new File(["conteudo"], "logo.png", { type: "image/png" });

    await user.upload(
      screen.getByLabelText("Arraste uma imagem ou clique para selecionar"),
      file,
    );

    expect(onChange).toHaveBeenCalledWith(file);
  });

  // Via drop (não user.upload): o atributo accept do input só filtra o
  // seletor nativo de arquivo do SO — arrastar e soltar ignora accept
  // nos navegadores de verdade, então é a validação no handleFile que
  // precisa pegar um tipo fora da lista, não o input.
  it("rejeita tipo não permitido largado na área, sem chamar onChange", () => {
    const onChange = vi.fn();
    render(<FileDropzone {...defaultProps} value={null} onChange={onChange} />);
    const file = new File(["conteudo"], "logo.gif", { type: "image/gif" });

    fireEvent.drop(
      screen.getByLabelText("Arraste uma imagem ou clique para selecionar"),
      { dataTransfer: { files: [file] } },
    );

    expect(onChange).not.toHaveBeenCalled();
    expect(
      screen.getByText("O arquivo precisa ser PNG, JPEG ou SVG"),
    ).toBeInTheDocument();
  });

  it("rejeita arquivo maior que o limite largado na área, sem chamar onChange", () => {
    const onChange = vi.fn();
    render(<FileDropzone {...defaultProps} value={null} onChange={onChange} />);
    const oversized = new File(
      [new Uint8Array(defaultProps.maxSize + 1)],
      "logo.png",
      { type: "image/png" },
    );

    fireEvent.drop(
      screen.getByLabelText("Arraste uma imagem ou clique para selecionar"),
      { dataTransfer: { files: [oversized] } },
    );

    expect(onChange).not.toHaveBeenCalled();
    expect(
      screen.getByText("O arquivo não pode passar de 2MB"),
    ).toBeInTheDocument();
  });

  it("mostra botão de cancelar seleção só quando há um arquivo novo, e chama onChange(null)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const file = new File(["conteudo"], "logo.png", { type: "image/png" });

    const { rerender } = render(
      <FileDropzone {...defaultProps} value={null} onChange={onChange} />,
    );
    expect(
      screen.queryByRole("button", { name: "Cancelar seleção" }),
    ).not.toBeInTheDocument();

    rerender(
      <FileDropzone {...defaultProps} value={file} onChange={onChange} />,
    );
    await user.click(screen.getByRole("button", { name: "Cancelar seleção" }));

    expect(onChange).toHaveBeenCalledWith(null);
  });
});
