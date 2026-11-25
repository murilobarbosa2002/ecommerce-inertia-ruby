import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Drawer, { shouldDismissOnDrag } from "@/components/shared/drawer/Drawer";

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

  // Simular um gesto de arrastar de verdade (ponteiro + velocidade) via
  // Motion não é algo que jsdom reproduz de forma confiável — por isso a
  // decisão em si foi extraída (shouldDismissOnDrag) pra testar isolada.
  describe("shouldDismissOnDrag", () => {
    it("não fecha com arrasto curto e lento", () => {
      expect(shouldDismissOnDrag(50, 100)).toBe(false);
    });

    it("fecha quando o offset passa de 120px, mesmo devagar", () => {
      expect(shouldDismissOnDrag(121, 0)).toBe(true);
    });

    it("fecha quando a velocidade passa de 500px/s, mesmo com pouco offset (flick)", () => {
      expect(shouldDismissOnDrag(10, 501)).toBe(true);
    });

    it("não fecha exatamente nos limites (> estrito, não >=)", () => {
      expect(shouldDismissOnDrag(120, 500)).toBe(false);
    });
  });
});
