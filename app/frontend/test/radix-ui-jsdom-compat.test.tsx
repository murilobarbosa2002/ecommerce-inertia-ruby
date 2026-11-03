import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "radix-ui";
import { describe, expect, it } from "vitest";

describe("polyfills de jsdom para o Radix UI (app/frontend/test/setup.ts)", () => {
  it("monta e permite interagir com um Checkbox do Radix sem erro de ResizeObserver/Pointer Events", async () => {
    const user = userEvent.setup();

    // Precisa estar dentro de um <form>: só nesse caso o Radix ativa o
    // CheckboxBubbleInput interno (sincroniza com um <input> nativo oculto),
    // que é o que de fato chama useSize/ResizeObserver no mount. Sem <form>,
    // esse caminho de código não é exercitado e o teste não pegaria a
    // regressão que motivou os polyfills (ver docs/adr/0012).
    render(
      <form>
        <Checkbox.Root
          aria-label="aceitar"
          name="aceitar"
          defaultChecked={false}
        >
          <Checkbox.Indicator data-testid="indicator">✓</Checkbox.Indicator>
        </Checkbox.Root>
      </form>,
    );

    const checkbox = screen.getByRole("checkbox", { name: "aceitar" });
    expect(checkbox).toHaveAttribute("aria-checked", "false");

    await user.click(checkbox);

    expect(checkbox).toHaveAttribute("aria-checked", "true");
    expect(screen.getByTestId("indicator")).toBeVisible();
  });
});
