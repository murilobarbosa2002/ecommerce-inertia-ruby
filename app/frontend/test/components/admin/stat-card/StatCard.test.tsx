import { render, screen } from "@testing-library/react";
import { Users } from "lucide-react";
import { describe, expect, it } from "vitest";

import StatCard from "@/components/admin/stat-card/StatCard";

describe("StatCard", () => {
  it("mostra o valor e o rótulo recebidos", () => {
    render(<StatCard icon={Users} label="Admins" value={7} />);

    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("Admins")).toBeInTheDocument();
  });

  it("mostra o valor zero (não esconde/trata como vazio)", () => {
    render(<StatCard icon={Users} label="Admins" value={0} />);

    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
