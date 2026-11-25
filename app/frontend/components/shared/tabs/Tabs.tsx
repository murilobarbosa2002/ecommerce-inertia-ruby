import { type ComponentProps } from "react";
import { Tabs as RadixTabs } from "radix-ui";

import { tabsContent, tabsList, tabsTrigger } from "./Tabs.variants";

// Composto (Root/List/Trigger/Content), não um componente único como
// Dialog/ConfirmDialog: o conteúdo de cada aba é arbitrário e definido por
// quem usa, não algo que o componente possa receber como uma prop só.
export const Tabs = RadixTabs.Root;

export function TabsList(props: ComponentProps<typeof RadixTabs.List>) {
  return <RadixTabs.List className={tabsList()} {...props} />;
}

export function TabsTrigger(props: ComponentProps<typeof RadixTabs.Trigger>) {
  return <RadixTabs.Trigger className={tabsTrigger()} {...props} />;
}

export function TabsContent(props: ComponentProps<typeof RadixTabs.Content>) {
  return <RadixTabs.Content className={tabsContent()} {...props} />;
}
