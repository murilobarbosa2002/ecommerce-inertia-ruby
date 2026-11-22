import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Card from "@/components/shared/card/Card";
import CardBody from "@/components/shared/card/card-body/CardBody";
import CardFooter from "@/components/shared/card/card-footer/CardFooter";
import CardHeader from "@/components/shared/card/card-header/CardHeader";

describe("Card", () => {
  it("renderiza o conteúdo com superfície, borda e sombra do tema", () => {
    render(<Card data-testid="card">Conteúdo</Card>);

    const card = screen.getByTestId("card");
    expect(card).toHaveTextContent("Conteúdo");
    expect(card).toHaveClass("bg-surface", "border-line", "shadow-card");
  });

  it("aplica a className passada e repassa props nativas", () => {
    render(
      <Card data-testid="card" className="max-w-md" id="resumo">
        x
      </Card>,
    );

    const card = screen.getByTestId("card");
    expect(card).toHaveClass("max-w-md");
    expect(card).toHaveAttribute("id", "resumo");
  });

  it("compõe cabeçalho, corpo e rodapé", () => {
    render(
      <Card>
        <CardHeader data-testid="header">Título</CardHeader>
        <CardBody data-testid="body">Corpo</CardBody>
        <CardFooter data-testid="footer">Ações</CardFooter>
      </Card>,
    );

    expect(screen.getByTestId("header")).toHaveClass("border-b");
    expect(screen.getByTestId("body")).toHaveClass("px-6", "py-5");
    expect(screen.getByTestId("footer")).toHaveClass("border-t", "justify-end");
  });

  it.each([
    ["CardHeader", CardHeader],
    ["CardBody", CardBody],
    ["CardFooter", CardFooter],
  ])("%s aplica a className passada", (_name, Part) => {
    render(
      <Part data-testid="part" className="uppercase">
        x
      </Part>,
    );

    expect(screen.getByTestId("part")).toHaveClass("uppercase");
  });
});
