import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Link from "@/components/shared/link/Link";

describe("Link", () => {
  it("renderiza como link nativo com href e conteúdo", () => {
    render(<Link href="/admin/login">Voltar pro login</Link>);

    const anchor = screen.getByRole("link", { name: "Voltar pro login" });
    expect(anchor).toHaveAttribute("href", "/admin/login");
  });

  it("aplica a className passada junto da variante", () => {
    render(
      <Link href="/admin/login" className="max-w-sm">
        Voltar pro login
      </Link>,
    );

    expect(screen.getByRole("link")).toHaveClass("max-w-sm");
  });

  it("não é selecionável (ação de navegação, não conteúdo)", () => {
    render(<Link href="/admin/login">Voltar pro login</Link>);

    expect(screen.getByRole("link")).toHaveClass("select-none");
  });
});
