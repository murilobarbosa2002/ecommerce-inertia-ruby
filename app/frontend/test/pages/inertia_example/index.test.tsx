import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import InertiaExample from "@/pages/inertia_example/index";

// `Head` só funciona dentro do contexto criado por `createInertiaApp` (ver
// app/frontend/entrypoints/inertia.tsx) — em teste de unidade, fora desse
// contexto, mockamos pra não depender da árvore de componentes inteira do Inertia.
vi.mock("@inertiajs/react", () => ({
  Head: () => null,
}));

describe("InertiaExample", () => {
  it("renders the version info passed as props", () => {
    render(
      <InertiaExample
        rails_version="8.1.4"
        ruby_version="4.0.9"
        rack_version="3.2.2"
        inertia_rails_version="3.23.0"
      />,
    );

    expect(screen.getByText("8.1.4")).toBeInTheDocument();
    expect(screen.getByText("4.0.9")).toBeInTheDocument();
  });
});
