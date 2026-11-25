import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

export type SlideFadeDirection = "up" | "down" | "left" | "right";

const DISTANCE = 24;

const directionOffset: Record<SlideFadeDirection, { x?: number; y?: number }> =
  {
    up: { y: DISTANCE },
    down: { y: -DISTANCE },
    left: { x: DISTANCE },
    right: { x: -DISTANCE },
  };

// Irmão do ScaleFade (fade+escala) — aqui é fade+deslocamento, pro caso de
// painel ancorado numa borda da tela (ex. o Drawer de detalhe no mobile,
// que entra de baixo pra cima). Mesmo racional de reduced motion e de
// renderizar um motion.div de verdade (Radix asChild+forceMount precisa
// clonar as próprias props no elemento real).
export default function SlideFade({
  direction = "up",
  duration = 0.2,
  ref,
  ...props
}: HTMLMotionProps<"div"> & {
  direction?: SlideFadeDirection;
  duration?: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const offset = shouldReduceMotion ? {} : directionOffset[direction];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...offset }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...offset }}
      transition={{
        duration: shouldReduceMotion ? 0 : duration,
        ease: [0.16, 1, 0.3, 1],
      }}
      {...props}
    />
  );
}
