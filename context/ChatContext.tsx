'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useGuestSession } from '@/hooks/useGuestSession';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  reasoning?: string;
  quickActions?: any[];
  groundingMetadata?: any;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastMessageAt: Date;
  major: string;
}

interface ChatContextType {
  sessions: ChatSession[];
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  refreshSessions: () => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  createNewChat: () => void;
  isLoading: boolean;
  saveGuestSession?: (session: any) => string | null;
  clearGuestSessions?: () => void;
  hasGuestSessions: boolean;
  mergeGuestSessions: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { guestSessions, saveGuestSession, deleteGuestSession, clearGuestSessions } = useGuestSession();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Custom setter that also saves to localStorage
  const setCurrentSessionId = useCallback((id: string | null) => {
    setCurrentSessionIdState(id);
    if (id) {
      localStorage.setItem('vokara_last_session_id', id);
    } else {
      localStorage.removeItem('vokara_last_session_id');
    }
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const savedId = localStorage.getItem('vokara_last_session_id');
    if (savedId) {
      setCurrentSessionIdState(savedId);
    }
  }, []);

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const refreshSessions = useCallback(async () => {
    if (status !== 'authenticated') return;

    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    refreshTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/chat/sessions', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          // Sort sessions by lastMessageAt DESC (Newest on top)
          const sortedData = data.sort((a: any, b: any) =>
            new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
          );
          setSessions(sortedData);
        } else if (res.status === 401) {
          signOut({ callbackUrl: '/login' });
        }
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms debounce
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated') {
      refreshSessions();
    } else if (status === 'unauthenticated') {
      // Don't set to empty, let it be handled below by effectiveSessions
    }
  }, [status, refreshSessions]);

  const deleteSession = async (id: string) => {
    if (status === 'unauthenticated') {
      deleteGuestSession(id);
      if (currentSessionId === id) setCurrentSessionId(null);
      return;
    }

    try {
      const res = await fetch(`/api/chat/sessions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== id));
        if (currentSessionId === id) {
          setCurrentSessionId(null);
        }
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const createNewChat = () => {
    setCurrentSessionId(null);
  };

  const mergeGuestSessions = async () => {
    if (status !== 'authenticated' || guestSessions.length === 0) return;
    setIsLoading(true);
    try {
      for (const session of guestSessions) {
        await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: session.title,
            messages: session.messages
          }),
          credentials: 'include',
        });
      }
      clearGuestSessions();
      await refreshSessions();
    } catch (error) {
      console.error("Failed to merge guest sessions", error);
    } finally {
      setIsLoading(false);
    }
  };

  const effectiveSessions = status === 'authenticated' ? sessions : (guestSessions as ChatSession[]);

  return (
    <ChatContext.Provider value={{ 
      sessions: effectiveSessions, 
      currentSessionId, 
      setCurrentSessionId, 
      refreshSessions, 
      deleteSession,
      createNewChat,
      isLoading,
      saveGuestSession,
      clearGuestSessions,
      hasGuestSessions: guestSessions.length > 0,
      mergeGuestSessions
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
