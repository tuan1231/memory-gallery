"use client";

import { motion } from "motion/react";

export default function Timeline({ stories }) {
  const sortedStories = [...stories].sort((a, b) => new Date(a.date) - new Date(b.date));

  if (sortedStories.length === 0) return null;

  const startDate = new Date(sortedStories[0].date);
  const now = new Date();
  const diffTime = Math.abs(now - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const text = "We have been making memories together for";
  const words = text.split(" ");

  return (
    <div className="my-12 max-w-2xl mx-auto text-center px-4">
      <div className="flex flex-col items-center gap-4 overflow-hidden">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-8xl font-bold tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-br from-foreground via-accent to-foreground"
        >
          LOVE
        </motion.h2>
        
        <div className="text-foreground/80 text-lg md:text-xl max-w-[50ch] leading-relaxed mt-4 flex flex-wrap justify-center gap-x-1.5">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.05 + 0.2, ease: "easeOut" }}
            >
              {word}
            </motion.span>
          ))}
          <motion.span
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: words.length * 0.05 + 0.2, type: "spring", stiffness: 200 }}
            className="font-bold text-accent mx-1"
          >
            {diffDays} days.
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: words.length * 0.05 + 0.8 }}
            className="w-full mt-2"
          >
            Every picture here is a piece of our story.
          </motion.span>
        </div>
      </div>
    </div>
  );
}
