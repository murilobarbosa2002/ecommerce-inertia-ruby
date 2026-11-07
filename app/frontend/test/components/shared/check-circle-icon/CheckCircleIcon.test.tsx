import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CheckCircleIcon from "@/components/shared/check-circle-icon/CheckCircleIcon";

describe("CheckCircleIcon", () => {
  it("renderiza um svg decorativo, sem lançar erro", () => {
    const { container } = render(<CheckCircleIcon />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });
});
