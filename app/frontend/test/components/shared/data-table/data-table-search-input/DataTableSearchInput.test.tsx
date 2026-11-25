import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import DataTableSearchInput from "@/components/shared/data-table/data-table-search-input/DataTableSearchInput";

describe("DataTableSearchInput", () => {
  it("mostra o valor e o placeholder recebidos", () => {
    render(
      <DataTableSearchInput
        value="ana"
        onChange={vi.fn()}
        placeholder="Buscar..."
      />,
    );

    expect(screen.getByPlaceholderText("Buscar...")).toHaveValue("ana");
  });

  it("chama onChange com o texto digitado", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DataTableSearchInput
        value=""
        onChange={onChange}
        placeholder="Buscar..."
      />,
    );

    await user.type(screen.getByPlaceholderText("Buscar..."), "a");

    expect(onChange).toHaveBeenCalledWith("a");
  });
});
