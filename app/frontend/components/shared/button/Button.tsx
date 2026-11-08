import { type ButtonProps } from "./Button.types";
import { button } from "./Button.variants";

export default function Button({ className, intent, ...props }: ButtonProps) {
  return <button className={button({ intent, className })} {...props} />;
}
