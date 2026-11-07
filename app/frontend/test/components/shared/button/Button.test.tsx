import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Button from "@/components/shared/button/Button";

describe("Button", () => {
  it("renderiza o conteúdo e repassa props nativas", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Entrar</Button>);

    screen.getByRole("button", { name: "Entrar" }).click();

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("aplica a className passada junto da variante", () => {
    render(<Button className="max-w-sm">Entrar</Button>);

    expect(screen.getByRole("button")).toHaveClass("max-w-sm");
  });

  it("fica desabilitado quando disabled é passado", () => {
    render(<Button disabled>Entrar</Button>);

    expect(screen.getByRole("button")).toBeDisabled();
  });
});
