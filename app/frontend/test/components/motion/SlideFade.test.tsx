import { type ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mesmo motivo do mock em ScaleFade.test.tsx: testa só a lógica do
// SlideFade, não o motor de animação do Motion em si.
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

import SlideFade from "@/components/motion/SlideFade";

const mockUseReducedMotion = vi.mocked(useReducedMotion);

describe("SlideFade", () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
  });

  it("renders children", () => {
    render(
      <SlideFade>
        <p>conteúdo</p>
      </SlideFade>,
    );

    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });

  it("aplica a className passada", () => {
    render(
      <SlideFade className="w-80">
        <p>conteúdo</p>
      </SlideFade>,
    );

    expect(screen.getByText("conteúdo").parentElement).toHaveClass("w-80");
  });

  it("repassa props arbitrárias pro elemento (ex. as injetadas pelo Radix asChild)", () => {
    render(
      <SlideFade data-state="open" role="dialog">
        <p>conteúdo</p>
      </SlideFade>,
    );

    expect(screen.getByRole("dialog")).toHaveAttribute("data-state", "open");
  });

  it("aplica o deslocamento direcional quando o SO não pede movimento reduzido", () => {
    const { container } = render(
      <SlideFade direction="up">
        <p>conteúdo</p>
      </SlideFade>,
    );

    const initial = JSON.parse(
      container.firstElementChild?.getAttribute("data-initial") ?? "{}",
    ) as unknown;
    const transition = JSON.parse(
      container.firstElementChild?.getAttribute("data-transition") ?? "{}",
    ) as { duration: number };

    expect(initial).toEqual({ opacity: 0, y: 24 });
    expect(transition.duration).toBe(0.2);
  });

  it("zera o deslocamento e a duração quando o SO pede movimento reduzido", () => {
    mockUseReducedMotion.mockReturnValue(true);

    const { container } = render(
      <SlideFade direction="up" duration={0.2}>
        <p>conteúdo</p>
      </SlideFade>,
    );

    const initial = JSON.parse(
      container.firstElementChild?.getAttribute("data-initial") ?? "{}",
    ) as unknown;
    const transition = JSON.parse(
      container.firstElementChild?.getAttribute("data-transition") ?? "{}",
    ) as { duration: number };

    expect(initial).toEqual({ opacity: 0 });
    expect(transition.duration).toBe(0);
  });
});
