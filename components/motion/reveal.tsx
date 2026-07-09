"use client";

import { motion } from "framer-motion";
import { fadeUp, premiumTransition } from "@/lib/motion/presets";

export function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeUp}
      transition={{ ...premiumTransition, delay }}
    >
      {children}
    </motion.div>
  );
}
