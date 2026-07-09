import type { Transition } from "framer-motion";

export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1 },
};

export const premiumTransition: Transition = {
  duration: 0.18,
  ease: [0.22, 1, 0.36, 1],
};
