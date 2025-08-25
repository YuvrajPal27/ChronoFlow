import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AnimatedBackground from '@/components/chronoflow/animated-background';

export const metadata: Metadata = {
  title: 'ChronoFlow',
  description: 'Your personal time and task manager with AI-powered categorization.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#F43F5E" />
      </head>
      <body className="font-body antialiased">
        <AnimatedBackground />
        <main className="relative z-10">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
