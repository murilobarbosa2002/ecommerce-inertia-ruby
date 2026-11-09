import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Checkbox from "@/components/shared/checkbox/Checkbox";

describe("Checkbox", () => {
  it("renderiza desmarcado por padrão", () => {
    render(<Checkbox aria-label="Opção" />);

    expect(screen.getByRole("checkbox", { name: "Opção" })).not.toBeChecked();
  });

  it("alterna o estado ao clicar e chama onCheckedChange", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="Opção" onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByRole("checkbox", { name: "Opção" }));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("reflete o estado checked controlado", () => {
    render(<Checkbox aria-label="Opção" checked />);

    expect(screen.getByRole("checkbox", { name: "Opção" })).toBeChecked();
  });
});
