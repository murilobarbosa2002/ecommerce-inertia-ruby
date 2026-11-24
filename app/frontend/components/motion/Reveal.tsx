import { motion, useReducedMotion } from "motion/react";
import { type ReactNode } from "react";

export type RevealDirection = "up" | "down" | "left" | "right" | "none";
// Restrito às tags realmente usadas — motion[tag] só existe pra elementos
// HTML nativos conhecidos do próprio Motion, diferente de motion.create()
// (que aceita qualquer componente, mas recriaria um tipo de componente
// novo a cada render se chamado aqui dentro).
type RevealElement = "div" | "ol";

const DISTANCE = 12;

const directionOffset: Record<RevealDirection, { x?: number; y?: number }> = {
  up: { y: DISTANCE },
  down: { y: -DISTANCE },
  left: { x: DISTANCE },
  right: { x: -DISTANCE },
  none: {},
};

export default function Reveal({
  as = "div",
  children,
  direction = "up",
  duration = 0.4,
  delay = 0,
  className,
}: {
  as?: RevealElement;
  children: ReactNode;
  direction?: RevealDirection;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const offset = shouldReduceMotion ? {} : directionOffset[direction];
  const Component = motion[as];

  return (
    <Component
      initial={{ opacity: 0, ...offset }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </Component>
  );
}
