// app/layout.tsx
import React from 'react';
import type { Metadata } from 'next';
import { Space_Grotesk, Geist_Mono } from 'next/font/google';
import '@/index.css';
import '@/styles/tw-animate.css';

import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import SessionProvider from '@/components/providers/SessionProvider';
import AuthGuard from '@/components/auth/AuthGuard';
import { ChatProvider } from '@/context/ChatContext';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VOKARA — Bimbingan Karir SMK #1',
  description: 'Platform bimbingan karir berbasis AI khusus untuk siswa dan lulusan SMK di Indonesia.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${spaceGrotesk.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-background overflow-x-hidden">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <SessionProvider>
            <AuthGuard>
              <ChatProvider>
                {children}
              </ChatProvider>
            </AuthGuard>
          </SessionProvider>
          <Toaster position="top-center" richColors />
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
