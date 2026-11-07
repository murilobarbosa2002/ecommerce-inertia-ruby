import { type FieldErrorProps } from "./FieldError.types";
import { fieldError } from "./FieldError.variants";

export default function FieldError({ children }: FieldErrorProps) {
  return <p className={fieldError()}>{children}</p>;
}
