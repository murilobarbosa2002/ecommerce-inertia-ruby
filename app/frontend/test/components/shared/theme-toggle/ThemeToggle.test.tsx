import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import ThemeToggle from "@/components/shared/theme-toggle/ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  afterEach(() => {
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  it("começa oferecendo ativar o tema escuro quando o tema atual é claro", () => {
    render(<ThemeToggle />);

    expect(
      screen.getByRole("button", { name: "Ativar tema escuro" }),
    ).toBeInTheDocument();
  });

  it("alterna o tema e o rótulo ao ser clicado", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(
      screen.getByRole("button", { name: "Ativar tema escuro" }),
    );

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(
      screen.getByRole("button", { name: "Ativar tema claro" }),
    ).toBeInTheDocument();
  });
});
