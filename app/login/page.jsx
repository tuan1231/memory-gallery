"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../actions/auth';
import { LockKey, User } from '@phosphor-icons/react';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else if (result?.success) {
      router.push('/');
      router.refresh();
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 h-full min-h-[100dvh]">
      <div className="w-full max-w-md bg-card-bg border border-border p-8 rounded-3xl shadow-sm relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl"></div>

        <div className="text-center mb-10 relative z-10">
          <h1 className="text-3xl font-bold tracking-[0.15em] uppercase mb-3">Login</h1>
          <p className="text-foreground/60 text-sm tracking-wide">Welcome back to our space 💗</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {error && (
            <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-3 rounded-xl text-sm text-center font-medium">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-[0.1em] font-medium text-foreground/70 pl-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40">
                <User size={20} />
              </div>
              <input
                name="username"
                type="text"
                required
                className="w-full bg-background/50 border border-border rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-foreground/30"
                placeholder="Enter username..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-[0.1em] font-medium text-foreground/70 pl-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40">
                <LockKey size={20} />
              </div>
              <input
                name="password"
                type="password"
                required
                className="w-full bg-background/50 border border-border rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-foreground/30"
                placeholder="Enter password..."
              />
            </div>
          </div>

          <div className="flex items-center pl-1">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              className="h-4 w-4 rounded border-border text-foreground focus:ring-accent/50 bg-background/50"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-foreground/70">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-foreground text-background font-medium uppercase tracking-[0.1em] text-sm py-4 rounded-2xl mt-4 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {isLoading ? 'Entering...' : 'Enter Gallery'}
          </button>
        </form>
      </div>
    </div>
  );
}
