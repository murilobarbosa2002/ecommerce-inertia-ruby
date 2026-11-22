import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Skeleton from "@/components/shared/skeleton/Skeleton";

describe("Skeleton", () => {
  it("é decorativo: escondido da árvore de acessibilidade", () => {
    const { container } = render(<Skeleton />);

    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("pulsa, mas respeita prefers-reduced-motion", () => {
    const { container } = render(<Skeleton />);

    expect(container.firstChild).toHaveClass(
      "animate-pulse",
      "motion-reduce:animate-none",
    );
  });

  it("shape=circle fica redondo", () => {
    const { container } = render(<Skeleton shape="circle" />);

    expect(container.firstChild).toHaveClass("rounded-full");
  });

  it("aplica a className passada (tamanho vem de quem usa)", () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);

    expect(container.firstChild).toHaveClass("h-4", "w-32");
  });
});
