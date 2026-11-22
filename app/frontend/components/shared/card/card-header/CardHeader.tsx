import { type CardHeaderProps } from "./CardHeader.types";
import { cardHeader } from "./CardHeader.variants";

export default function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div className={cardHeader({ className })} {...props} />;
}
