import { type ReactNode } from "react";

export interface BannerProps {
  tone: "notice" | "alert";
  children: ReactNode;
}
