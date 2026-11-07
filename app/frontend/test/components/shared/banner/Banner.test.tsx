import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Banner from "@/components/shared/banner/Banner";

describe("Banner", () => {
  it("renderiza com role=status e a variante de notice quando tone é notice", () => {
    render(<Banner tone="notice">Tudo certo</Banner>);

    const banner = screen.getByRole("status");
    expect(banner).toHaveTextContent("Tudo certo");
    expect(banner).toHaveClass("bg-green-50");
  });

  it("renderiza com role=alert e a variante de alert quando tone é alert", () => {
    render(<Banner tone="alert">Algo errado</Banner>);

    const banner = screen.getByRole("alert");
    expect(banner).toHaveTextContent("Algo errado");
    expect(banner).toHaveClass("bg-red-50");
  });
});
