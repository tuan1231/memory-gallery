"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import Link from "next/link";
import { useRef, useEffect } from "react";
import { PlayCircle } from "@phosphor-icons/react";

export default function MasonryItem({ story }) {
  const cardRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
        }
      });
    }, { threshold: 0.1 });
    
    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  // Motion values for smooth 120fps performance without React re-renders
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  // Apply spring physics for that buttery smooth "premium" feel
  const springConfig = { stiffness: 300, damping: 30, mass: 0.5 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);
  const scaleSpring = useSpring(scale, springConfig);

  // Map normalized coordinates (-0.5 to 0.5) to rotation degrees (-10 to 10)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-10, 10]);

  const date = new Date(story.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hasImage = Boolean(story.image_url);
  const isVideo = hasImage && story.image_url.match(/\.(mp4|webm|mov|ogg)(\?.*)?$/i);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
    scale.set(1.02);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    scale.set(1);
  };

  return (
    <Link href={`/story/${story.id}`} className="masonry-card block mb-4 md:mb-6 break-inside-avoid opacity-0 translate-y-8">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full perspective-[1500px]"
      >
        <motion.div
          style={{ 
            rotateX, 
            rotateY, 
            scale: scaleSpring, 
            minHeight: hasImage ? "auto" : "250px", 
            transformStyle: "preserve-3d" 
          }}
          whileTap={{ scale: 0.96 }}
          className="relative overflow-hidden group cursor-pointer bg-card-bg flex flex-col justify-end shadow-sm hover:shadow-2xl transition-shadow duration-500 rounded-2xl w-full h-full"
        >
          {hasImage ? (
            <>
              {isVideo ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    src={story.image_url}
                    className="w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                    loop
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <div className="absolute top-4 right-4 text-white/90 z-20 drop-shadow-lg">
                    <PlayCircle size={28} weight="fill" />
                  </div>
                </div>
              ) : (
                <img
                  src={story.image_url}
                  alt={story.title}
                  className="w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  loading="lazy"
                />
              )}
              {/* Scrim for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 ease-out pointer-events-none" />
              
              <div 
                className="absolute bottom-0 left-0 right-0 p-6 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-500 ease-out pointer-events-none flex justify-between items-end gap-4"
                style={{ transform: "translateZ(40px)" }} // 3D pop effect for text
              >
                <div>
                  <h3 className="text-white text-2xl font-bold tracking-tight mb-1 leading-tight drop-shadow-md">{story.title}</h3>
                  <p className="text-white/90 text-xs tracking-[0.1em] uppercase font-medium">{date}</p>
                </div>
                {story.authorProfile && (
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/50 shadow-lg shrink-0" title={story.authorProfile.display_name || story.authorProfile.username}>
                    {story.authorProfile.avatar_url ? (
                      <img src={story.authorProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-black/40 flex items-center justify-center font-bold text-xs text-white">
                        {(story.authorProfile.display_name || story.authorProfile.username || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-8 flex flex-col justify-between h-full bg-card-bg group-hover:bg-foreground/5 transition-colors duration-500 border border-border rounded-2xl">
              <div style={{ transform: "translateZ(30px)" }}>
                <div className="flex justify-between items-start mb-4">
                  <p className="text-accent text-xs font-bold tracking-[0.1em] uppercase">{date}</p>
                  {story.authorProfile && (
                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-border/50" title={story.authorProfile.display_name || story.authorProfile.username}>
                      {story.authorProfile.avatar_url ? (
                        <img src={story.authorProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-foreground/10 flex items-center justify-center font-bold text-[10px] text-foreground/50">
                          {(story.authorProfile.display_name || story.authorProfile.username || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <h3 className="text-foreground text-2xl font-bold tracking-tight mb-4 leading-tight drop-shadow-sm">{story.title}</h3>
                <p className="text-foreground/70 line-clamp-4 leading-relaxed">{story.content}</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </Link>
  );
}
