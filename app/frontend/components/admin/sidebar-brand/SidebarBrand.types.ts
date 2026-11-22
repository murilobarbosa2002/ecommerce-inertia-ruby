export interface SidebarBrandProps {
  name: string;
  logoUrl: string | null;
  // Recolhida mostra só a marca (logo ou ícone), sem o nome.
  collapsed?: boolean;
  // Linha divisória embaixo (some quando quem usa já desenha a sua, ex. o
  // drawer mobile, onde a marca divide a barra com o botão de fechar).
  bordered?: boolean;
}
