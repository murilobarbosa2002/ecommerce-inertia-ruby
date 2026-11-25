import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("motion/react", () => ({
  motion: {
    div: ({
      animate,
      ...rest
    }: { animate?: unknown } & Record<string, unknown>) => (
      <div data-animate={JSON.stringify(animate)} {...rest} />
    ),
  },
  useReducedMotion: vi.fn(),
}));

import { render } from "@testing-library/react";
import { useReducedMotion } from "motion/react";

import GradientBlob from "@/components/motion/GradientBlob";

const mockUseReducedMotion = vi.mocked(useReducedMotion);

const movement = { x: [0, 10], y: [0, 10], scale: [1, 1.1] };

describe("GradientBlob", () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
  });

  it("anima a trajetória recebida quando o SO não pede movimento reduzido", () => {
    const { container } = render(
      <GradientBlob className="bg-accent/25" movement={movement} />,
    );

    const animate = JSON.parse(
      container.firstElementChild?.getAttribute("data-animate") ?? "null",
    ) as unknown;
    expect(animate).toEqual(movement);
  });

  it("fica parado quando o SO pede movimento reduzido", () => {
    mockUseReducedMotion.mockReturnValue(true);

    const { container } = render(
      <GradientBlob className="bg-accent/25" movement={movement} />,
    );

    const animate = container.firstElementChild?.getAttribute("data-animate");
    expect(animate).toBeNull();
  });

  it("aplica a className passada junto da classe base de blob", () => {
    const { container } = render(
      <GradientBlob className="bg-accent/25" movement={movement} />,
    );

    expect(container.firstElementChild).toHaveClass("bg-accent/25");
    expect(container.firstElementChild).toHaveClass("rounded-full");
  });
});
