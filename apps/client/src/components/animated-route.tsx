import { motion, type MotionProps, type Variants } from "motion/react";
import { type ReactNode } from "react";

interface AnimatedRouteProps extends MotionProps {
  children: ReactNode;
  variant?: "fade" | "slide" | "scale" | "slideUp";
  className?: string;
}

const routeVariants: Record<string, Variants> = {
  fade: {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
  },
  slide: {
    initial: { x: 50, opacity: 0 },
    in: { x: 0, opacity: 1 },
    out: { x: -50, opacity: 0 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 1.05 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  },
};

export function AnimatedRoute({
  children,
  variant = "fade",
  className,
  ...motionProps
}: AnimatedRouteProps) {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="in"
      exit="out"
      variants={routeVariants[variant]}
      transition={{ type: "tween", ease: "anticipate", duration: 0.3 }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
