import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

// Primitivo de animação de abrir/fechar (Popover/Dialog) — fade sempre,
// escala opcional (scale={1} desliga, pro caso do overlay do Dialog, que
// só precisa ser um fade). Precisa renderizar um motion.div de verdade
// (não um wrapper que esconde isso): Radix usa asChild + forceMount nesses
// dois componentes, clonando suas próprias props (style/data-state/etc.)
// direto no elemento que a gente passa — ...props no fim repassa isso tudo.
export default function ScaleFade({
  scale = 0.95,
  duration = 0.15,
  ref,
  ...props
}: HTMLMotionProps<"div"> & {
  scale?: number;
  duration?: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const fromScale = shouldReduceMotion ? 1 : scale;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: fromScale }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: fromScale }}
      transition={{
        duration: shouldReduceMotion ? 0 : duration,
        ease: [0.16, 1, 0.3, 1],
      }}
      {...props}
    />
  );
}
