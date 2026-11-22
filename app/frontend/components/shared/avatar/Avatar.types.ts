import { type VariantProps } from "tailwind-variants";

import { type avatarRoot } from "./Avatar.variants";

export type AvatarProps = VariantProps<typeof avatarRoot> & {
  // Nome ou e-mail da pessoa: gera as iniciais do fallback e o texto
  // alternativo da imagem.
  name: string;
  src?: string | null;
  className?: string;
};
