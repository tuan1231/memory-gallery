"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";

export default function InteractiveCat() {
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const distance = Math.min(4, Math.hypot(e.clientX - centerX, e.clientY - centerY) / 30);
      
      setPupilPos({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="w-24 h-24 md:w-32 md:h-32 relative flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        {/* Left Ear */}
        <path d="M15 35 L5 5 L40 20 Z" fill="var(--foreground)" />
        {/* Right Ear */}
        <path d="M85 35 L95 5 L60 20 Z" fill="var(--foreground)" />
        
        {/* Cat Head */}
        <path d="M20 40 Q50 10 80 40 L90 80 Q50 105 10 80 Z" fill="var(--foreground)" />
        
        {/* Eyes (Whites) */}
        <circle cx="35" cy="55" r="10" fill="var(--background)" />
        <circle cx="65" cy="55" r="10" fill="var(--background)" />
        
        {/* Pupils */}
        <motion.circle 
          cx="35" cy="55" r="5" fill="var(--foreground)"
          animate={{ x: pupilPos.x, y: pupilPos.y }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        />
        <motion.circle 
          cx="65" cy="55" r="5" fill="var(--foreground)"
          animate={{ x: pupilPos.x, y: pupilPos.y }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        />
        
        {/* Nose & Mouth */}
        <path d="M47 68 L50 72 L53 68 Z" fill="var(--accent)" />
        <path d="M50 72 Q45 78 40 72" fill="none" stroke="var(--background)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M50 72 Q55 78 60 72" fill="none" stroke="var(--background)" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Whiskers Left */}
        <path d="M25 65 L5 60 M25 70 L5 70 M25 75 L5 80" fill="none" stroke="var(--background)" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
        {/* Whiskers Right */}
        <path d="M75 65 L95 60 M75 70 L95 70 M75 75 L95 80" fill="none" stroke="var(--background)" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      </svg>
    </div>
  );
}
