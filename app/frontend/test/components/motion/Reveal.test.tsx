import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Reveal from "@/components/motion/Reveal";

describe("Reveal", () => {
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
});
