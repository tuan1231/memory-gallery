"use client";

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import { motion, AnimatePresence } from 'motion/react';

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
      <AnimatePresence mode="wait">
        <motion.main 
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10 pb-32 md:pb-16"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <BottomNav user={user} />
    </>
  );
}

