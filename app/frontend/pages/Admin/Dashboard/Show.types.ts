import { type ActivityData } from "@/components/admin/activity-feed/ActivityFeed.types";

export interface DashboardStats {
  total_admins: number;
  admins_without_two_factor: number;
  locked_admins: number;
}

export interface DashboardShowProps {
  stats: DashboardStats;
  // null (não um objeto vazio) quando o admin logado não tem a permissão
  // view_audit_log — distingue "sem permissão" de "tem permissão, mas nada
  // pra mostrar".
  activity: ActivityData | null;
  quick_action_keys: string[];
}
