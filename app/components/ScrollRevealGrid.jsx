"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ScrollRevealGrid({ children, className }) {
  const gridRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".masonry-card");
      
      cards.forEach((card) => {
        gsap.to(card, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top bottom-=50",
            toggleActions: "play none none none"
          }
        });
      });
    }, gridRef);

    return () => ctx.revert();
  }, [children]);

  return (
    <div ref={gridRef} className={className}>
      {children}
    </div>
  );
}
