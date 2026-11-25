import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Drawer from "@/components/shared/drawer/Drawer";

describe("Drawer", () => {
  it("renderiza título e conteúdo quando open", () => {
    render(
      <Drawer open title="Ana Souza" onOpenChange={vi.fn()}>
        <p>Detalhe da linha</p>
      </Drawer>,
    );

    expect(screen.getByText("Ana Souza")).toBeInTheDocument();
    expect(screen.getByText("Detalhe da linha")).toBeInTheDocument();
  });

  it("não renderiza nada quando não está open", () => {
    render(
      <Drawer open={false} title="Ana Souza" onOpenChange={vi.fn()}>
        <p>Detalhe da linha</p>
      </Drawer>,
    );

    expect(screen.queryByText("Ana Souza")).not.toBeInTheDocument();
  });

  it("fecha ao apertar Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Drawer open title="Ana Souza" onOpenChange={onOpenChange}>
        <p>Detalhe da linha</p>
      </Drawer>,
    );

    await user.keyboard("{Escape}");

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("fecha ao clicar no botão de fechar", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Drawer open title="Ana Souza" onOpenChange={onOpenChange}>
        <p>Detalhe da linha</p>
      </Drawer>,
    );

    await user.click(screen.getByRole("button", { name: "Fechar" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
