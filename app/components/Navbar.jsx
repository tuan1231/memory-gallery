"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Moon, Sun, Plus, List, X, MapPin, Clock, Archive } from '@phosphor-icons/react';

export default function Navbar({ user }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const pathname = usePathname();

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

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

  const navLinks = [
    { href: '/map', label: 'Map', icon: MapPin },
    { href: '/timeline', label: 'Timeline', icon: Clock },
    { href: '/archive', label: 'Archive', icon: Archive },
  ];

  const isActive = (href) => pathname === href;

  const avatarLetter = user?.displayName?.[0]?.toUpperCase() || '?';

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/30 transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="text-xl md:text-2xl font-bold tracking-[0.25em] hover:opacity-70 transition-opacity uppercase flex-shrink-0">
            LOVE
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.12em] transition-all ${
                  isActive(link.href)
                    ? 'bg-foreground/10 text-foreground'
                    : 'text-foreground/50 hover:text-foreground hover:bg-foreground/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={toggleTheme} 
              className="p-2.5 rounded-full hover:bg-foreground/5 transition-colors"
              aria-label="Toggle Theme"
            >
              {mounted && (theme === 'light' ? <Moon size={18} weight="bold" /> : <Sun size={18} weight="bold" />)}
            </button>
            
            <Link 
              href="/create" 
              className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full hover:-translate-y-[1px] active:scale-[0.98] transition-all text-xs font-bold uppercase tracking-[0.12em] shadow-sm"
            >
              <Plus size={14} weight="bold" />
              Add Memory
            </Link>

            {/* Avatar */}
            <Link 
              href="/profile" 
              className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all flex-shrink-0 hover:scale-110 ${
                isActive('/profile') ? 'border-accent shadow-md' : 'border-border/50 hover:border-foreground/30'
              }`}
            >
              {user?.avatarUrl && !avatarError ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.displayName || 'Profile'} 
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-full h-full bg-foreground/10 flex items-center justify-center text-xs font-bold text-foreground/60">
                  {avatarLetter}
                </div>
              )}
            </Link>
          </div>

          {/* Mobile Right Actions */}
          <div className="flex md:hidden items-center gap-2">
            <button 
              onClick={toggleTheme} 
              className="p-2.5 rounded-full hover:bg-foreground/5 transition-colors"
              aria-label="Toggle Theme"
            >
              {mounted && (theme === 'light' ? <Moon size={18} weight="bold" /> : <Sun size={18} weight="bold" />)}
            </button>

            {/* Mobile Avatar */}
            <Link 
              href="/profile" 
              className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all flex-shrink-0 ${
                isActive('/profile') ? 'border-accent' : 'border-border/50'
              }`}
            >
              {user?.avatarUrl && !avatarError ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.displayName || 'Profile'} 
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-full h-full bg-foreground/10 flex items-center justify-center text-[10px] font-bold text-foreground/60">
                  {avatarLetter}
                </div>
              )}
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-full hover:bg-foreground/5 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileOpen ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Slide-in Menu */}
      <div className={`fixed top-16 right-0 z-40 w-72 h-[calc(100dvh-4rem)] bg-background/95 backdrop-blur-xl border-l border-border/30 shadow-2xl transform transition-transform duration-300 ease-out md:hidden ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full p-6">
          
          {/* Nav Links */}
          <div className="flex flex-col gap-2 flex-1">
            {navLinks.map(link => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold uppercase tracking-[0.1em] transition-all ${
                    isActive(link.href)
                      ? 'bg-foreground/10 text-foreground'
                      : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'
                  }`}
                >
                  <Icon size={20} weight={isActive(link.href) ? "fill" : "regular"} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="pt-6 border-t border-border/30">
            <Link
              href="/create"
              className="flex items-center justify-center gap-2 w-full bg-foreground text-background py-4 rounded-2xl text-sm font-bold uppercase tracking-[0.12em] shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <Plus size={16} weight="bold" />
              Add Memory
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
