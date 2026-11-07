import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import MoonIcon from "@/components/shared/moon-icon/MoonIcon";

describe("MoonIcon", () => {
  it("renderiza um svg decorativo, sem lançar erro", () => {
    const { container } = render(<MoonIcon />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });
});
