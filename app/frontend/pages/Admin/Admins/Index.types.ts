export interface AdminRow {
  id: number;
  email_address: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role_id: number;
  role_name: string;
}

export interface AdminsIndexProps {
  admins: {
    records: AdminRow[];
    page: number;
    total_pages: number;
    total_count: number;
  };
}
