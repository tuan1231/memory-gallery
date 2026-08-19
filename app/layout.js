import { Inter } from 'next/font/google';
import ServerLayoutWrapper from './components/ServerLayoutWrapper';
import dynamic from 'next/dynamic';
import "./globals.css";

const DynamicBackground = dynamic(() => import('./components/DynamicBackground'));

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const viewport = {
  themeColor: '#121212',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata = {
  title: "Memory Gallery",
  description: "A timeline of our beautiful moments",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Memory Gallery",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💗</text></svg>',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.className} bg-background text-foreground min-h-[100dvh] flex flex-col transition-colors duration-300`}>
        <DynamicBackground />
        <ServerLayoutWrapper>
          {children}
        </ServerLayoutWrapper>
      </body>
    </html>
  );
}

