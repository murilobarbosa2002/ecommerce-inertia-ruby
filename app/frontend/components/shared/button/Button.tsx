import { type ButtonProps } from "./Button.types";
import { button } from "./Button.variants";

export default function Button({ className, ...props }: ButtonProps) {
  return <button className={button({ className })} {...props} />;
}
