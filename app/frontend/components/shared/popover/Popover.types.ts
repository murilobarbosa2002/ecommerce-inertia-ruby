import { type ReactNode } from "react";

export interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "center" | "end";
  // Opt-in: no mobile, vira um Drawer (bottom sheet, mesmo componente do
  // detalhe de linha da DataTable — X de fechar, arrastar pra baixo fecha),
  // em vez do popover ancorado no gatilho — pensado pros painéis de filtro
  // (ex. Auditoria/Atividade recente), grandes demais pra um popover
  // ancorado fazer sentido numa tela estreita. Não afeta o Popover genérico
  // usado por Select/MultiSelect (que continua sempre ancorado). Exige
  // `title` (o Drawer sempre mostra um título).
  drawerOnMobile?: boolean;
  title?: ReactNode;
}
