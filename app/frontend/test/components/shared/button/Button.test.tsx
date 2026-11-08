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

  it("usa a variante primary (largura cheia) por padrão", () => {
    render(<Button>Entrar</Button>);

    expect(screen.getByRole("button")).toHaveClass("w-full");
  });

  it("intent=ghost não força largura cheia nem fundo sólido", () => {
    render(<Button intent="ghost">Sair</Button>);

    const button = screen.getByRole("button");
    expect(button).not.toHaveClass("w-full");
    expect(button).not.toHaveClass("bg-indigo-600");
  });
});
