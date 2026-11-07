import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SunIcon from "@/components/shared/sun-icon/SunIcon";

describe("SunIcon", () => {
  it("renderiza um svg decorativo, sem lançar erro", () => {
    const { container } = render(<SunIcon />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });
});
