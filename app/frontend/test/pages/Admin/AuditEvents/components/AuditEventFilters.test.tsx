import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AUDIT_EVENT_TYPES } from "@/lib/audit-events/auditEventTypes";
import AuditEventFilters from "@/pages/Admin/AuditEvents/components/AuditEventFilters";

const actors = [
  { id: 1, email_address: "ana@example.com" },
  { id: 2, email_address: "bruno@example.com" },
];

async function openFilters(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Filtros" }));
}

describe("AuditEventFilters", () => {
  it("mostra todos os 17 tipos marcados por padrão", async () => {
    const user = userEvent.setup();
    render(<AuditEventFilters actors={actors} reload={vi.fn()} />);

    await openFilters(user);

    expect(
      screen.getByRole("button", { name: `Tipo de evento: Todos os tipos` }),
    ).toBeInTheDocument();
  });

  it("mostra 'Todos os usuários' por padrão e lista os admins como opções, com busca", async () => {
    const user = userEvent.setup();
    render(<AuditEventFilters actors={actors} reload={vi.fn()} />);

    await openFilters(user);

    expect(
      screen.getByRole("button", { name: "Usuário: Todos os usuários" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Usuário: Todos os usuários" }),
    );

    expect(
      screen.getByPlaceholderText("Buscar usuário..."),
    ).toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(screen.getByText("bruno@example.com")).toBeInTheDocument();
  });

  it("escolher múltiplos usuários recarrega com audit_events_actor_ids e volta pra página 1", async () => {
    const user = userEvent.setup();
    const reload = vi.fn();
    render(<AuditEventFilters actors={actors} reload={reload} />);

    await openFilters(user);
    await user.click(
      screen.getByRole("button", { name: "Usuário: Todos os usuários" }),
    );
    await user.click(screen.getByText("ana@example.com"));
    await user.click(screen.getByText("bruno@example.com"));

    expect(reload).toHaveBeenLastCalledWith({
      page: 1,
      extra: expect.objectContaining({
        audit_events_actor_ids: "1,2",
        audit_events_event_types: [...AUDIT_EVENT_TYPES].join(","),
      }) as Record<string, unknown>,
    });
  });

  it("mostra o número de filtros ativos no gatilho depois de escolher um usuário", async () => {
    const user = userEvent.setup();
    render(<AuditEventFilters actors={actors} reload={vi.fn()} />);

    await openFilters(user);
    await user.click(
      screen.getByRole("button", { name: "Usuário: Todos os usuários" }),
    );
    await user.click(screen.getByText("ana@example.com"));

    const trigger = screen.getByRole("button", { name: /Filtros/ });
    expect(within(trigger).getByText("1")).toBeInTheDocument();
  });

  it("limpar filtros volta o usuário pro padrão", async () => {
    const user = userEvent.setup();
    const reload = vi.fn();
    render(<AuditEventFilters actors={actors} reload={reload} />);

    await openFilters(user);
    await user.click(
      screen.getByRole("button", { name: "Usuário: Todos os usuários" }),
    );
    await user.click(screen.getByText("ana@example.com"));
    await user.click(screen.getByRole("button", { name: "Limpar filtros" }));

    expect(reload).toHaveBeenLastCalledWith({
      page: 1,
      extra: expect.objectContaining({
        audit_events_actor_ids: "",
      }) as Record<string, unknown>,
    });
  });
});
