// components/auth/AuthGuard.tsx
'use client';

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = pathname === '/login' || pathname === '/register';
  const isOnboarding = pathname === '/onboarding';
  const isChat = pathname.startsWith('/chat');

  // Routes that can be accessed without login
  const isGuestAllowed = isPublicRoute || isChat;

  useEffect(() => {
    if (status === 'loading') return;

    // 1. Not logged in -> Go to Login (except public routes)
    if (status === 'unauthenticated' && !isGuestAllowed) {
      router.replace('/login');
      return;
    }

    // 2. Logged in but no major -> Go to Onboarding (except onboarding itself)
    if (
      status === 'authenticated' &&
      !(session?.user as any)?.major &&
      !isOnboarding &&
      !isPublicRoute
    ) {
      router.replace('/onboarding');
      return;
    }

    // 3. Logged in and has major -> Avoid Onboarding
    if (
      status === 'authenticated' &&
      (session?.user as any)?.major &&
      isOnboarding
    ) {
      router.replace('/dashboard');
      return;
    }
  }, [status, session, pathname, router, isPublicRoute, isOnboarding, isGuestAllowed]);

  // Global loading state (disabled to prevent initial render flickering)
  if (status === 'loading' && !isGuestAllowed) {
    return null;
  }

  return <>{children}</>;
}

