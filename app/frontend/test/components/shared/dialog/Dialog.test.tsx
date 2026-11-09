import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import Dialog from "@/components/shared/dialog/Dialog";

describe("Dialog", () => {
  it("renderiza título e conteúdo quando open", () => {
    render(
      <Dialog open title="Título do aviso">
        <p>Conteúdo do aviso</p>
      </Dialog>,
    );

    expect(screen.getByText("Título do aviso")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo do aviso")).toBeInTheDocument();
  });

  it("não renderiza nada quando não está open", () => {
    render(
      <Dialog open={false} title="Título do aviso">
        <p>Conteúdo do aviso</p>
      </Dialog>,
    );

    expect(screen.queryByText("Título do aviso")).not.toBeInTheDocument();
  });

  it("não tem botão de fechar (não é dismissível)", () => {
    render(
      <Dialog open title="Título do aviso">
        <p>Conteúdo do aviso</p>
      </Dialog>,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("não fecha ao apertar Escape", async () => {
    const user = userEvent.setup();
    render(
      <Dialog open title="Título do aviso">
        <p>Conteúdo do aviso</p>
      </Dialog>,
    );

    await user.keyboard("{Escape}");

    expect(screen.getByText("Título do aviso")).toBeInTheDocument();
  });
});
