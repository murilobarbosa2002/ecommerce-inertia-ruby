import { type SkeletonProps } from "./Skeleton.types";
import { skeleton } from "./Skeleton.variants";

// Só decorativo: quem renderiza o skeleton é quem sabe anunciar o estado de
// carregamento (ex. aria-busy no contêiner), então o bloco em si não aparece
// pra leitor de tela.
export default function Skeleton({
  className,
  shape,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={skeleton({ shape, className })}
      {...props}
    />
  );
}
