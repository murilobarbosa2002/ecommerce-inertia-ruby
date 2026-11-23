export interface TimeInputProps {
  id?: string;
  // "HH:mm" ou "" (nenhum horário escolhido).
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
