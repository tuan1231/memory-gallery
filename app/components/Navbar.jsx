"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Moon, Sun } from '@phosphor-icons/react';

export default function Navbar() {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme);
      if (storedTheme === 'dark') document.documentElement.classList.add('dark');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-md border-b border-border/50 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl md:text-2xl font-bold tracking-[0.2em] hover:opacity-70 transition-opacity uppercase">
          LOVE
        </Link>
        <div className="flex items-center gap-4 md:gap-6">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-foreground/5 transition-colors"
            aria-label="Toggle Theme"
          >
            {mounted && (theme === 'light' ? <Moon size={20} weight="bold" /> : <Sun size={20} weight="bold" />)}
          </button>
          <Link 
            href="/map" 
            className="font-medium text-foreground/70 hover:text-foreground transition-colors uppercase tracking-[0.1em] text-xs md:text-sm"
          >
            Map
          </Link>
          <Link 
            href="/archive" 
            className="font-medium text-foreground/70 hover:text-foreground transition-colors uppercase tracking-[0.1em] text-xs md:text-sm"
          >
            Archive
          </Link>
          <Link 
            href="/create" 
            className="font-medium bg-foreground text-background px-4 py-2 md:px-5 md:py-2.5 rounded-full hover:-translate-y-[1px] active:scale-[0.98] transition-transform uppercase tracking-[0.1em] text-xs md:text-sm shadow-sm"
          >
            Add Memory
          </Link>
        </div>
      </div>
    </nav>
  );
}
