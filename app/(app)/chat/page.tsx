'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChat } from '@/context/ChatContext';

export default function ChatRedirectPage() {
  const router = useRouter();
  const { currentSessionId } = useChat();

  useEffect(() => {
    const redirect = async () => {
      // Use currentSessionId if already set (same tab)
      if (currentSessionId) {
        router.replace(`/chat/${currentSessionId}`);
        return;
      }
      // Check localStorage for last session
      const savedId = localStorage.getItem('vokara_last_session_id');
      if (savedId) {
        router.replace(`/chat/${savedId}`);
      } else {
        router.replace('/chat/new');
      }
    };
    redirect();
  }, [router, currentSessionId]);

  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm text-muted-foreground">Memuat chat...</p>
    </div>
  );
}
