import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import AuditEventsIndex from "@/pages/Admin/AuditEvents/Index";

const { routerReloadMock } = vi.hoisted(() => ({
  routerReloadMock: vi.fn(),
}));

vi.mock("@inertiajs/react", () => ({
  Head: () => null,
  Link: "a",
  router: { reload: routerReloadMock },
  usePage: () => ({
    props: {
      current_admin_permissions: ["view_audit_log"],
      current_admin_two_factor_enabled: true,
    },
    component: "test",
  }),
}));

function desktopTable() {
  return screen.getByRole("table");
}

describe("Admin/AuditEvents/Index", () => {
  const auditEvents = {
    records: [
      {
        id: 1,
        event_type: "login_succeeded",
        happened_at: "2026-11-24T10:00:00Z",
        admin_email: "ana@example.com",
        performed_by_admin_email: "ana@example.com",
        metadata: {},
      },
      {
        id: 2,
        event_type: "store_settings_updated",
        happened_at: "2026-11-24T11:00:00Z",
        admin_email: null,
        performed_by_admin_email: "owner@example.com",
        performed_by_admin_role_name: "Proprietário",
        metadata: {},
      },
      {
        id: 3,
        event_type: "login_failed",
        happened_at: "2026-11-24T12:00:00Z",
        admin_email: null,
        performed_by_admin_email: null,
        ip_address: "::1",
        metadata: { email_address: "desconhecido@example.com" },
      },
    ],
    page: 1,
    total_pages: 1,
    total_count: 3,
  };

  const actors = [{ id: 1, email_address: "ana@example.com" }];

  it("lista os eventos com tipo, descrição, ator e quando aconteceu", () => {
    render(<AuditEventsIndex audit_events={auditEvents} actors={actors} />);

    const table = within(desktopTable());
    expect(table.getByText("Login bem-sucedido")).toBeInTheDocument();
    expect(table.getByText("ana@example.com fez login")).toBeInTheDocument();
    expect(
      table.getByText("owner@example.com alterou as configurações da loja"),
    ).toBeInTheDocument();
  });

  it("mostra quantos eventos existem no total na descrição", () => {
    render(<AuditEventsIndex audit_events={auditEvents} actors={actors} />);

    expect(screen.getByText("3 eventos no total")).toBeInTheDocument();
  });

  it("trunca a descrição numa linha só, mostrando o texto completo num tooltip ao passar o mouse", async () => {
    const user = userEvent.setup();
    render(<AuditEventsIndex audit_events={auditEvents} actors={actors} />);

    const description = within(desktopTable()).getByText(
      "ana@example.com fez login",
    );
    expect(description).toHaveClass("truncate");

    await user.hover(description);

    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "ana@example.com fez login",
    );
  });

  it("mostra o papel do usuário abaixo do e-mail, e o IP (como 'localhost') quando não há usuário identificado", () => {
    render(<AuditEventsIndex audit_events={auditEvents} actors={actors} />);

    const table = within(desktopTable());
    expect(table.getByText("owner@example.com")).toBeInTheDocument();
    expect(table.getByText("Proprietário")).toBeInTheDocument();
    expect(table.getByText("localhost")).toBeInTheDocument();
  });

  it("busca dispara um reload com a prop audit_events e o termo digitado", async () => {
    const user = userEvent.setup();
    render(<AuditEventsIndex audit_events={auditEvents} actors={actors} />);

    await user.type(screen.getByPlaceholderText("Buscar por e-mail..."), "ana");

    expect(routerReloadMock).toHaveBeenCalledWith(
      expect.objectContaining({
        only: ["audit_events"],
        data: expect.objectContaining({
          audit_events_search: "ana",
        }) as Record<string, unknown>,
      }),
    );
  });

  it("clicar no cabeçalho 'Quando' ordena por happened_at", async () => {
    const user = userEvent.setup();
    render(<AuditEventsIndex audit_events={auditEvents} actors={actors} />);

    await user.click(
      within(desktopTable()).getByRole("button", { name: "Quando" }),
    );

    expect(routerReloadMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          audit_events_sort: "happened_at",
        }) as Record<string, unknown>,
      }),
    );
  });

  it("mostra o EmptyState quando não há eventos", () => {
    render(
      <AuditEventsIndex
        audit_events={{ ...auditEvents, records: [], total_count: 0 }}
        actors={actors}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Nenhum evento encontrado" }),
    ).toBeInTheDocument();
  });
});
