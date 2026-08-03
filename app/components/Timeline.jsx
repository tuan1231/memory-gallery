"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { motion } from "motion/react";

export default function Timeline({ stories }) {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [diffDays, setDiffDays] = useState(0);
  
  const sortedStories = [...stories].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  useEffect(() => {
    if (stories.length > 0) {
      const sorted = [...stories].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      const startDate = new Date(sorted[0].created_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - startDate.getTime());
      setDiffDays(Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))));
    }
  }, [stories]);

  if (sortedStories.length === 0) return null;

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      tl.fromTo(".hero-title", 
        { y: 40, opacity: 0, filter: "blur(10px)", rotationX: -20 }, 
        { y: 0, opacity: 1, filter: "blur(0px)", rotationX: 0, duration: 1.2, ease: "power3.out" }
      )
      .fromTo(".hero-word", 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.04, ease: "power2.out" },
        "-=0.6"
      )
      .fromTo(".hero-days",
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.5)" },
        "-=0.4"
      )
      .fromTo(".hero-subtext",
        { opacity: 0 },
        { opacity: 1, duration: 1 },
        "-=0.2"
      );
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  const text = "We have been making memories together for";
  const words = text.split(" ");

  const shadowX = mousePos.x * -20;
  const shadowY = mousePos.y * -20;

  return (
    <div ref={containerRef} className="my-16 md:my-24 max-w-3xl mx-auto text-center px-4 flex flex-col items-center gap-6 perspective-[1000px]">
      <motion.h2 
        animate={{ 
          rotateX: mousePos.y * -20, 
          rotateY: mousePos.x * 20,
          textShadow: `${shadowX}px ${shadowY}px 0px var(--accent), ${shadowX * 1.5}px ${shadowY * 1.5}px 20px rgba(0,0,0,0.15)`
        }}
        transition={{ type: "spring", stiffness: 100, damping: 20, mass: 0.5 }}
        className="hero-title text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter uppercase text-foreground leading-[0.9] cursor-default"
        style={{ transformStyle: "preserve-3d" }}
      >
        LOVE
      </motion.h2>
      
      <div className="text-foreground/80 text-lg md:text-xl lg:text-2xl max-w-[40ch] leading-relaxed flex flex-wrap justify-center gap-x-1.5 mt-2" style={{ transform: "translateZ(30px)" }}>
        {words.map((word, i) => (
          <span key={i} className="hero-word inline-block">
            {word}
          </span>
        ))}
        <span className="hero-days font-bold text-accent mx-1 inline-block drop-shadow-sm">
          {diffDays} days.
        </span>
      </div>
      <p className="hero-subtext text-foreground/50 w-full mt-4 text-xs tracking-[0.2em] uppercase font-medium">
        Every picture here is a piece of our story.
      </p>
    </div>
  );
}
