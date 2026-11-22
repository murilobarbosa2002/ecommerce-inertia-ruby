import { type CardFooterProps } from "./CardFooter.types";
import { cardFooter } from "./CardFooter.variants";

export default function CardFooter({ className, ...props }: CardFooterProps) {
  return <div className={cardFooter({ className })} {...props} />;
}
