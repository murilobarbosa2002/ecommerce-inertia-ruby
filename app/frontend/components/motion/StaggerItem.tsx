import { motion, useReducedMotion } from "motion/react";
import { type ReactNode } from "react";

type StaggerItemElement = "div" | "li" | "tr";

const DISTANCE = 12;

// Filho de StaggerGroup — cada item precisa das próprias `variants`
// ("hidden"/"show") pra herdar o estágio do pai via Framer Motion
// (propagação de variant por nome, não por valor), nunca a animação
// completa escrita de novo em cada lugar que usa. Props explícitas (não
// HTMLMotionProps), mesmo racional do StaggerGroup.
export default function StaggerItem({
  as = "div",
  duration = 0.3,
  className,
  children,
}: {
  as?: StaggerItemElement;
  duration?: number;
  className?: string;
  children?: ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();
  const Component = motion[as];
  const offset = shouldReduceMotion ? 0 : DISTANCE;

  return (
    <Component
      className={className}
      variants={{
        hidden: { opacity: 0, y: offset },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: shouldReduceMotion ? 0 : duration,
            ease: [0.16, 1, 0.3, 1],
          },
        },
      }}
    >
      {children}
    </Component>
  );
}
