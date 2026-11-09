import { type PermissionOption } from "./types";

export interface RoleToEdit {
  id: number;
  name: string;
  permission_ids: number[];
}

// Props completas da página — reusadas também por components/RolesEditForm,
// que recebe exatamente o mesmo formato (docs/adr/0025).
export interface RolesEditProps {
  role: RoleToEdit;
  permissions: PermissionOption[];
}
