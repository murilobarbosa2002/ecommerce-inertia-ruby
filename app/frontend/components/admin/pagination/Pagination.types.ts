export interface PaginationProps {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  // Desabilita os dois botões (ex. enquanto uma página carrega) além da
  // desabilitação normal de borda (primeira/última página).
  disabled?: boolean;
}
