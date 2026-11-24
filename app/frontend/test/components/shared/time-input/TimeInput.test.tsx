import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import TimeInput from "@/components/shared/time-input/TimeInput";

describe("TimeInput", () => {
  it("mostra o placeholder quando não há valor", () => {
    render(<TimeInput value="" onChange={vi.fn()} />);

    expect(screen.getByText("--:--")).toBeInTheDocument();
  });

  it("aceita um placeholder customizado", () => {
    render(<TimeInput value="" onChange={vi.fn()} placeholder="Selecionar" />);

    expect(screen.getByText("Selecionar")).toBeInTheDocument();
  });

  it("mostra o valor já escolhido no gatilho", () => {
    render(<TimeInput value="08:30" onChange={vi.fn()} />);

    expect(screen.getByText("08:30")).toBeInTheDocument();
  });

  it("escolher a hora sem minuto prévio usa 00 como padrão", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeInput value="" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "--:--" }));
    await user.click(screen.getByRole("button", { name: "08" }));

    expect(onChange).toHaveBeenCalledWith("08:00");
  });

  it("escolher o minuto sem hora prévia usa 00 como padrão", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeInput value="" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "--:--" }));
    await user.click(screen.getByRole("button", { name: "30" }));

    expect(onChange).toHaveBeenCalledWith("00:30");
  });

  it("escolher a hora com um minuto já selecionado preserva o minuto", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeInput value="00:30" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "00:30" }));
    await user.click(screen.getByRole("button", { name: "08" }));

    expect(onChange).toHaveBeenCalledWith("08:30");
  });
});
