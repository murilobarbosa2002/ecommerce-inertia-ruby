import { Avatar as RadixAvatar } from "radix-ui";

import getInitials from "@/lib/getInitials";

import { type AvatarProps } from "./Avatar.types";
import { avatarRoot } from "./Avatar.variants";

// O contêiner é a imagem acessível (role="img" + nome), então a foto e as
// iniciais viram conteúdo decorativo dentro dele — o leitor de tela anuncia
// o nome uma vez só, haja ou não foto carregada.
export default function Avatar({ name, src, size, className }: AvatarProps) {
  return (
    <RadixAvatar.Root
      role="img"
      aria-label={name}
      className={avatarRoot({ size, className })}
    >
      {src && (
        <RadixAvatar.Image
          src={src}
          alt=""
          className="size-full object-cover"
        />
      )}
      <RadixAvatar.Fallback delayMs={src ? 300 : undefined}>
        {getInitials(name)}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}
