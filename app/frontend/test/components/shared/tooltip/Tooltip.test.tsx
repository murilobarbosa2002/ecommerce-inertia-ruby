import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import Tooltip from "@/components/shared/tooltip/Tooltip";

describe("Tooltip", () => {
  it("não aparece até o gatilho receber foco ou hover", () => {
    render(
      <Tooltip content="Dica">
        <button type="button">Botão</button>
      </Tooltip>,
    );

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("aparece ao focar o gatilho pelo teclado", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Dica">
        <button type="button">Botão</button>
      </Tooltip>,
    );

    await user.tab();

    expect(await screen.findByRole("tooltip")).toHaveTextContent("Dica");
  });

  it("aparece ao passar o mouse", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Dica">
        <button type="button">Botão</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole("button", { name: "Botão" }));

    expect(await screen.findByRole("tooltip")).toHaveTextContent("Dica");
  });

  it("não troca o elemento do gatilho (é o próprio botão, sem wrapper)", () => {
    render(
      <Tooltip content="Dica">
        <button type="button">Botão</button>
      </Tooltip>,
    );

    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("some com Esc", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Dica">
        <button type="button">Botão</button>
      </Tooltip>,
    );
    await user.tab();
    await screen.findByRole("tooltip");

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  // Reproduz o flash reportado pelo mantenedor: content nasce vazio (ex. a
  // sidebar expandida, onde o botão já mostra o rótulo como texto em vez de
  // tooltip), o mouse já está sobre o gatilho há tempo suficiente pra
  // ultrapassar o delay de abertura do Radix, e só então content passa a
  // ter valor (ex. o clique que recolhe a sidebar). Sem reiniciar o estado
  // de hover pendente do Radix nessa transição, o tooltip pipocava já
  // aberto no instante em que content ficava disponível, sem esperar um
  // novo hover de verdade — some pouco depois porque o cursor normalmente
  // já não está mais sobre o gatilho menor/realocado.
  it("não reabre sozinho quando content passa de vazio pra preenchido com o gatilho já em hover", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <Tooltip content={null}>
        <button type="button">Botão</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole("button", { name: "Botão" }));
    await new Promise((resolve) => {
      setTimeout(resolve, 300);
    });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    rerender(
      <Tooltip content="Dica">
        <button type="button">Botão</button>
      </Tooltip>,
    );

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
