import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ExclamationIcon from "@/components/shared/exclamation-icon/ExclamationIcon";

describe("ExclamationIcon", () => {
  it("renderiza um svg decorativo, sem lançar erro", () => {
    const { container } = render(<ExclamationIcon />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });
});
