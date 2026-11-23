import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PageHeader from "@/components/admin/page-header/PageHeader";

describe("PageHeader", () => {
  it("mostra o título como heading", () => {
    render(<PageHeader title="Painel" />);

    expect(screen.getByRole("heading", { name: "Painel" })).toBeInTheDocument();
  });

  it("mostra a descrição quando informada", () => {
    render(<PageHeader title="Painel" description="Visão geral" />);

    expect(screen.getByText("Visão geral")).toBeInTheDocument();
  });

  it("não mostra nenhum parágrafo de descrição quando não informada", () => {
    render(<PageHeader title="Painel" />);

    expect(screen.queryByText("Visão geral")).not.toBeInTheDocument();
  });

  it("mostra a ação quando informada", () => {
    render(<PageHeader title="Painel" action={<button>Nova ação</button>} />);

    expect(
      screen.getByRole("button", { name: "Nova ação" }),
    ).toBeInTheDocument();
  });
});
