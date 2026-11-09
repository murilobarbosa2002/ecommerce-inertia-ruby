import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ChevronDownIcon from "@/components/shared/icons/chevron-down-icon/ChevronDownIcon";

describe("ChevronDownIcon", () => {
  it("renderiza um svg decorativo, sem lançar erro", () => {
    const { container } = render(<ChevronDownIcon />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });
});
