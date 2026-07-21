"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

export default function MasonryItem({ story }) {
  const [isHovered, setIsHovered] = useState(false);
  const date = new Date(story.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hasImage = Boolean(story.imageUrl);

  return (
    <Link href={`/story/${story.id}`} className="block mb-6 break-inside-avoid perspective-[1000px]">
      <motion.div
        className="relative overflow-hidden rounded-2xl group cursor-pointer bg-card-bg border border-border flex flex-col justify-end"
        style={{ minHeight: hasImage ? "auto" : "250px" }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        animate={isHovered ? { rotateX: 5, rotateY: -5, scale: 1.02, z: 20 } : { rotateX: 0, rotateY: 0, scale: 1, z: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {hasImage ? (
          <>
            <img
              src={story.imageUrl}
              alt={story.title}
              className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
            
            {/* Content for image card */}
            <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
              <h3 className="text-white text-xl font-bold tracking-tight mb-1 leading-tight">{story.title}</h3>
              <p className="text-white/80 text-sm font-medium">{date}</p>
            </div>
          </>
        ) : (
          <div className="p-8 flex flex-col justify-between h-full bg-card-bg group-hover:bg-accent/5 transition-colors duration-500">
            <div>
              <p className="text-accent text-sm font-bold tracking-widest uppercase mb-4">{date}</p>
              <h3 className="text-foreground text-2xl font-bold tracking-tight mb-4 leading-tight">{story.title}</h3>
              <p className="text-foreground/70 line-clamp-4">{story.content}</p>
            </div>
          </div>
        )}
      </motion.div>
    </Link>
  );
}
