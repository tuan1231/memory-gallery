"use client";

import { useState } from 'react';

export default function AvatarDisplay({ src, alt, fallbackLetter, className = "" }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className={`w-full h-full flex items-center justify-center text-foreground/30 font-light ${className}`}>
        <span className="text-5xl">{fallbackLetter || '?'}</span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt || "Avatar"} 
      className="absolute inset-0 w-full h-full object-cover"
      onError={() => setHasError(true)}
    />
  );
}
