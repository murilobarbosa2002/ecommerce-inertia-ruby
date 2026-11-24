import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import MultiSelect from "@/components/shared/multi-select/MultiSelect";

const options = [
  { value: "a", label: "Opção A" },
  { value: "b", label: "Opção B" },
  { value: "c", label: "Opção C" },
];

function summary(selected: { label: string }[]) {
  if (selected.length === 0) return "Nenhuma selecionada";
  if (selected.length === options.length) return "Todas";
  return `${String(selected.length)} selecionadas`;
}

describe("MultiSelect", () => {
  it("mostra o texto visível acima do gatilho e um resumo no gatilho, fechado por padrão", () => {
    render(
      <MultiSelect
        label="Categoria"
        options={options}
        selected={["a"]}
        onChange={vi.fn()}
        searchPlaceholder="Buscar..."
        summary={summary}
      />,
    );

    expect(screen.getByText("Categoria")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Categoria: 1 selecionadas" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Opção A")).not.toBeInTheDocument();
  });

  it('mostra "Todas" quando tudo está selecionado', () => {
    render(
      <MultiSelect
        label="Categoria"
        options={options}
        selected={["a", "b", "c"]}
        onChange={vi.fn()}
        searchPlaceholder="Buscar..."
        summary={summary}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Categoria: Todas" }),
    ).toBeInTheDocument();
  });

  it("abre a lista com checkbox ao clicar no gatilho", async () => {
    const user = userEvent.setup();
    render(
      <MultiSelect
        label="Categoria"
        options={options}
        selected={["a"]}
        onChange={vi.fn()}
        searchPlaceholder="Buscar..."
        summary={summary}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Categoria: 1 selecionadas" }),
    );

    expect(screen.getByRole("checkbox", { name: "Opção A" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Opção B" })).not.toBeChecked();
  });

  it("busca filtra a lista exibida", async () => {
    const user = userEvent.setup();
    render(
      <MultiSelect
        label="Categoria"
        options={options}
        selected={[]}
        onChange={vi.fn()}
        searchPlaceholder="Buscar..."
        summary={summary}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Categoria: Nenhuma selecionada" }),
    );
    await user.type(screen.getByPlaceholderText("Buscar..."), "B");

    expect(
      screen.getByRole("checkbox", { name: "Opção B" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", { name: "Opção A" }),
    ).not.toBeInTheDocument();
  });

  it("marcar um checkbox chama onChange com a opção adicionada", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultiSelect
        label="Categoria"
        options={options}
        selected={[]}
        onChange={onChange}
        searchPlaceholder="Buscar..."
        summary={summary}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Categoria: Nenhuma selecionada" }),
    );
    await user.click(screen.getByRole("checkbox", { name: "Opção A" }));

    expect(onChange).toHaveBeenCalledWith(["a"]);
  });

  it("agrupa as opções num fieldset com legend associado ao label", async () => {
    const user = userEvent.setup();
    render(
      <MultiSelect
        label="Categoria"
        options={options}
        selected={["a"]}
        onChange={vi.fn()}
        searchPlaceholder="Buscar..."
        summary={summary}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Categoria: 1 selecionadas" }),
    );

    expect(
      screen.getByRole("group", { name: "Categoria" }),
    ).toBeInTheDocument();
  });

  it("desmarcar um checkbox chama onChange com a opção removida", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultiSelect
        label="Categoria"
        options={options}
        selected={["a", "b"]}
        onChange={onChange}
        searchPlaceholder="Buscar..."
        summary={summary}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Categoria: 2 selecionadas" }),
    );
    await user.click(screen.getByRole("checkbox", { name: "Opção A" }));

    expect(onChange).toHaveBeenCalledWith(["b"]);
  });
});
