import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ActivityFeed from "@/components/admin/activity-feed/ActivityFeed";
import {
  type ActivityData,
  type ActivityEvent,
} from "@/components/admin/activity-feed/ActivityFeed.types";

const { routerReloadMock } = vi.hoisted(() => ({
  routerReloadMock: vi.fn(),
}));

vi.mock("@inertiajs/react", () => ({ router: { reload: routerReloadMock } }));

function event(overrides: Partial<ActivityEvent>): ActivityEvent {
  return {
    id: 1,
    event_type: "login_succeeded",
    happened_at: "2026-11-22T10:00:00Z",
    admin_email: "admin@example.com",
    performed_by_admin_email: "admin@example.com",
    metadata: {},
    ...overrides,
  };
}

function activity(overrides: Partial<ActivityData> = {}): ActivityData {
  return {
    events: [event({})],
    page: 1,
    per_page: 10,
    total_count: 1,
    total_pages: 1,
    ...overrides,
  };
}

describe("ActivityFeed", () => {
  it("mostra o estado vazio quando não há eventos", () => {
    render(
      <ActivityFeed activity={activity({ events: [], total_count: 0 })} />,
    );

    expect(screen.getByText("Nenhum evento recente")).toBeInTheDocument();
  });

  it("descreve login_succeeded com o e-mail de quem logou", () => {
    render(
      <ActivityFeed
        activity={activity({
          events: [event({ event_type: "login_succeeded" })],
        })}
      />,
    );

    expect(screen.getByText("admin@example.com fez login")).toBeInTheDocument();
  });

  it("descreve login_failed usando o e-mail da conta quando existe", () => {
    render(
      <ActivityFeed
        activity={activity({
          events: [
            event({
              event_type: "login_failed",
              admin_email: "vitima@example.com",
            }),
          ],
        })}
      />,
    );

    expect(
      screen.getByText("Tentativa de login falhou para vitima@example.com"),
    ).toBeInTheDocument();
  });

  it("descreve login_failed usando o e-mail do metadata quando a conta não existe", () => {
    render(
      <ActivityFeed
        activity={activity({
          events: [
            event({
              event_type: "login_failed",
              admin_email: null,
              metadata: { email_address: "inexistente@example.com" },
            }),
          ],
        })}
      />,
    );

    expect(
      screen.getByText(
        "Tentativa de login falhou para inexistente@example.com",
      ),
    ).toBeInTheDocument();
  });

  it("descreve two_factor_reset_by_admin distinguindo quem agiu de quem foi afetado", () => {
    render(
      <ActivityFeed
        activity={activity({
          events: [
            event({
              event_type: "two_factor_reset_by_admin",
              admin_email: "alvo@example.com",
              performed_by_admin_email: "owner@example.com",
            }),
          ],
        })}
      />,
    );

    expect(
      screen.getByText("owner@example.com resetou o 2FA de alvo@example.com"),
    ).toBeInTheDocument();
  });

  it("descreve store_settings_updated só com quem agiu (não tem admin alvo)", () => {
    render(
      <ActivityFeed
        activity={activity({
          events: [
            event({
              event_type: "store_settings_updated",
              admin_email: null,
              performed_by_admin_email: "owner@example.com",
            }),
          ],
        })}
      />,
    );

    expect(
      screen.getByText("owner@example.com alterou as configurações da loja"),
    ).toBeInTheDocument();
  });

  it("mostra a data/hora de cada evento", () => {
    const { container } = render(<ActivityFeed activity={activity()} />);

    expect(container.querySelector("time")).toHaveAttribute(
      "datetime",
      "2026-11-22T10:00:00Z",
    );
  });

  async function openFilters(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: "Filtros" }));
  }

  // O calendário renderiza dentro de um Portal do Radix Popover, fora do
  // container local de render() — precisa buscar no document inteiro.
  // fireEvent (não .click() cru) garante que o act() flusha o estado
  // antes do próximo passo do teste rodar.
  function clickFirstCalendarDay() {
    const button = document.querySelector<HTMLButtonElement>(
      "td[data-day] button",
    );
    if (!button) throw new Error("nenhum dia encontrado no calendário");
    fireEvent.click(button);
  }

  async function openTypeFilter(user: ReturnType<typeof userEvent.setup>) {
    await openFilters(user);
    await user.click(
      screen.getByRole("button", { name: "Tipo de evento: Todos os tipos" }),
    );
  }

  it('mostra "Todos os tipos" no gatilho quando nenhum filtro foi aplicado', async () => {
    const user = userEvent.setup();
    render(<ActivityFeed activity={activity()} />);

    await openFilters(user);

    expect(
      screen.getByRole("button", { name: "Tipo de evento: Todos os tipos" }),
    ).toBeInTheDocument();
  });

  it("abre a lista com checkbox de cada tipo ao clicar no gatilho", async () => {
    const user = userEvent.setup();
    render(<ActivityFeed activity={activity()} />);

    await openTypeFilter(user);

    expect(
      screen.getByRole("checkbox", { name: "Conta bloqueada" }),
    ).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "Conta desbloqueada" }),
    ).toBeChecked();
  });

  it("busca filtra a lista exibida no combobox de tipo", async () => {
    const user = userEvent.setup();
    render(<ActivityFeed activity={activity()} />);

    await openTypeFilter(user);
    await user.type(
      screen.getByPlaceholderText("Buscar tipo..."),
      "desbloqueada",
    );

    expect(
      screen.getByRole("checkbox", { name: "Conta desbloqueada" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", { name: "Conta bloqueada" }),
    ).not.toBeInTheDocument();
  });

  it("recarrega só a prop activity ao desmarcar um tipo de evento, voltando pra página 1", async () => {
    const user = userEvent.setup();
    render(<ActivityFeed activity={activity({ page: 2 })} />);

    await openTypeFilter(user);
    await user.click(screen.getByRole("checkbox", { name: "Conta bloqueada" }));

    expect(routerReloadMock).toHaveBeenCalledWith(
      expect.objectContaining({
        only: ["activity"],
        data: expect.objectContaining({
          activity_page: 1,
          activity_event_types: expect.not.arrayContaining([
            "account_locked",
          ]) as string[],
        }) as Record<string, unknown>,
      }),
    );
  });

  it("mostra o número de filtros ativos no gatilho Filtros", async () => {
    const user = userEvent.setup();
    render(<ActivityFeed activity={activity()} />);

    const trigger = screen.getByRole("button", { name: /Filtros/ });
    expect(within(trigger).queryByText("1")).not.toBeInTheDocument();

    await openTypeFilter(user);
    await user.click(screen.getByRole("checkbox", { name: "Conta bloqueada" }));

    expect(within(trigger).getByText("1")).toBeInTheDocument();
  });

  it("recarrega com a data escolhida no calendário", async () => {
    const user = userEvent.setup();
    render(<ActivityFeed activity={activity()} />);

    await openFilters(user);
    clickFirstCalendarDay();

    const [call] = routerReloadMock.mock.calls[
      routerReloadMock.mock.calls.length - 1
    ] as [{ data: { activity_from: string } }];
    expect(call.data.activity_from).toMatch(/^\d{4}-\d{2}-\d{2}T00:00$/);
  });

  it("recarrega usando a hora escolhida em vez do padrão, quando a data já foi escolhida", async () => {
    const user = userEvent.setup();
    render(<ActivityFeed activity={activity()} />);

    await openFilters(user);
    clickFirstCalendarDay();
    await user.click(screen.getByLabelText("Hora de"));
    await user.click(screen.getByRole("button", { name: "08" }));
    await user.click(screen.getByRole("button", { name: "30" }));

    const [call] = routerReloadMock.mock.calls[
      routerReloadMock.mock.calls.length - 1
    ] as [{ data: { activity_from: string } }];
    expect(call.data.activity_from).toMatch(/^\d{4}-\d{2}-\d{2}T08:30$/);
  });

  it("limpar filtros restaura todos os tipos e limpa as datas", async () => {
    const user = userEvent.setup();
    render(<ActivityFeed activity={activity()} />);

    await openTypeFilter(user);
    await user.click(screen.getByRole("checkbox", { name: "Conta bloqueada" }));
    clickFirstCalendarDay();
    await user.click(screen.getByRole("button", { name: "Limpar filtros" }));

    expect(
      screen.getByRole("button", { name: "Tipo de evento: Todos os tipos" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Hora de")).toHaveValue("");
  });

  it("navega de página recarregando com activity_page", async () => {
    const user = userEvent.setup();
    render(<ActivityFeed activity={activity({ page: 1, total_pages: 2 })} />);

    await user.click(screen.getByRole("button", { name: "Próxima" }));

    expect(routerReloadMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ activity_page: 2 }) as Record<
          string,
          unknown
        >,
      }),
    );
  });
});
