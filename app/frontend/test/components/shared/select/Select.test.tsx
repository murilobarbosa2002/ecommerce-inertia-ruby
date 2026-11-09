import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Select from "@/components/shared/select/Select";

const options = [
  { value: "owner", label: "Owner" },
  { value: "editor", label: "Editor" },
];

describe("Select", () => {
  it("mostra o placeholder quando nenhum valor está selecionado", () => {
    render(<Select options={options} placeholder="Selecione um papel" />);

    expect(screen.getByText("Selecione um papel")).toBeInTheDocument();
  });

  it("mostra o label da opção selecionada", () => {
    render(<Select options={options} value="owner" />);

    expect(screen.getByText("Owner")).toBeInTheDocument();
  });

  it("chama onValueChange ao escolher uma opção", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Select
        options={options}
        placeholder="Selecione um papel"
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "Editor" }));

    expect(onValueChange).toHaveBeenCalledWith("editor");
  });
});
