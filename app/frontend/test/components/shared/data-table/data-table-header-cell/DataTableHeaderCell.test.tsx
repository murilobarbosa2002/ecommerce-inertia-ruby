import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import DataTableHeaderCell from "@/components/shared/data-table/data-table-header-cell/DataTableHeaderCell";

describe("DataTableHeaderCell", () => {
  it("renderiza só texto, sem botão nem aria-sort, quando não é ordenável", () => {
    render(
      <table>
        <thead>
          <tr>
            <DataTableHeaderCell
              label="Papel"
              sortable={false}
              active={false}
              onSortToggle={vi.fn()}
            />
          </tr>
        </thead>
      </table>,
    );

    expect(screen.getByText("Papel")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByRole("columnheader")).not.toHaveAttribute("aria-sort");
  });

  it('marca aria-sort="none" numa coluna ordenável que não é o critério atual', () => {
    render(
      <table>
        <thead>
          <tr>
            <DataTableHeaderCell
              label="E-mail"
              sortable
              active={false}
              onSortToggle={vi.fn()}
            />
          </tr>
        </thead>
      </table>,
    );

    expect(screen.getByRole("columnheader")).toHaveAttribute(
      "aria-sort",
      "none",
    );
  });

  it('marca aria-sort="ascending" e mostra o ícone quando ativa em asc', () => {
    render(
      <table>
        <thead>
          <tr>
            <DataTableHeaderCell
              label="E-mail"
              sortable
              active
              direction="asc"
              onSortToggle={vi.fn()}
            />
          </tr>
        </thead>
      </table>,
    );

    expect(screen.getByRole("columnheader")).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
  });

  it('marca aria-sort="descending" quando ativa em desc', () => {
    render(
      <table>
        <thead>
          <tr>
            <DataTableHeaderCell
              label="E-mail"
              sortable
              active
              direction="desc"
              onSortToggle={vi.fn()}
            />
          </tr>
        </thead>
      </table>,
    );

    expect(screen.getByRole("columnheader")).toHaveAttribute(
      "aria-sort",
      "descending",
    );
  });

  it("chama onSortToggle ao clicar no cabeçalho ordenável", async () => {
    const user = userEvent.setup();
    const onSortToggle = vi.fn();
    render(
      <table>
        <thead>
          <tr>
            <DataTableHeaderCell
              label="E-mail"
              sortable
              active={false}
              onSortToggle={onSortToggle}
            />
          </tr>
        </thead>
      </table>,
    );

    await user.click(screen.getByRole("button", { name: "E-mail" }));

    expect(onSortToggle).toHaveBeenCalled();
  });
});
