import { Outfit } from 'next/font/google';
import Navbar from './components/Navbar';
import "./globals.css";

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata = {
  title: "Memory Gallery",
  description: "A timeline of our beautiful moments",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} antialiased`}>
      <body className="bg-background text-foreground font-sans min-h-[100dvh] flex flex-col selection:bg-foreground selection:text-background transition-colors duration-300">
        <Navbar />
        <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
