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

  it("usa a variante primary, sem largura cheia, por padrão", () => {
    render(<Button>Entrar</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-accent");
    expect(button).not.toHaveClass("w-full");
  });

  it("fullWidth ocupa a largura toda", () => {
    render(<Button fullWidth>Entrar</Button>);

    expect(screen.getByRole("button")).toHaveClass("w-full");
  });

  it("intent=ghost não tem fundo sólido", () => {
    render(<Button intent="ghost">Sair</Button>);

    const button = screen.getByRole("button");
    expect(button).not.toHaveClass("bg-accent");
    expect(button).toHaveClass("text-fg-muted");
  });

  it.each([
    ["secondary", "bg-surface-muted"],
    ["outline", "border-line-strong"],
    ["danger", "bg-danger-solid"],
  ] as const)("intent=%s aplica a classe %s", (intent, expectedClass) => {
    render(<Button intent={intent}>Ação</Button>);

    expect(screen.getByRole("button")).toHaveClass(expectedClass);
  });

  it.each([
    ["sm", "h-8"],
    ["md", "h-10"],
    ["lg", "h-12"],
    ["icon", "size-10"],
  ] as const)("size=%s aplica a classe %s", (size, expectedClass) => {
    render(<Button size={size}>Ação</Button>);

    expect(screen.getByRole("button")).toHaveClass(expectedClass);
  });

  describe("loading", () => {
    it("desabilita o botão e marca aria-busy", () => {
      render(<Button loading>Salvar</Button>);

      const button = screen.getByRole("button", { name: "Salvar" });
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-busy", "true");
    });

    it("mostra o spinner sem esconder o rótulo", () => {
      const { container } = render(<Button loading>Salvar</Button>);

      expect(container.querySelector("svg")).toBeInTheDocument();
      expect(screen.getByText("Salvar")).toBeInTheDocument();
    });

    it("não renderiza spinner nem aria-busy quando não está carregando", () => {
      const { container } = render(<Button>Salvar</Button>);

      expect(container.querySelector("svg")).not.toBeInTheDocument();
      expect(screen.getByRole("button")).not.toHaveAttribute("aria-busy");
    });

    it("não chama onClick enquanto carrega", () => {
      const onClick = vi.fn();
      render(
        <Button loading onClick={onClick}>
          Salvar
        </Button>,
      );

      screen.getByRole("button").click();

      expect(onClick).not.toHaveBeenCalled();
    });
  });
});
