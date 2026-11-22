import { Separator as RadixSeparator } from "radix-ui";

import { type SeparatorProps } from "./Separator.types";
import { separator } from "./Separator.variants";

// decorative por padrão: um divisor visual não deve poluir a árvore de
// acessibilidade. Passe decorative={false} quando ele separar seções com
// significado próprio.
export default function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <RadixSeparator.Root
      orientation={orientation}
      decorative={decorative}
      className={separator({ orientation, className })}
      {...props}
    />
  );
}
