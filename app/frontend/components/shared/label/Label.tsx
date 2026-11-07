import { type LabelProps } from "./Label.types";
import { label } from "./Label.variants";

export default function Label({ htmlFor, className, ...props }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className={label({ className })} {...props} />
  );
}
