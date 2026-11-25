export interface FileDropzoneProps {
  id: string;
  value: File | null;
  onChange: (file: File | null) => void;
  // Tipos MIME aceitos (ex. "image/png") — usado no accept do input nativo
  // e na validação client-side, nunca só decoração visual.
  accept: string[];
  maxSize: number;
  // Preview do arquivo já salvo (ex. logo atual), mostrado só quando não
  // há um File novo selecionado — a troca pra preview do File novo via
  // URL.createObjectURL acontece dentro do próprio componente.
  previewUrl?: string | null;
  previewAlt: string;
  instructions: string;
  removeLabel: string;
  invalidTypeError: string;
  tooLargeError: string;
}
