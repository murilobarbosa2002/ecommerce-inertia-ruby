import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ConfirmDialog from "@/components/shared/confirm-dialog/ConfirmDialog";

function renderConfirmDialog(
  overrides: Partial<Parameters<typeof ConfirmDialog>[0]> = {},
) {
  const props = {
    open: true,
    onOpenChange: vi.fn(),
    title: "Título",
    description: "Descrição",
    confirmLabel: "Confirmar",
    cancelLabel: "Cancelar",
    onConfirm: vi.fn(),
    ...overrides,
  };

  return { ...render(<ConfirmDialog {...props} />), props };
}

describe("ConfirmDialog", () => {
  it("não renderiza nada quando não está open", () => {
    renderConfirmDialog({ open: false });

    expect(screen.queryByText("Título")).not.toBeInTheDocument();
  });

  it("mostra título, descrição e as duas ações quando open", () => {
    renderConfirmDialog();

    expect(screen.getByRole("alertdialog")).toHaveAccessibleDescription(
      "Descrição",
    );
    expect(screen.getByText("Título")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirmar" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cancelar" }),
    ).toBeInTheDocument();
  });

  it("chama onConfirm ao confirmar", async () => {
    const user = userEvent.setup();
    const { props } = renderConfirmDialog();

    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(props.onConfirm).toHaveBeenCalled();
  });

  it("não chama onConfirm ao cancelar, só onOpenChange(false)", async () => {
    const user = userEvent.setup();
    const { props } = renderConfirmDialog();

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(props.onConfirm).not.toHaveBeenCalled();
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });
});
