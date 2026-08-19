"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, MapPin, Plus, Clock, CalendarBlank } from '@phosphor-icons/react';

export default function BottomNav({ user }) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home', icon: House },
    { href: '/map', label: 'Map', icon: MapPin },
    { href: '/create', label: 'Add', icon: Plus, isAction: true },
    { href: '/timeline', label: 'Timeline', icon: Clock },
    { href: '/important-dates', label: 'Dates', icon: CalendarBlank },
  ];

  const isActive = (href) => {
    if (href === '/' && pathname !== '/') return false;
    return pathname.startsWith(href);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-background/90 backdrop-blur-xl border-t border-border/30 z-[60] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around px-2 h-[68px]">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);

          if (link.isAction) {
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-center w-12 h-12 bg-foreground text-background rounded-full hover:scale-105 transition-transform shadow-xl -translate-y-4"
              >
                <Plus size={24} weight="bold" />
              </Link>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
                active ? 'text-foreground' : 'text-foreground/50 hover:text-foreground'
              }`}
            >
              <Icon size={24} weight={active ? "fill" : "regular"} />
              <span className="text-[10px] mt-1 font-semibold tracking-wide">
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
