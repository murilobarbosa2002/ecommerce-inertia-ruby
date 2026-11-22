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
});
