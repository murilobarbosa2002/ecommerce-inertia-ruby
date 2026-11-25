import {
  motion,
  useReducedMotion,
  type TargetAndTransition,
} from "motion/react";

export interface GradientBlobProps {
  className?: string;
  movement: TargetAndTransition;
  duration?: number;
}

// Mancha de gradiente decorativa, em loop infinito — irmão de
// Reveal/ScaleFade/SlideFade: parametrizável (posição/tamanho/cor via
// className, trajetória via movement, velocidade via duration), não um
// efeito escrito direto onde é usado. Com prefers-reduced-motion, fica
// parada na posição inicial.
export default function GradientBlob({
  className,
  movement,
  duration = 20,
}: GradientBlobProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`rounded-full blur-3xl ${className ?? ""}`}
      animate={shouldReduceMotion ? undefined : movement}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
