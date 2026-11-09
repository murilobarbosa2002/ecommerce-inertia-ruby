import { type InputHTMLAttributes } from "react";
import { type UseFormRegisterReturn } from "react-hook-form";

export type FormFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id"
> & {
  id: string;
  label: string;
  error?: string;
  register: UseFormRegisterReturn;
};
