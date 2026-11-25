import { type ReactNode } from "react";

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // ReactNode, não só string — o título costuma vir do mesmo render() de
  // uma coluna da DataTable, que pode compor mais que texto puro.
  title: ReactNode;
  children: ReactNode;
}
