import { type ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mesmo racional de Reveal.test.tsx: mocka o motor de animação pra testar
// só a lógica do StaggerGroup (quais variants/stagger ele monta), não o
// comportamento interno do Motion.
vi.mock("motion/react", () => ({
  motion: {
    div: ({
      children,
      variants,
      ...rest
    }: { children?: ReactNode; variants?: unknown } & Record<
      string,
      unknown
    >) => (
      <div data-variants={JSON.stringify(variants)} {...rest}>
        {children}
      </div>
    ),
    ul: ({
      children,
      variants,
      ...rest
    }: { children?: ReactNode; variants?: unknown } & Record<
      string,
      unknown
    >) => (
      <ul data-variants={JSON.stringify(variants)} {...rest}>
        {children}
      </ul>
    ),
  },
  useReducedMotion: vi.fn(),
}));

import { useReducedMotion } from "motion/react";

import StaggerGroup from "@/components/motion/StaggerGroup";

const mockUseReducedMotion = vi.mocked(useReducedMotion);

describe("StaggerGroup", () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
  });

  it("renderiza os filhos", () => {
    render(
      <StaggerGroup>
        <p>conteúdo</p>
      </StaggerGroup>,
    );

    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });

  it("renderiza a tag pedida via as (ul), não div", () => {
    const { container } = render(
      <StaggerGroup as="ul">
        <li>item</li>
      </StaggerGroup>,
    );

    expect(container.querySelector("ul")).toBeInTheDocument();
    expect(container.querySelector("div")).not.toBeInTheDocument();
  });

  it("aplica a className passada no wrapper", () => {
    render(
      <StaggerGroup className="grid grid-cols-2">
        <p>conteúdo</p>
      </StaggerGroup>,
    );

    expect(screen.getByText("conteúdo").parentElement).toHaveClass(
      "grid",
      "grid-cols-2",
    );
  });

  it("usa o staggerDelay pedido quando o SO não pede movimento reduzido", () => {
    const { container } = render(
      <StaggerGroup staggerDelay={0.1}>
        <p>conteúdo</p>
      </StaggerGroup>,
    );

    const variants = JSON.parse(
      container.firstElementChild?.getAttribute("data-variants") ?? "{}",
    ) as { show: { transition: { staggerChildren: number } } };

    expect(variants.show.transition.staggerChildren).toBe(0.1);
  });

  it("zera o staggerDelay quando o SO pede movimento reduzido", () => {
    mockUseReducedMotion.mockReturnValue(true);

    const { container } = render(
      <StaggerGroup staggerDelay={0.1}>
        <p>conteúdo</p>
      </StaggerGroup>,
    );

    const variants = JSON.parse(
      container.firstElementChild?.getAttribute("data-variants") ?? "{}",
    ) as { show: { transition: { staggerChildren: number } } };

    expect(variants.show.transition.staggerChildren).toBe(0);
  });
});
