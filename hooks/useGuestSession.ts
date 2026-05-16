import { useState, useEffect } from 'react';

const GUEST_SESSIONS_KEY = 'vokara_guest_sessions';
const MAX_MESSAGES = 50;
const SESSION_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface GuestSession {
  id: string;
  title: string;
  messages: any[];
  lastMessageAt: Date;
  major: string;
  expiresAt: number;
}

export function useGuestSession() {
  const [guestSessions, setGuestSessions] = useState<GuestSession[]>([]);

  useEffect(() => {
    loadGuestSessions();
  }, []);

  const loadGuestSessions = () => {
    try {
      const stored = localStorage.getItem(GUEST_SESSIONS_KEY);
      if (stored) {
        let sessions: GuestSession[] = JSON.parse(stored);
        
        // Filter out expired sessions
        const now = Date.now();
        sessions = sessions.filter(s => s.expiresAt > now);
        
        // Ensure Date objects for lastMessageAt
        sessions = sessions.map(s => ({
          ...s,
          lastMessageAt: new Date(s.lastMessageAt)
        }));
        
        setGuestSessions(sessions);
        localStorage.setItem(GUEST_SESSIONS_KEY, JSON.stringify(sessions));
      }
    } catch (error) {
      console.error('Failed to load guest sessions:', error);
    }
  };

  const saveGuestSession = (session: Partial<GuestSession>) => {
    try {
      const now = Date.now();
      const newSession: GuestSession = {
        id: session.id || crypto.randomUUID(),
        title: session.title || 'Sesi Tamu',
        messages: session.messages ? session.messages.slice(-MAX_MESSAGES) : [],
        lastMessageAt: session.lastMessageAt || new Date(),
        major: session.major || '',
        expiresAt: now + SESSION_TTL,
      };

      setGuestSessions(prev => {
        const existingIndex = prev.findIndex(s => s.id === newSession.id);
        let updated = [...prev];
        if (existingIndex >= 0) {
          updated[existingIndex] = newSession;
        } else {
          updated.unshift(newSession); // Add to top
        }
        localStorage.setItem(GUEST_SESSIONS_KEY, JSON.stringify(updated));
        return updated;
      });

      return newSession.id;
    } catch (error) {
      console.error('Failed to save guest session:', error);
      return null;
    }
  };

  const deleteGuestSession = (id: string) => {
    setGuestSessions(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem(GUEST_SESSIONS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearGuestSessions = () => {
    setGuestSessions([]);
    localStorage.removeItem(GUEST_SESSIONS_KEY);
  };

  return {
    guestSessions,
    saveGuestSession,
    deleteGuestSession,
    clearGuestSessions,
    loadGuestSessions
  };
}
