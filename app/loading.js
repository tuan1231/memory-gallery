"use client";

import { motion } from "motion/react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="flex flex-col items-center gap-4"
      >
        <span className="text-6xl md:text-8xl drop-shadow-lg">💗</span>
        <span className="text-xs font-bold tracking-[0.3em] uppercase text-accent animate-pulse">
          Loading...
        </span>
      </motion.div>
    </div>
  );
}
