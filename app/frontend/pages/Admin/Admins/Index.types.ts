export interface AdminRow {
  id: number;
  email_address: string;
  role_id: number;
  role_name: string;
}

export interface AdminsIndexProps {
  admins: AdminRow[];
}
