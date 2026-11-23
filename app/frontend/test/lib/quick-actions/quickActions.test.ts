import { Home } from "lucide-react";
import { describe, expect, it } from "vitest";

import filterQuickActions from "@/lib/quick-actions/filterQuickActions";
import { type QuickAction } from "@/lib/quick-actions/quickActions.types";

const actions: QuickAction[] = [
  {
    key: "new_admin",
    labelKey: "admin.dashboard.show.quickActions.newAdmin",
    icon: Home,
    href: () => "/admin/admins/new",
    permission: "manage_admins",
  },
  {
    key: "new_role",
    labelKey: "admin.dashboard.show.quickActions.newRole",
    icon: Home,
    href: () => "/admin/roles/new",
    permission: "manage_roles",
  },
];

describe("filterQuickActions", () => {
  it("remove toda ação com permissão exigida quando o admin não tem nenhuma", () => {
    expect(filterQuickActions(actions, [])).toEqual([]);
  });

  it("mantém só a ação cuja permissão o admin tem", () => {
    const result = filterQuickActions(actions, ["manage_admins"]);

    expect(result.map((action) => action.key)).toEqual(["new_admin"]);
  });

  it("não altera a lista original", () => {
    filterQuickActions(actions, []);

    expect(actions).toHaveLength(2);
  });
});
