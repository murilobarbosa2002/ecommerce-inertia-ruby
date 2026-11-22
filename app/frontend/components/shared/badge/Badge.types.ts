import { type HTMLAttributes } from "react";
import { type VariantProps } from "tailwind-variants";

import { type badge } from "./Badge.variants";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badge>;
