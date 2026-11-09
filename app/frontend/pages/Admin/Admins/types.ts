// Tipo usado por mais de uma página deste segmento (New e Edit, pro dropdown
// de papel) — docs/adr/0025. Tipo usado só por uma página fica no
// <Página>.types.ts dela, não aqui.
export interface RoleOption {
  id: number;
  name: string;
}
