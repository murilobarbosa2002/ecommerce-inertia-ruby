export interface RoleRow {
  id: number;
  name: string;
  permission_ids: number[];
  permission_keys: string[];
}

export interface RolesIndexProps {
  roles: RoleRow[];
}
