import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import Popover from "@/components/shared/popover/Popover";

describe("Popover", () => {
  it("não mostra o conteúdo até o trigger ser clicado", () => {
    render(
      <Popover trigger={<button type="button">Abrir</button>}>
        <p>Conteúdo do popover</p>
      </Popover>,
    );

    expect(screen.queryByText("Conteúdo do popover")).not.toBeInTheDocument();
  });

  it("mostra o conteúdo ao clicar no trigger", async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={<button type="button">Abrir</button>}>
        <p>Conteúdo do popover</p>
      </Popover>,
    );

    await user.click(screen.getByRole("button", { name: "Abrir" }));

    expect(screen.getByText("Conteúdo do popover")).toBeInTheDocument();
  });

  it("fecha ao apertar Escape", async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={<button type="button">Abrir</button>}>
        <p>Conteúdo do popover</p>
      </Popover>,
    );

    await user.click(screen.getByRole("button", { name: "Abrir" }));
    await user.keyboard("{Escape}");

    // Sai com animação de exit (Motion, docs/adr/0017) — o elemento
    // continua montado até a transição terminar, não desaparece no
    // mesmo tick do Escape.
    await waitFor(() => {
      expect(screen.queryByText("Conteúdo do popover")).not.toBeInTheDocument();
    });
  });
});
