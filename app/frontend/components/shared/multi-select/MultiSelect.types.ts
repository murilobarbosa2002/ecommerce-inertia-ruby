export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  id?: string;
  // Texto visível acima do gatilho — nunca um <label for> de verdade
  // (o gatilho é um botão): isso sobrescreveria o nome acessível dele
  // pelo texto do label em vez de complementá-lo. Entra combinado no
  // aria-label do gatilho em vez disso.
  label: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  searchPlaceholder: string;
  // Texto do gatilho fechado decidido por quem chama — mantém o
  // componente sem opinião sobre idioma/plural.
  summary: (selectedOptions: MultiSelectOption[]) => string;
}
