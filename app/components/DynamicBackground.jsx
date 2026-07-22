"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function DynamicBackground() {
  const bgRef = useRef(null);

  useEffect(() => {
    // Subtle breathing/floating effect on the mesh gradients
    const ctx = gsap.context(() => {
      gsap.to(".mesh-blob-1", {
        x: "random(-50, 50)",
        y: "random(-50, 50)",
        scale: "random(0.9, 1.2)",
        rotation: "random(-10, 10)",
        duration: "random(10, 15)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
      
      gsap.to(".mesh-blob-2", {
        x: "random(-50, 50)",
        y: "random(-50, 50)",
        scale: "random(0.9, 1.2)",
        rotation: "random(-15, 15)",
        duration: "random(12, 18)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }, bgRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={bgRef} className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-background">
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] z-10 mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      ></div>
      
      {/* Animated Gradient Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[100px] opacity-[0.15] mix-blend-multiply dark:mix-blend-screen bg-accent mesh-blob-1"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[120px] opacity-[0.15] mix-blend-multiply dark:mix-blend-screen bg-[#FFB5A7] mesh-blob-2"></div>
    </div>
  );
}
