'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

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
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
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

  const refreshSessions = useCallback(async () => {
    if (status !== 'authenticated') return;
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat/sessions');
      if (res.ok) {
        const data = await res.json();
        // Sort sessions by lastMessageAt DESC (Newest on top)
        const sortedData = data.sort((a: any, b: any) => 
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );
        setSessions(sortedData);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated') {
      refreshSessions();
    } else if (status === 'unauthenticated') {
      setSessions([]);
      setCurrentSessionId(null);
    }
  }, [status, refreshSessions]);

  const deleteSession = async (id: string) => {
    try {
      const res = await fetch(`/api/chat/sessions/${id}`, {
        method: 'DELETE',
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

  return (
    <ChatContext.Provider value={{ 
      sessions, 
      currentSessionId, 
      setCurrentSessionId, 
      refreshSessions, 
      deleteSession,
      createNewChat,
      isLoading
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
