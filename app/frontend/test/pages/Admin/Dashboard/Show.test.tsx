import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DashboardShow from "@/pages/Admin/Dashboard/Show";

vi.mock("@inertiajs/react", () => ({
  Head: () => null,
  router: { delete: vi.fn() },
}));

describe("Admin/Dashboard/Show", () => {
  it("renderiza o título do painel", () => {
    render(<DashboardShow />);

    expect(screen.getByRole("heading", { name: "Painel" })).toBeInTheDocument();
  });
});
