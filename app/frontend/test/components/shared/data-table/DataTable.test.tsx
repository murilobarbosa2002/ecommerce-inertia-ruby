import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import DataTable from "@/components/shared/data-table/DataTable";
import { type DataTableColumn } from "@/components/shared/data-table/DataTable.types";

interface Row {
  id: number;
  email: string;
}

const columns: DataTableColumn<Row>[] = [
  {
    key: "email",
    header: "E-mail",
    sortable: true,
    render: (row) => row.email,
  },
  { key: "role", header: "Papel", render: () => "owner" },
];

const rows: Row[] = [
  { id: 1, email: "ana@example.com" },
  { id: 2, email: "bruno@example.com" },
];

function desktopTable() {
  return screen.getByRole("table");
}

describe("DataTable", () => {
  it("renderiza os cabeçalhos e as linhas da tabela (desktop) a partir das colunas declaradas", () => {
    render(
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        emptyTitle="Nenhum admin"
      />,
    );

    const table = within(desktopTable());
    expect(
      table.getByRole("columnheader", { name: "E-mail" }),
    ).toBeInTheDocument();
    expect(table.getByText("ana@example.com")).toBeInTheDocument();
    expect(table.getByText("bruno@example.com")).toBeInTheDocument();
  });

  it("mostra o EmptyState quando não há linhas e não está carregando", () => {
    render(
      <DataTable
        columns={columns}
        rows={[]}
        getRowKey={(row) => row.id}
        emptyTitle="Nenhum admin"
        emptyDescription="Crie o primeiro admin pra começar."
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Nenhum admin" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("mostra linhas de skeleton na tabela enquanto carrega", () => {
    const { container } = render(
      <DataTable
        columns={columns}
        rows={[]}
        getRowKey={(row) => row.id}
        isLoading
        skeletonRows={3}
        emptyTitle="Nenhum admin"
      />,
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(container.querySelectorAll("table tbody tr")).toHaveLength(3);
  });

  it("chama onSortChange com a chave da coluna clicada", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        onSortChange={onSortChange}
        emptyTitle="Nenhum admin"
      />,
    );

    await user.click(
      within(desktopTable()).getByRole("button", { name: "E-mail" }),
    );

    expect(onSortChange).toHaveBeenCalledWith("email");
  });

  it("marca a coluna ativa do sort recebido via prop", () => {
    render(
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        sort={{ column: "email", direction: "desc" }}
        emptyTitle="Nenhum admin"
      />,
    );

    expect(
      within(desktopTable()).getByRole("columnheader", { name: "E-mail" }),
    ).toHaveAttribute("aria-sort", "descending");
  });

  it("no mobile, cada linha vira um cartão com a 1ª e a 2ª coluna resumidas", () => {
    render(
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        emptyTitle="Nenhum admin"
      />,
    );

    expect(
      screen.getByRole("button", { name: "ana@example.com owner" }),
    ).toBeInTheDocument();
  });

  it("o wrapper de cada coluna no cartão mobile nunca é <p> (render() pode devolver um elemento de bloco, ex. Avatar/Badge — docs/bugs/code-structure.md)", () => {
    const blockColumns: DataTableColumn<Row>[] = [
      {
        key: "email",
        header: "E-mail",
        render: (row) => (
          <div data-testid={`primary-${String(row.id)}`}>
            <div>{row.email}</div>
          </div>
        ),
      },
      {
        key: "role",
        header: "Papel",
        render: (row) => (
          <div data-testid={`secondary-${String(row.id)}`}>owner</div>
        ),
      },
    ];

    render(
      <DataTable
        columns={blockColumns}
        rows={rows}
        getRowKey={(row) => row.id}
        emptyTitle="Nenhum admin"
      />,
    );

    const mobileList = within(screen.getByRole("list"));
    expect(mobileList.getByTestId("primary-1").parentElement?.tagName).not.toBe(
      "P",
    );
    expect(
      mobileList.getByTestId("secondary-1").parentElement?.tagName,
    ).not.toBe("P");
  });

  it("tocar um cartão no mobile abre o Drawer com as colunas que não são o título", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        emptyTitle="Nenhum admin"
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "ana@example.com owner" }),
    );

    const drawer = await screen.findByRole("dialog");
    expect(
      within(drawer).getByRole("heading", { name: "ana@example.com" }),
    ).toBeInTheDocument();
    expect(within(drawer).getByText("Papel")).toBeInTheDocument();
    expect(within(drawer).getByText("owner")).toBeInTheDocument();
  });

  it("não repete a 1ª coluna (já é o título) na lista de detalhe do Drawer", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        emptyTitle="Nenhum admin"
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "ana@example.com owner" }),
    );

    const drawer = await screen.findByRole("dialog");
    expect(within(drawer).queryByText("E-mail")).not.toBeInTheDocument();
  });

  it("mostra rowActions na tabela (desktop) e dentro do Drawer (mobile), avisando o context de cada um", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        emptyTitle="Nenhum admin"
        rowActions={(row, context) => (
          <button type="button">{`Editar ${row.email} (${context})`}</button>
        )}
      />,
    );

    expect(
      within(desktopTable()).getByRole("button", {
        name: "Editar ana@example.com (table)",
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "ana@example.com owner" }),
    );
    const drawer = await screen.findByRole("dialog");

    expect(
      within(drawer).getByRole("button", {
        name: "Editar ana@example.com (drawer)",
      }),
    ).toBeInTheDocument();
  });
});
