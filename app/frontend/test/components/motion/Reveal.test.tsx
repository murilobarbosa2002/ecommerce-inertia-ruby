import { type ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mocka o motor de animação pra testar só a lógica do Reveal (qual valor
// inicial/transição ele monta pra cada combinação de props), não o
// comportamento interno do Motion — que já tem sua própria suíte de testes.
vi.mock("motion/react", () => ({
  motion: {
    div: ({
      children,
      initial,
      animate,
      transition,
      ...rest
    }: {
      children?: ReactNode;
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
    } & Record<string, unknown>) => (
      <div
        data-initial={JSON.stringify(initial)}
        data-animate={JSON.stringify(animate)}
        data-transition={JSON.stringify(transition)}
        {...rest}
      >
        {children}
      </div>
    ),
    ol: ({
      children,
      initial,
      animate,
      transition,
      ...rest
    }: {
      children?: ReactNode;
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
    } & Record<string, unknown>) => (
      <ol
        data-initial={JSON.stringify(initial)}
        data-animate={JSON.stringify(animate)}
        data-transition={JSON.stringify(transition)}
        {...rest}
      >
        {children}
      </ol>
    ),
  },
  useReducedMotion: vi.fn(),
}));

import { useReducedMotion } from "motion/react";

import Reveal from "@/components/motion/Reveal";

const mockUseReducedMotion = vi.mocked(useReducedMotion);

describe("Reveal", () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
  });

  it("renders children", () => {
    render(
      <Reveal>
        <p>conteúdo</p>
      </Reveal>,
    );

    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });

  it("aplica a className passada no wrapper", () => {
    render(
      <Reveal className="max-w-sm">
        <p>conteúdo</p>
      </Reveal>,
    );

    expect(screen.getByText("conteúdo").parentElement).toHaveClass("max-w-sm");
  });

  it.each(["up", "down", "left", "right", "none"] as const)(
    "renderiza normalmente com direction=%s sem lançar erro",
    (direction) => {
      expect(() =>
        render(
          <Reveal direction={direction}>
            <p>conteúdo</p>
          </Reveal>,
        ),
      ).not.toThrow();
    },
  );

  it("renderiza a tag pedida via as (ol), não div", () => {
    const { container } = render(
      <Reveal as="ol">
        <li>item</li>
      </Reveal>,
    );

    expect(container.querySelector("ol")).toBeInTheDocument();
    expect(container.querySelector("div")).not.toBeInTheDocument();
  });

  it("aplica o deslocamento direcional quando o SO não pede movimento reduzido", () => {
    const { container } = render(
      <Reveal direction="up">
        <p>conteúdo</p>
      </Reveal>,
    );

    const initial: unknown = JSON.parse(
      container.firstElementChild?.getAttribute("data-initial") ?? "{}",
    );
    const transition = JSON.parse(
      container.firstElementChild?.getAttribute("data-transition") ?? "{}",
    ) as { duration: number };

    expect(initial).toEqual({ opacity: 0, y: 12 });
    expect(transition.duration).toBe(0.4);
  });

  it("zera o deslocamento e a duração quando o SO pede movimento reduzido", () => {
    mockUseReducedMotion.mockReturnValue(true);

    const { container } = render(
      <Reveal direction="up" duration={0.4}>
        <p>conteúdo</p>
      </Reveal>,
    );

    const initial: unknown = JSON.parse(
      container.firstElementChild?.getAttribute("data-initial") ?? "{}",
    );
    const transition = JSON.parse(
      container.firstElementChild?.getAttribute("data-transition") ?? "{}",
    ) as { duration: number };

    expect(initial).toEqual({ opacity: 0 });
    expect(transition.duration).toBe(0);
  });
});
