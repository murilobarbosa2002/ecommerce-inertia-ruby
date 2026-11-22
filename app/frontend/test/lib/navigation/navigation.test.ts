import { Home } from "lucide-react";
import { describe, expect, it } from "vitest";

import filterNavigation from "@/lib/navigation/filterNavigation";
import findActiveNavItem from "@/lib/navigation/findActiveNavItem";
import { type NavSection } from "@/lib/navigation/navigation.types";

const sections: NavSection[] = [
  {
    key: "general",
    labelKey: "shared.panelLayout.sections.general",
    items: [
      {
        key: "dashboard",
        labelKey: "shared.panelLayout.nav.dashboard",
        icon: Home,
        href: () => "/",
      },
    ],
  },
  {
    key: "administration",
    labelKey: "shared.panelLayout.sections.administration",
    items: [
      {
        key: "admins",
        labelKey: "shared.panelLayout.nav.admins",
        icon: Home,
        href: () => "/admin/admins",
        permission: "manage_admins",
      },
      {
        key: "store",
        labelKey: "shared.panelLayout.nav.storeSettings",
        icon: Home,
        href: () => "/admin/store_setting/edit",
        activePath: () => "/admin/store_setting",
        permission: "manage_store_settings",
      },
    ],
  },
];

describe("filterNavigation", () => {
  it("mantém só os itens sem permissão exigida quando o admin não tem nenhuma", () => {
    const result = filterNavigation(sections, []);

    expect(result.map((section) => section.key)).toEqual(["general"]);
  });

  it("mantém o item cuja permissão o admin tem e remove os outros", () => {
    const result = filterNavigation(sections, ["manage_admins"]);

    const administration = result.find(
      (section) => section.key === "administration",
    );
    expect(administration?.items.map((item) => item.key)).toEqual(["admins"]);
  });

  it("remove a seção que fica sem itens", () => {
    const result = filterNavigation(sections, ["manage_admins"]);

    expect(result).toHaveLength(2);
    expect(filterNavigation(sections, [])).toHaveLength(1);
  });

  it("não altera a lista original", () => {
    filterNavigation(sections, []);

    expect(sections[1].items).toHaveLength(2);
  });
});

describe("findActiveNavItem", () => {
  it("acha o item pela URL exata", () => {
    expect(findActiveNavItem(sections, "/admin/admins")?.item.key).toBe(
      "admins",
    );
  });

  it("acha o item em uma subpágina", () => {
    expect(findActiveNavItem(sections, "/admin/admins/3/edit")?.item.key).toBe(
      "admins",
    );
  });

  it("ignora query string e hash", () => {
    expect(
      findActiveNavItem(sections, "/admin/admins?page=2#topo")?.item.key,
    ).toBe("admins");
  });

  it("usa activePath quando o item o define", () => {
    expect(
      findActiveNavItem(sections, "/admin/store_setting/edit")?.item.key,
    ).toBe("store");
  });

  it("devolve a seção do item junto", () => {
    expect(findActiveNavItem(sections, "/admin/admins")?.section.key).toBe(
      "administration",
    );
  });

  it("a raiz só é ativa na URL exata, não em qualquer página", () => {
    expect(findActiveNavItem(sections, "/")?.item.key).toBe("dashboard");
    expect(findActiveNavItem(sections, "/admin/profile")).toBeNull();
  });

  it("não confunde prefixo de texto com subcaminho (/admin/adminsx)", () => {
    expect(findActiveNavItem(sections, "/admin/adminsx")).toBeNull();
  });

  it("devolve null quando nenhum item corresponde", () => {
    expect(findActiveNavItem(sections, "/outra/pagina")).toBeNull();
    expect(findActiveNavItem(sections, "")).toBeNull();
  });

  it("vence o caminho mais específico quando mais de um casa", () => {
    const nested: NavSection[] = [
      {
        key: "s",
        labelKey: "shared.panelLayout.sections.general",
        items: [
          {
            key: "parent",
            labelKey: "shared.panelLayout.nav.admins",
            icon: Home,
            href: () => "/admin",
          },
          {
            key: "child",
            labelKey: "shared.panelLayout.nav.roles",
            icon: Home,
            href: () => "/admin/roles",
          },
        ],
      },
    ];

    expect(findActiveNavItem(nested, "/admin/roles/1")?.item.key).toBe("child");
    expect(findActiveNavItem(nested, "/admin/other")?.item.key).toBe("parent");
  });
});
