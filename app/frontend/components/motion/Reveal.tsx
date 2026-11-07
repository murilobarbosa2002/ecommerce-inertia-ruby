import { motion } from "motion/react";
import { type ReactNode } from "react";

export type RevealDirection = "up" | "down" | "left" | "right" | "none";

const DISTANCE = 12;

const directionOffset: Record<RevealDirection, { x?: number; y?: number }> = {
  up: { y: DISTANCE },
  down: { y: -DISTANCE },
  left: { x: DISTANCE },
  right: { x: -DISTANCE },
  none: {},
};

export default function Reveal({
  children,
  direction = "up",
  duration = 0.4,
  delay = 0,
  className,
}: {
  children: ReactNode;
  direction?: RevealDirection;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const offset = directionOffset[direction];

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
