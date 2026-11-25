export interface DataTableSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  // Sobrescreve o wrapper padrão (margem + largura máxima) — ex. a tela de
  // auditoria usa isso lado a lado com o botão de filtros, sem margem
  // própria e crescendo pra preencher o espaço (flex-1), em vez do padrão
  // isolado (mb-4 max-w-sm) das telas de Admins/Papéis.
  className?: string;
}
