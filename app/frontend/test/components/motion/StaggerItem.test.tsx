import { type ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
    li: ({
      children,
      variants,
      ...rest
    }: { children?: ReactNode; variants?: unknown } & Record<
      string,
      unknown
    >) => (
      <li data-variants={JSON.stringify(variants)} {...rest}>
        {children}
      </li>
    ),
  },
  useReducedMotion: vi.fn(),
}));

import { useReducedMotion } from "motion/react";

import StaggerItem from "@/components/motion/StaggerItem";

const mockUseReducedMotion = vi.mocked(useReducedMotion);

describe("StaggerItem", () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
  });

  it("renderiza os filhos", () => {
    render(
      <StaggerItem>
        <p>conteúdo</p>
      </StaggerItem>,
    );

    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });

  it("renderiza a tag pedida via as (li), não div", () => {
    const { container } = render(<StaggerItem as="li">item</StaggerItem>);

    expect(container.querySelector("li")).toBeInTheDocument();
    expect(container.querySelector("div")).not.toBeInTheDocument();
  });

  it("aplica o deslocamento vertical quando o SO não pede movimento reduzido", () => {
    const { container } = render(
      <StaggerItem>
        <p>conteúdo</p>
      </StaggerItem>,
    );

    const variants = JSON.parse(
      container.firstElementChild?.getAttribute("data-variants") ?? "{}",
    ) as { hidden: { y: number }; show: { transition: { duration: number } } };

    expect(variants.hidden.y).toBe(12);
    expect(variants.show.transition.duration).toBe(0.3);
  });

  it("zera o deslocamento e a duração quando o SO pede movimento reduzido", () => {
    mockUseReducedMotion.mockReturnValue(true);

    const { container } = render(
      <StaggerItem>
        <p>conteúdo</p>
      </StaggerItem>,
    );

    const variants = JSON.parse(
      container.firstElementChild?.getAttribute("data-variants") ?? "{}",
    ) as { hidden: { y: number }; show: { transition: { duration: number } } };

    expect(variants.hidden.y).toBe(0);
    expect(variants.show.transition.duration).toBe(0);
  });
});
