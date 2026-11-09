import { type RoleOption } from "./types";

// Reusada também por components/AdminsNewForm, que recebe exatamente o
// mesmo formato (docs/adr/0025).
export interface AdminsNewProps {
  roles: RoleOption[];
}
