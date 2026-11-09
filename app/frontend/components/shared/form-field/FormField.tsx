import FieldError from "@/components/shared/field-error/FieldError";
import Input from "@/components/shared/input/Input";
import Label from "@/components/shared/label/Label";

import { type FormFieldProps } from "./FormField.types";

// Sem FormField.variants.ts — o componente só compõe Label/Input/FieldError
// (cada um já com a própria variante tv()), nenhuma estilização própria
// (docs/adr/0026).
export default function FormField({
  id,
  label,
  error,
  register,
  ...inputProps
}: FormFieldProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} invalid={!!error} {...inputProps} {...register} />
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}
