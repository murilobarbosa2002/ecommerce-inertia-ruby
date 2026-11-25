import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shared/tabs/Tabs";

function renderTabs(defaultValue = "tab1") {
  return render(
    <Tabs defaultValue={defaultValue}>
      <TabsList>
        <TabsTrigger value="tab1">Aba 1</TabsTrigger>
        <TabsTrigger value="tab2">Aba 2</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Conteúdo 1</TabsContent>
      <TabsContent value="tab2">Conteúdo 2</TabsContent>
    </Tabs>,
  );
}

describe("Tabs", () => {
  it("mostra o conteúdo da aba inicial", () => {
    renderTabs();

    expect(screen.getByText("Conteúdo 1")).toBeInTheDocument();
    expect(screen.queryByText("Conteúdo 2")).not.toBeInTheDocument();
  });

  it("troca o conteúdo ao clicar em outra aba", async () => {
    const user = userEvent.setup();
    renderTabs();

    await user.click(screen.getByRole("tab", { name: "Aba 2" }));

    expect(screen.getByText("Conteúdo 2")).toBeInTheDocument();
    expect(screen.queryByText("Conteúdo 1")).not.toBeInTheDocument();
  });

  it("marca a aba ativa com aria-selected", async () => {
    const user = userEvent.setup();
    renderTabs();

    expect(screen.getByRole("tab", { name: "Aba 1" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await user.click(screen.getByRole("tab", { name: "Aba 2" }));

    expect(screen.getByRole("tab", { name: "Aba 2" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "Aba 1" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });
});
