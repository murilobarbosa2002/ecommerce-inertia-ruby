import { Loader2 } from "lucide-react";

import { type ButtonProps } from "./Button.types";
import { button } from "./Button.variants";

export default function Button({
  className,
  intent,
  size,
  fullWidth,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={button({ intent, size, fullWidth, className })}
      disabled={disabled === true || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <Loader2
          className="size-4 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
