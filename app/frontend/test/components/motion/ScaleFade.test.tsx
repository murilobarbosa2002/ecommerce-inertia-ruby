import { type ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mesmo motivo do mock em Reveal.test.tsx: testa só a lógica do ScaleFade,
// não o motor de animação do Motion em si.
vi.mock("motion/react", () => ({
  motion: {
    div: ({
      children,
      initial,
      animate,
      exit,
      transition,
      ...rest
    }: {
      children?: ReactNode;
      initial?: unknown;
      animate?: unknown;
      exit?: unknown;
      transition?: unknown;
    } & Record<string, unknown>) => (
      <div
        data-initial={JSON.stringify(initial)}
        data-animate={JSON.stringify(animate)}
        data-exit={JSON.stringify(exit)}
        data-transition={JSON.stringify(transition)}
        {...rest}
      >
        {children}
      </div>
    ),
  },
  useReducedMotion: vi.fn(),
}));

import { useReducedMotion } from "motion/react";

import ScaleFade from "@/components/motion/ScaleFade";

const mockUseReducedMotion = vi.mocked(useReducedMotion);

describe("ScaleFade", () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
  });

  it("renders children", () => {
    render(
      <ScaleFade>
        <p>conteúdo</p>
      </ScaleFade>,
    );

    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });

  it("aplica a className passada", () => {
    render(
      <ScaleFade className="w-80">
        <p>conteúdo</p>
      </ScaleFade>,
    );

    expect(screen.getByText("conteúdo").parentElement).toHaveClass("w-80");
  });

  it("repassa props arbitrárias pro elemento (ex. as injetadas pelo Radix asChild)", () => {
    render(
      <ScaleFade data-state="open" role="dialog">
        <p>conteúdo</p>
      </ScaleFade>,
    );

    expect(screen.getByRole("dialog")).toHaveAttribute("data-state", "open");
  });

  it("renderiza normalmente com scale={1} (variante fade puro, usada no overlay do Dialog)", () => {
    expect(() =>
      render(
        <ScaleFade scale={1}>
          <p>conteúdo</p>
        </ScaleFade>,
      ),
    ).not.toThrow();
  });

  it("aplica a escala inicial quando o SO não pede movimento reduzido", () => {
    const { container } = render(
      <ScaleFade scale={0.9}>
        <p>conteúdo</p>
      </ScaleFade>,
    );

    const initial: unknown = JSON.parse(
      container.firstElementChild?.getAttribute("data-initial") ?? "{}",
    );
    const transition = JSON.parse(
      container.firstElementChild?.getAttribute("data-transition") ?? "{}",
    ) as { duration: number };

    expect(initial).toEqual({ opacity: 0, scale: 0.9 });
    expect(transition.duration).toBe(0.15);
  });

  it("ignora a escala e zera a duração quando o SO pede movimento reduzido", () => {
    mockUseReducedMotion.mockReturnValue(true);

    const { container } = render(
      <ScaleFade scale={0.9} duration={0.15}>
        <p>conteúdo</p>
      </ScaleFade>,
    );

    const initial: unknown = JSON.parse(
      container.firstElementChild?.getAttribute("data-initial") ?? "{}",
    );
    const transition = JSON.parse(
      container.firstElementChild?.getAttribute("data-transition") ?? "{}",
    ) as { duration: number };

    expect(initial).toEqual({ opacity: 0, scale: 1 });
    expect(transition.duration).toBe(0);
  });
});
