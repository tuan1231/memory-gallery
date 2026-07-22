"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState, useRef } from "react";

export default function MasonryItem({ story }) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const cardRef = useRef(null);

  const date = new Date(story.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hasImage = Boolean(story.image_url);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation up to 10 degrees based on distance from center
    const rotateXValue = ((y - centerY) / centerY) * -10;
    const rotateYValue = ((x - centerX) / centerX) * 10;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <Link href={`/story/${story.id}`} className="masonry-card block mb-4 md:mb-6 break-inside-avoid opacity-0 translate-y-8 perspective-[1200px]">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX, rotateY, scale: rotateX !== 0 || rotateY !== 0 ? 1.02 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.5 }}
        className="relative overflow-hidden group cursor-pointer bg-card-bg flex flex-col justify-end shadow-sm hover:shadow-xl transition-shadow duration-500 rounded-2xl"
        style={{ minHeight: hasImage ? "auto" : "250px", transformStyle: "preserve-3d" }}
      >
        {hasImage ? (
          <>
            <img
              src={story.image_url}
              alt={story.title}
              className="w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
              loading="lazy"
            />
            {/* Scrim for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out pointer-events-none" />
            
            <div 
              className="absolute bottom-0 left-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out pointer-events-none"
              style={{ transform: "translateZ(40px)" }} // 3D pop effect for text
            >
              <h3 className="text-white text-2xl font-bold tracking-tight mb-1 leading-tight drop-shadow-md">{story.title}</h3>
              <p className="text-white/90 text-xs tracking-[0.1em] uppercase font-medium">{date}</p>
            </div>
          </>
        ) : (
          <div className="p-8 flex flex-col justify-between h-full bg-card-bg group-hover:bg-foreground/5 transition-colors duration-500 border border-border rounded-2xl">
            <div style={{ transform: "translateZ(25px)" }}>
              <p className="text-accent text-xs font-bold tracking-[0.1em] uppercase mb-4">{date}</p>
              <h3 className="text-foreground text-2xl font-bold tracking-tight mb-4 leading-tight drop-shadow-sm">{story.title}</h3>
              <p className="text-foreground/70 line-clamp-4 leading-relaxed">{story.content}</p>
            </div>
          </div>
        )}
      </motion.div>
    </Link>
  );
}
