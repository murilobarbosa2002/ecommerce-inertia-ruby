import { motion, useReducedMotion } from "motion/react";
import { type ReactNode } from "react";

// Restrito às tags realmente usadas — mesmo racional de RevealElement em
// Reveal.tsx (motion[tag] só existe pra elementos HTML nativos conhecidos;
// props explícitas, não HTMLMotionProps<"div"> espalhado, porque o tipo de
// evento nativo muda conforme `as` — div/ul/ol não compartilham o mesmo
// shape de propriedades DOM).
type StaggerElement = "div" | "ul" | "ol" | "tbody";

// Pai de StaggerItem: qualquer lista de itens (códigos de recuperação,
// linhas de tabela, cards de um grid) entra em cascata só envolvendo os
// itens aqui dentro, sem reimplementar a animação em cada lugar novo.
// staggerDelay é o intervalo entre cada item — vira 0 com
// prefers-reduced-motion, fazendo todos aparecerem juntos.
export default function StaggerGroup({
  as = "div",
  staggerDelay = 0.06,
  className,
  children,
}: {
  as?: StaggerElement;
  staggerDelay?: number;
  className?: string;
  children: ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      initial="hidden"
      animate="show"
      className={className}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
          },
        },
      }}
    >
      {children}
    </Component>
  );
}
