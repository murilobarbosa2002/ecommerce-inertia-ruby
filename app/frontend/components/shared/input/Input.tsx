import { type InputProps } from "./Input.types";
import { input } from "./Input.variants";

export default function Input({
  invalid,
  className,
  ref,
  ...props
}: InputProps) {
  return (
    <input ref={ref} className={input({ invalid, className })} {...props} />
  );
}
