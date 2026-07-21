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
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/80 border-b border-border transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-widest hover:opacity-80 transition-opacity uppercase">
          LOVE
        </Link>
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-foreground/5 transition-colors"
            aria-label="Toggle Theme"
          >
            {mounted && (theme === 'light' ? <Moon size={22} weight="bold" /> : <Sun size={22} weight="bold" />)}
          </button>
          <Link 
            href="/create" 
            className="font-medium bg-foreground text-background px-5 py-2 rounded-full hover:scale-105 active:scale-95 transition-transform uppercase tracking-widest text-sm"
          >
            Add Memory
          </Link>
        </div>
      </div>
    </nav>
  );
}
