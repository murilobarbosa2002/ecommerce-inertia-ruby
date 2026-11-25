import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

import FieldError from "@/components/shared/field-error/FieldError";
import Input from "@/components/shared/input/Input";
import Label from "@/components/shared/label/Label";

import { type FormFieldProps } from "./FormField.types";

// Sem FormField.variants.ts — o componente só compõe Label/Input/FieldError
// (cada um já com a própria variante tv()), nenhuma estilização própria
// (docs/adr/0026). O botão de mostrar/ocultar senha é a única exceção
// (posicionamento absoluto dentro do campo), só ativo quando type="password".
export default function FormField({
  id,
  label,
  error,
  register,
  type,
  ...inputProps
}: FormFieldProps) {
  const { t } = useTranslation();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={isPassword && passwordVisible ? "text" : type}
          invalid={!!error}
          className={isPassword ? "pr-10" : undefined}
          {...inputProps}
          {...register}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => {
              setPasswordVisible((visible) => !visible);
            }}
            aria-label={
              passwordVisible
                ? t("shared.formField.hidePassword")
                : t("shared.formField.showPassword")
            }
            className="absolute inset-y-0 right-0 flex items-center px-3 text-fg-subtle hover:text-fg"
          >
            {passwordVisible ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}
