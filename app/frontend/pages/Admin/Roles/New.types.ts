import { type PermissionOption } from "./types";

// Reusada também por components/RolesNewForm, que recebe exatamente o mesmo
// formato (docs/adr/0025).
export interface RolesNewProps {
  permissions: PermissionOption[];
}
