import { Inter } from 'next/font/google';
import Navbar from './components/Navbar';
import DynamicBackground from './components/DynamicBackground';
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: "Memory Gallery",
  description: "A timeline of our beautiful moments",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.className} bg-background text-foreground min-h-[100dvh] flex flex-col transition-colors duration-300`}>
        <DynamicBackground />
        <Navbar />
        <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
