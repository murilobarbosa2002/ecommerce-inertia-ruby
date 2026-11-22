import { type HTMLAttributes } from "react";
import { type VariantProps } from "tailwind-variants";

import { type skeleton } from "./Skeleton.variants";

export type SkeletonProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof skeleton>;
