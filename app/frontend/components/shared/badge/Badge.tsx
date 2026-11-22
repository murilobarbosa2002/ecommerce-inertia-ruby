import { type BadgeProps } from "./Badge.types";
import { badge } from "./Badge.variants";

export default function Badge({ className, tone, size, ...props }: BadgeProps) {
  return <span className={badge({ tone, size, className })} {...props} />;
}
