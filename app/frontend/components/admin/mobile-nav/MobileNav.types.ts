import { type NavSection } from "@/lib/navigation/navigation.types";

export interface MobileNavProps {
  sections: NavSection[];
  activeItemKey: string | null;
  brandName: string;
  logoUrl: string | null;
}
