"use client";

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Moon, Sun, Plus, List, X, MapPin, Clock, Archive, Bell, CalendarBlank } from '@phosphor-icons/react';
import { getNotifications, markNotificationsAsRead } from '../lib/actions';

export default function Navbar({ user }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
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

  // Fetch notifications
  useEffect(() => {
    if (user) {
      getNotifications().then(data => {
        setNotifications(data || []);
      });
    }
  }, [user, pathname]);

  // Handle click outside for notifications
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const handleToggleNotifications = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      const hasUnread = notifications.some(n => !n.is_read);
      if (hasUnread) {
        await markNotificationsAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    }
  };

  const navLinks = [
    { href: '/map', label: 'Map', icon: MapPin },
    { href: '/timeline', label: 'Timeline', icon: Clock },
    { href: '/important-dates', label: 'Dates', icon: CalendarBlank },
    { href: '/archive', label: 'Archive', icon: Archive },
  ];

  const isActive = (href) => pathname === href;

  const avatarLetter = user?.displayName?.[0]?.toUpperCase() || '?';
  const unreadCount = notifications.filter(n => !n.is_read).length;

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
            
            {/* Notification Bell */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={handleToggleNotifications}
                  className="p-2.5 rounded-full hover:bg-foreground/5 transition-colors relative"
                >
                  <Bell size={18} weight={unreadCount > 0 ? "fill" : "bold"} className={unreadCount > 0 ? "text-accent" : ""} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background"></span>
                  )}
                </button>

                {/* Dropdown */}
                {showNotifications && (
                  <div className="absolute top-12 right-0 w-80 bg-background border border-border/50 rounded-2xl shadow-xl overflow-hidden z-50">
                  <div className="p-4 border-b border-border/30 bg-foreground/5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-foreground/50">
                        No notifications yet.
                      </div>) : (
                        notifications.map(notif => (
                          <Link 
                            key={notif.id}
                            href={`/story/${notif.story_id}`}
                            onClick={() => setShowNotifications(false)}
                            className={`flex gap-3 p-4 hover:bg-foreground/5 transition-colors border-b border-border/10 last:border-0 ${!notif.is_read ? 'bg-accent/5' : ''}`}
                          >
                            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-foreground/10 border border-border/50">
                              {notif.actor_avatar ? (
                                <img src={notif.actor_avatar} alt={notif.actor_name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-xs text-foreground/50">
                                  {notif.actor_name?.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm leading-tight">
                                <span className="font-bold">{notif.actor_name}</span> {notif.action_type === 'reply' ? 'replied to your comment.' : 'commented on your photo.'}
                              </p>
                              <p className="text-[10px] text-foreground/50 mt-1 uppercase tracking-wider">
                                {new Date(notif.created_at).toLocaleString()}
                              </p>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
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

            {/* Hamburger (Hidden now) */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="hidden p-2 rounded-full hover:bg-foreground/5 transition-colors"
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
