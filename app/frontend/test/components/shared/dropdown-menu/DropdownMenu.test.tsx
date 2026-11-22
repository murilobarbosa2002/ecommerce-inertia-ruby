import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import DropdownMenu from "@/components/shared/dropdown-menu/DropdownMenu";
import DropdownMenuContent from "@/components/shared/dropdown-menu/dropdown-menu-content/DropdownMenuContent";
import DropdownMenuItem from "@/components/shared/dropdown-menu/dropdown-menu-item/DropdownMenuItem";
import DropdownMenuLabel from "@/components/shared/dropdown-menu/dropdown-menu-label/DropdownMenuLabel";
import DropdownMenuSeparator from "@/components/shared/dropdown-menu/dropdown-menu-separator/DropdownMenuSeparator";
import DropdownMenuTrigger from "@/components/shared/dropdown-menu/dropdown-menu-trigger/DropdownMenuTrigger";

function renderMenu(onSelect = vi.fn()) {
  render(
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button type="button">Abrir</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSelect}>Editar</DropdownMenuItem>
        <DropdownMenuItem tone="danger">Excluir</DropdownMenuItem>
        <DropdownMenuItem disabled>Bloqueado</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  return onSelect;
}

describe("DropdownMenu", () => {
  it("começa fechado", () => {
    renderMenu();

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("abre ao clicar no gatilho, que é o próprio botão passado", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole("button", { name: "Abrir" }));

    expect(await screen.findByRole("menu")).toBeInTheDocument();
    // hidden: o Radix esconde o resto da página (aria-hidden) com o menu aberto.
    expect(screen.getAllByRole("button", { hidden: true })).toHaveLength(1);
  });

  it("abre pelo teclado (Enter no gatilho)", async () => {
    const user = userEvent.setup();
    renderMenu();

    screen.getByRole("button", { name: "Abrir" }).focus();
    await user.keyboard("{Enter}");

    expect(await screen.findByRole("menu")).toBeInTheDocument();
  });

  it("chama onSelect e fecha ao escolher um item", async () => {
    const user = userEvent.setup();
    const onSelect = renderMenu();
    await user.click(screen.getByRole("button", { name: "Abrir" }));

    await user.click(await screen.findByRole("menuitem", { name: "Editar" }));

    expect(onSelect).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("item desabilitado não dispara onSelect", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Abrir" }));

    const disabled = await screen.findByRole("menuitem", { name: "Bloqueado" });

    expect(disabled).toHaveAttribute("aria-disabled", "true");
  });

  it("tone=danger usa a cor de perigo; o padrão não", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Abrir" }));

    expect(
      await screen.findByRole("menuitem", { name: "Excluir" }),
    ).toHaveClass("text-danger-text");
    expect(screen.getByRole("menuitem", { name: "Editar" })).toHaveClass(
      "text-fg",
    );
  });

  it("navega entre itens com as setas", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Abrir" }));
    await screen.findByRole("menu");

    await user.keyboard("{ArrowDown}");

    expect(screen.getByRole("menuitem", { name: "Editar" })).toHaveFocus();
  });

  it("renderiza rótulo e separador", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Abrir" }));

    expect(await screen.findByText("Conta")).toBeInTheDocument();
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("aplica a className passada ao conteúdo", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button type="button">Abrir</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="uppercase">
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole("button", { name: "Abrir" }));

    expect(await screen.findByRole("menu")).toHaveClass("uppercase");
  });
});
