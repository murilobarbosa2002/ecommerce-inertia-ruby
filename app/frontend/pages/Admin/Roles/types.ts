// Tipo usado por mais de uma página deste segmento (New e Edit, pra lista de
// checkboxes de permissão) — docs/adr/0025.
export interface PermissionOption {
  id: number;
  key: string;
  description: string;
}
