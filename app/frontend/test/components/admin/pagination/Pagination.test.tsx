import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Pagination from "@/components/admin/pagination/Pagination";

describe("Pagination", () => {
  it("não renderiza nada com só uma página", () => {
    const { container } = render(
      <Pagination
        page={1}
        totalPages={1}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("mostra a página atual e o total", () => {
    render(
      <Pagination
        page={2}
        totalPages={5}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    expect(screen.getByText("Página 2 de 5")).toBeInTheDocument();
  });

  it("desabilita Anterior na primeira página", () => {
    render(
      <Pagination
        page={1}
        totalPages={3}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Próxima" })).toBeEnabled();
  });

  it("desabilita Próxima na última página", () => {
    render(
      <Pagination
        page={3}
        totalPages={3}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Próxima" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeEnabled();
  });

  it("chama onPrevious/onNext ao clicar", async () => {
    const user = userEvent.setup();
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    render(
      <Pagination
        page={2}
        totalPages={3}
        onPrevious={onPrevious}
        onNext={onNext}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Anterior" }));
    await user.click(screen.getByRole("button", { name: "Próxima" }));

    expect(onPrevious).toHaveBeenCalledOnce();
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("desabilita os dois botões quando disabled, mesmo no meio da paginação", () => {
    render(
      <Pagination
        page={2}
        totalPages={3}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        disabled
      />,
    );

    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Próxima" })).toBeDisabled();
  });
});
