import { type CardBodyProps } from "./CardBody.types";
import { cardBody } from "./CardBody.variants";

export default function CardBody({ className, ...props }: CardBodyProps) {
  return <div className={cardBody({ className })} {...props} />;
}
