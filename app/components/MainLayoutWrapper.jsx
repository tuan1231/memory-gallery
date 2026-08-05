"use client";

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function MainLayoutWrapper({ children, user }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return (
      <main className="flex-1 w-full relative z-10 flex flex-col">
        {children}
      </main>
    );
  }

  return (
    <>
      <Navbar user={user} />
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
        {children}
      </main>
    </>
  );
}

