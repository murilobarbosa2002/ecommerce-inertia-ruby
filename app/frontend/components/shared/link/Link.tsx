import { type LinkProps } from "./Link.types";
import { link } from "./Link.variants";

export default function Link({ className, children, ...props }: LinkProps) {
  return (
    <a className={link({ className })} {...props}>
      {children}
    </a>
  );
}
