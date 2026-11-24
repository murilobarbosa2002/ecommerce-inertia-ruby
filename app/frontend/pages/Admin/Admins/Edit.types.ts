import { type RoleOption } from "./types";

export interface AdminToEdit {
  id: number;
  email_address: string;
  first_name: string;
  last_name: string;
  // null: celular é opcional (docs/adr/0010, criptografado em repouso).
  phone: string | null;
  role_id: number;
}

// Props completas da página — reusadas também por components/AdminsEditForm
// e components/ResetTwoFactorButton, que recebem exatamente o mesmo formato
// (docs/adr/0025).
export interface AdminsEditProps {
  admin: AdminToEdit;
  roles: RoleOption[];
}

export interface ResetTwoFactorButtonProps {
  adminId: number;
}
