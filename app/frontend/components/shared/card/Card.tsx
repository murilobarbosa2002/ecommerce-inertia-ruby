import { type CardProps } from "./Card.types";
import { card } from "./Card.variants";

export default function Card({ className, ...props }: CardProps) {
  return <div className={card({ className })} {...props} />;
}
