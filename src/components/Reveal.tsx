import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

/* Scroll reveal, timed after recognize.com: a short rise and fade with a
   soft ease-out, played once as the block comes into view. Below-the-fold
   content only — the hero stays still. With reduced motion it only fades. */
const EASE = [0.25, 0.46, 0.45, 0.94] as const;

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Seconds. Small items ~0.5, whole containers ~0.9. */
  duration?: number;
  as?: 'div' | 'li' | 'article';
};

export default function Reveal({ children, className, delay = 0, duration = 0.6, as = 'div' }: Props) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(28px)' }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, transform: 'translateY(0px)' }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: reduce ? 0.3 : duration, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}
