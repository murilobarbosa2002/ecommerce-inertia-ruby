import { type ButtonHTMLAttributes } from "react";
import { type VariantProps } from "tailwind-variants";

import { type button } from "./Button.variants";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>;
