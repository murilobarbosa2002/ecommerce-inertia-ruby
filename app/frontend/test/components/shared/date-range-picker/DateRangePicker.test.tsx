import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import DateRangePicker from "@/components/shared/date-range-picker/DateRangePicker";

function clickFirstDay(container: HTMLElement) {
  const button = container.querySelector<HTMLButtonElement>(
    "td[data-day] button",
  );
  if (!button) throw new Error("nenhum dia encontrado no calendário");
  button.click();
}

describe("DateRangePicker", () => {
  it("renderiza o calendário com os campos de hora", () => {
    render(
      <DateRangePicker
        from=""
        to=""
        fromTime=""
        toTime=""
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Hora de")).toBeInTheDocument();
    expect(screen.getByLabelText("Hora até")).toBeInTheDocument();
  });

  it("chama onChange com a data escolhida ao clicar num dia", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DateRangePicker
        from=""
        to=""
        fromTime=""
        toTime=""
        onChange={onChange}
      />,
    );

    clickFirstDay(container);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ fromTime: "", toTime: "" }),
    );
    const [call] = onChange.mock.calls as [{ from: string; to: string }][];
    expect(call[0].from).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("chama onChange ao escolher hora e minuto no seletor customizado, mantendo as datas já escolhidas", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <DateRangePicker
        from="2026-11-01"
        to="2026-11-05"
        fromTime=""
        toTime=""
        onChange={onChange}
      />,
    );

    await user.click(screen.getByLabelText("Hora de"));
    await user.click(screen.getByRole("button", { name: "08" }));

    // Simula o round-trip real (controlado pelo pai): a hora só fica
    // completa quando o componente recebe de volta o fromTime já com a
    // hora escolhida, antes de clicar no minuto.
    rerender(
      <DateRangePicker
        from="2026-11-01"
        to="2026-11-05"
        fromTime="08:00"
        toTime=""
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: "30" }));

    expect(onChange).toHaveBeenLastCalledWith({
      from: "2026-11-01",
      to: "2026-11-05",
      fromTime: "08:30",
      toTime: "",
    });
  });
});
