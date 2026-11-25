import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Toast, { ToastProvider } from "@/components/shared/toast/Toast";
import { type ToastProps } from "@/components/shared/toast/Toast.types";

function renderToast(overrides: Partial<ToastProps> = {}) {
  const props: ToastProps = {
    open: true,
    onOpenChange: vi.fn(),
    tone: "notice",
    children: "Mensagem",
    ...overrides,
  };

  return {
    ...render(<ToastProvider>{<Toast {...props} />}</ToastProvider>),
    props,
  };
}

describe("Toast", () => {
  it("não renderiza nada quando não está open", () => {
    renderToast({ open: false });

    expect(screen.queryByText("Mensagem")).not.toBeInTheDocument();
  });

  it("mostra o conteúdo com role status quando tone é notice", () => {
    renderToast({ tone: "notice" });

    expect(
      screen.getByText("Mensagem").closest('[role="status"]'),
    ).toBeInTheDocument();
  });

  it("mostra o conteúdo com role alert quando tone é alert", () => {
    renderToast({ tone: "alert" });

    expect(
      screen.getByText("Mensagem").closest('[role="alert"]'),
    ).toBeInTheDocument();
  });

  it("fecha ao clicar no botão de fechar", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderToast({ onOpenChange });

    await user.click(screen.getByRole("button", { name: "Fechar" }));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
