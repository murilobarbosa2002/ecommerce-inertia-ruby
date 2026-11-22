import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Separator from "@/components/shared/separator/Separator";

describe("Separator", () => {
  it("é decorativo por padrão (sem role de separador)", () => {
    render(<Separator data-testid="sep" />);

    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
    expect(screen.getByTestId("sep")).toHaveClass("h-px", "w-full");
  });

  it("decorative=false expõe role=separator", () => {
    render(<Separator decorative={false} />);

    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("orientation=vertical usa largura de 1px e altura cheia", () => {
    render(<Separator orientation="vertical" data-testid="sep" />);

    expect(screen.getByTestId("sep")).toHaveClass("h-full", "w-px");
  });

  it("aplica a className passada", () => {
    render(<Separator className="my-4" data-testid="sep" />);

    expect(screen.getByTestId("sep")).toHaveClass("my-4");
  });
});
