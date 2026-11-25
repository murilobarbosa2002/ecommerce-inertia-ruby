import { type ReactNode } from "react";

export interface ToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tone: "notice" | "alert";
  children: ReactNode;
}
