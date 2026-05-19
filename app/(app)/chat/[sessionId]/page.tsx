'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ChatInterface from '@/components/chat/ChatInterface';
import WelcomeScreen from '@/components/chat/WelcomeScreen';

import { sendMessageToNvidia } from '@/services/nvidiaService';
import { useChat } from '@/context/ChatContext';
import { useSession, signOut } from 'next-auth/react';
import { getSuggestedPromptsForSession, refreshSuggestedPrompts } from '@/lib/rag/suggestedPrompts';
import { toast } from 'sonner';
import { SMK_MAJORS } from '@/constants/majors';

export default function ChatSessionPage() {
  const { data: authSession, status } = useSession();
  const sessionMajor = (authSession?.user as any)?.major || null;

  const [hasMounted, setHasMounted] = useState(false);
  const [userMajor, setUserMajor] = useState<string | null>(null);
  const [cachedUserMajor, setCachedUserMajor] = useState<string | null>(null);

  // Read client-side storage after hydration/mount to prevent SSR mismatch
  useEffect(() => {
    setHasMounted(true);
    try {
      const guestProfileStr = localStorage.getItem('vokara_guest_profile');
      if (guestProfileStr) {
        const profile = JSON.parse(guestProfileStr);
        if (profile.major) {
          setUserMajor(profile.major);
        }
      }
    } catch (e) {}

    const cached = localStorage.getItem('vokara_user_major');
    if (cached) {
      setCachedUserMajor(cached);
    }
  }, []);

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);
  const [failedMessages, setFailedMessages] = useState<Set<string>>(new Set());
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);

  // Sync sessionMajor to localStorage when authenticated
  useEffect(() => {
    if (status === 'authenticated' && sessionMajor) {
      localStorage.setItem('vokara_user_major', sessionMajor);
      setCachedUserMajor(sessionMajor);
    }
  }, [status, sessionMajor]);

  // Determine effective major: use session major if authenticated, else local userMajor (for guests)
  const isAuthenticated = !!authSession;
  const effectiveMajor = isAuthenticated ? sessionMajor : userMajor;

  const { currentSessionId, setCurrentSessionId, refreshSessions, sessions, saveGuestSession } = useChat();
  const params = useParams();
  const router = useRouter();
  const sessionIdFromUrl = params.sessionId as string;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const onSendMessageRef = useRef<((textOverride?: any) => Promise<void>) | null>(null);
  const prevSessionIdRef = useRef<string | null>(null);
  const loadedSessionIdRef = useRef<string | null>(null);
  const sessionCreationPromiseRef = useRef<Promise<any> | null>(null);

  // Load suggested prompts on mount or when effectiveMajor changes
  useEffect(() => {
    if (messages.length === 0 && effectiveMajor) {
      if (sessionIdFromUrl === 'new' || !currentSessionId) {
        // Force refresh the cache so every "New Chat" click gets fresh prompts
        setSuggestedPrompts(refreshSuggestedPrompts('new-session', effectiveMajor));
      } else {
        setSuggestedPrompts(getSuggestedPromptsForSession(currentSessionId, effectiveMajor));
      }
    }
  }, [messages.length, effectiveMajor, sessionIdFromUrl, currentSessionId]);

  // Sync messages from database when currentSessionId changes
  useEffect(() => {
    if (!currentSessionId) {
      if (!isLoading) setMessages([]);
      prevSessionIdRef.current = null;
      loadedSessionIdRef.current = null;
      return;
    }

    const isNewSessionSwitch = prevSessionIdRef.current !== currentSessionId;
    prevSessionIdRef.current = currentSessionId;

    // If we are actively streaming/loading a response, do NOT overwrite the local messages state
    if (isLoading) {
      loadedSessionIdRef.current = currentSessionId;
      return;
    }

    const activeSession = sessions.find(s => s.id === currentSessionId);

    if (isNewSessionSwitch) {
      // Only clear if switching to an existing session, not when we just started a brand new one
      if (activeSession) {
        setMessages([]); // Clear previous messages while switching sessions to prevent visual overlap
      } else {
        // New session starting, keep whatever is in messages
        loadedSessionIdRef.current = currentSessionId;
        return;
      }
    }

    // Guest sessions have messages loaded locally from localStorage, so no fetch needed
    if (status !== 'authenticated') {
      if (activeSession) {
        setMessages(activeSession.messages || []);
        loadedSessionIdRef.current = currentSessionId;
      }
      return;
    }

    // Authenticated users load messages on-demand from database
    const loadSessionMessages = async () => {
      // ONLY fetch if it's an existing saved session in the database
      if (!activeSession) {
        loadedSessionIdRef.current = currentSessionId;
        return;
      }

      // Do NOT fetch if we've already loaded this session's messages
      if (loadedSessionIdRef.current === currentSessionId) return;

      setIsMessagesLoading(true);
      try {
        const res = await fetch(`/api/chat/sessions/${currentSessionId}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          // Double check we are still on the same session and not loading
          if (prevSessionIdRef.current === currentSessionId && !isLoading) {
            setMessages(data.messages || []);
            loadedSessionIdRef.current = currentSessionId;
          }
        } else {
          toast.error("Gagal memuat pesan obrolan");
        }
      } catch (error) {
        console.error("Failed to load session messages:", error);
        toast.error("Gagal memuat pesan obrolan");
      } finally {
        setIsMessagesLoading(false);
      }
    };

    loadSessionMessages();
  }, [currentSessionId, status, sessions, isLoading]);

  // Keep onSendMessageRef updated so early-return callbacks can call it
  useEffect(() => {
    // We cannot access onSendMessage directly here if it's defined later, but since it uses state, 
    // it's tricky. Let's just define it inline or leave it if onSendMessage is defined below.
    // Wait, since onSendMessage is defined BELOW the early returns, how can we update the ref here?
    // We can't access onSendMessage before it is initialized!
  });

  // Online status handling
  useEffect(() => {
    const handleOnline = () => {
      // Could show toast
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);





  // Auto-save to DB after successful AI response
   const saveChatToDb = async (sessionId: string, updatedMessages: any[], title?: string) => {
    if (!isAuthenticated && saveGuestSession) {
      saveGuestSession({
        id: sessionId,
        title: title,
        messages: updatedMessages,
        major: effectiveMajor || '',
        lastMessageAt: new Date()
      });
      router.refresh();
      return;
    }

    try {
      // If we are currently creating this session in the background, wait for it to finish first!
      if (sessionCreationPromiseRef.current) {
        await sessionCreationPromiseRef.current;
        sessionCreationPromiseRef.current = null; // Reset
      }

      const res = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, messages: updatedMessages }),
        credentials: 'include',
      });
      if (res.ok) {
        refreshSessions();
      } else if (res.status === 401) {
        console.error("DB Save failed: Unauthorized. Logging out...");
        signOut({ callbackUrl: '/login' });
      } else if (res.status === 404) {
        console.error("DB Save failed: Session not found. Redirecting to fresh chat...");
        router.push('/chat');
      } else {
        console.error("DB Save failed:", await res.json().catch(() => ({})));
      }
    } catch (error) {
      console.error("DB Save failed:", error);
    }
  };

  const onSendMessage = async (textOverride?: any) => {
    if (isLoading) return;
    const textToUse = typeof textOverride === 'string' ? textOverride : input;
    if (!textToUse.trim() && attachedFiles.length === 0) return;

    const isNewSession = !currentSessionId;

    // Clear any existing failure for this new message
    setFailedMessages(prev => {
      const next = new Set(prev);
      next.clear();
      return next;
    });

    const newUserMsg = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: textToUse,
      timestamp: new Date(),
      fileData: attachedFiles
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInput('');
    setAttachedFiles([]);
    setIsLoading(true);
    setLoadingStep('Menganalisis pertanyaan...');

    let activeSessionId = currentSessionId;
    const isAuthenticated = !!authSession;

    // Create new session in background (non-blocking)
    if (!activeSessionId) {
      activeSessionId = crypto.randomUUID();
      setCurrentSessionId(activeSessionId);
      window.history.replaceState(null, '', `/chat/${activeSessionId}`);

      if (isAuthenticated) {
        sessionCreationPromiseRef.current = fetch('/api/chat/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: activeSessionId, // Client-generated UUID
            title: textToUse.slice(0, 30) + (textToUse.length > 30 ? '...' : ''),
            messages: updatedMessages
          }),
          credentials: 'include',
        }).then(async (res) => {
          if (res.ok) {
            refreshSessions();
          } else if (res.status === 401) {
            console.error("Failed to create session in DB: Unauthorized. Logging out...");
            signOut({ callbackUrl: '/login' });
          } else {
            const errData = await res.json().catch(() => ({}));
            console.error("Failed to create session in DB:", errData.error || res.statusText);
          }
        }).catch((error) => {
          console.error("Failed to create session in DB:", error);
        });
      } else if (saveGuestSession) {
        saveGuestSession({
          id: activeSessionId,
          title: textToUse.slice(0, 30) + (textToUse.length > 30 ? '...' : ''),
          messages: updatedMessages,
          major: effectiveMajor || ''
        });
      }
    }

    try {
      const history = updatedMessages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const aiMsgId = crypto.randomUUID();
      const initialAiMsg = {
        id: aiMsgId,
        sender: 'ai',
        text: '',
        reasoning: '',
        timestamp: new Date(Date.now() + 1000), // Add 1s to guarantee strict ordering in DB if ms are truncated
        isStreaming: true
      };

      const messagesWithPlaceholder = [...updatedMessages, initialAiMsg];
      setMessages(messagesWithPlaceholder);

      let accumulatedText = '';
      let accumulatedReasoning = '';

      let extractedFilesData: any[] = [];
      if (attachedFiles.length > 0) {
        setLoadingStep('Membaca dokumen PDF...');
        const parsePromises = attachedFiles.map(async (f) => {
          if (f.fileType === 'application/pdf' || f.fileName.endsWith('.pdf')) {
            const formData = new FormData();
            formData.append('file', f.originalFile);
            
            const res = await fetch('/api/upload/pdf', {
              method: 'POST',
              body: formData,
            });
            const parsed = await res.json();
            if (parsed.text && parsed.text.trim()) {
               return {
                 type: 'text',
                 text: parsed.text,
                 fileName: f.fileName,
                 mimeType: f.fileType
               };
            } else if (parsed.error) {
               throw new Error(`Gagal membaca PDF: ${parsed.error}`);
            } else {
               throw new Error('Gagal membaca PDF: Dokumen PDF kosong atau berupa scan gambar tanpa teks digital.');
            }
          }
          return null;
        });
        
        const results = await Promise.all(parsePromises);
        extractedFilesData = results.filter(r => r !== null);
      }

      let displayedText = '';
      let displayedReasoning = '';
      let typewriterInterval: any = null;
      let streamFinished = false;

      const startTypewriter = () => {
        typewriterInterval = setInterval(() => {
          let updated = false;
          let nextText = displayedText;
          let nextReasoning = displayedReasoning;

          if (displayedText.length < accumulatedText.length) {
            const diff = accumulatedText.length - displayedText.length;
            // Adaptive step size: flow faster if the stream is far ahead
            const step = diff > 80 ? 6 : (diff > 30 ? 3 : (diff > 10 ? 2 : 1));
            displayedText = accumulatedText.substring(0, displayedText.length + step);
            nextText = displayedText;
            updated = true;
          }

          if (displayedReasoning.length < accumulatedReasoning.length) {
            const diff = accumulatedReasoning.length - displayedReasoning.length;
            const step = diff > 40 ? 4 : 1;
            displayedReasoning = accumulatedReasoning.substring(0, displayedReasoning.length + step);
            nextReasoning = displayedReasoning;
            updated = true;
          }

          if (updated) {
            setMessages(prev => prev.map(m =>
              m.id === aiMsgId ? { ...m, text: nextText, reasoning: nextReasoning } : m
            ));
          } else if (streamFinished) {
            if (typewriterInterval) {
              clearInterval(typewriterInterval);
              typewriterInterval = null;
            }
          }
        }, 15);
      };

      startTypewriter();

      const response = await sendMessageToNvidia(
        textToUse,
        history,
        effectiveMajor || "Belum ditentukan",
        (chunk) => {
          setLoadingStep(null);
          if (chunk.content) accumulatedText += chunk.content;
          if (chunk.reasoning) accumulatedReasoning += chunk.reasoning;
        },
        extractedFilesData.length > 0 ? extractedFilesData : undefined,
        authSession?.user?.name || undefined
      );

      streamFinished = true;
      if (typewriterInterval) {
        clearInterval(typewriterInterval);
        typewriterInterval = null;
      }

      const finalAiMsg = {
        ...initialAiMsg,
        text: response.text,
        reasoning: response.reasoning,
        imageUrl: response.imageUrl,
        imageCaption: response.imageCaption,
        groundingMetadata: response.groundingMetadata,
        quickActions: response.quickActions,
        isStreaming: false
      };

       const finalMessages = messagesWithPlaceholder.map(m => m.id === aiMsgId ? finalAiMsg : m);
       setMessages(finalMessages);
       setIsLoading(false);
       setLoadingStep(null);

       // Save to DB and then navigate if this was a new session
       if (activeSessionId) {
         try {
           let finalTitle;
           const currentSess = sessions.find(s => s.id === activeSessionId);
           const needsTitleGen = isNewSession || (currentSess && (currentSess.title === 'Sesi Baru' || currentSess.title === 'Chat Baru' || currentSess.title === 'Sesi Tamu' || currentSess.title.endsWith('...')));
           if (needsTitleGen) {
             try {
               const { generateChatTitle } = await import('@/services/nvidiaService');
               finalTitle = await generateChatTitle(textToUse);
             } catch (e) {
               console.error("Title generation failed", e);
             }
           }
           await saveChatToDb(activeSessionId, finalMessages, finalTitle);
         } catch (err) {
           console.error("Final save failed", err);
         }
       }

    } catch (error) {
      console.error("API Error:", error);
      // Mark the user message as failed
      setFailedMessages(prev => new Set(prev).add(newUserMsg.id));
      setIsLoading(false);
      setLoadingStep(null);
      // Keep user message visible, remove AI placeholder if exists
      setMessages(prev => prev.filter(m => !(m.sender === 'ai' && m.isStreaming)));
    }
  };


  const handleRetry = async (userId: string) => {
    // Find the user message by ID
    const userMsgIndex = messages.findIndex(m => m.id === userId);
    if (userMsgIndex === -1) return;

    const userMsg = messages[userMsgIndex];
    // Remove the failed state for this message
    setFailedMessages(prev => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });

    // Retry sending AI response
    // Prepare messages up to and including this user message
    const messagesUpToUser = messages.slice(0, userMsgIndex + 1);
    setMessages(messagesUpToUser);

    // Trigger new AI response
    await streamResponse(messagesUpToUser, userMsg.text);
  };

  const handleRegenerate = async (aiMessageId: string) => {
    // Find the AI message index
    const aiIndex = messages.findIndex(m => m.id === aiMessageId);
    if (aiIndex <= 0) return;
    // The preceding message should be the user message to regenerate from
    const prevUserMsg = messages[aiIndex - 1];
    if (prevUserMsg.sender !== 'user') return;

    // Truncate messages to before this AI message
    const messagesUpToUser = messages.slice(0, aiIndex);
    setMessages(messagesUpToUser);

    // Stream new response
    await streamResponse(messagesUpToUser, prevUserMsg.text);
  };

  const streamResponse = async (baseMessages: any[], userPrompt: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setLoadingStep('Berpikir...');

    let activeSessionId = currentSessionId;

    try {
      const history = baseMessages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const aiMsgId = crypto.randomUUID();
      const initialAiMsg = {
        id: aiMsgId,
        sender: 'ai',
        text: '',
        reasoning: '',
        timestamp: new Date(),
        isStreaming: true
      };

      setMessages(prev => [...baseMessages, initialAiMsg]);

      let accumulatedText = '';
      let accumulatedReasoning = '';

      let extractedFilesData: any[] = [];
      if (attachedFiles.length > 0) {
        setLoadingStep('Membaca dokumen PDF...');
        const parsePromises = attachedFiles.map(async (f) => {
          if (f.fileType === 'application/pdf' || f.fileName.endsWith('.pdf')) {
            const formData = new FormData();
            formData.append('file', f.originalFile);
            
            const res = await fetch('/api/upload/pdf', {
              method: 'POST',
              body: formData,
            });
            const parsed = await res.json();
            if (parsed.text && parsed.text.trim()) {
               return {
                 type: 'text',
                 text: parsed.text,
                 fileName: f.fileName,
                 mimeType: f.fileType
               };
            } else if (parsed.error) {
               throw new Error(`Gagal membaca PDF: ${parsed.error}`);
            } else {
               throw new Error('Gagal membaca PDF: Dokumen PDF kosong atau berupa scan gambar tanpa teks digital.');
            }
          }
          return null;
        });
        
        const results = await Promise.all(parsePromises);
        extractedFilesData = results.filter(r => r !== null);
      }

      let displayedText = '';
      let displayedReasoning = '';
      let typewriterInterval: any = null;
      let streamFinished = false;

      const startTypewriter = () => {
        typewriterInterval = setInterval(() => {
          let updated = false;
          let nextText = displayedText;
          let nextReasoning = displayedReasoning;

          if (displayedText.length < accumulatedText.length) {
            const diff = accumulatedText.length - displayedText.length;
            // Adaptive step size: flow faster if the stream is far ahead
            const step = diff > 80 ? 6 : (diff > 30 ? 3 : (diff > 10 ? 2 : 1));
            displayedText = accumulatedText.substring(0, displayedText.length + step);
            nextText = displayedText;
            updated = true;
          }

          if (displayedReasoning.length < accumulatedReasoning.length) {
            const diff = accumulatedReasoning.length - displayedReasoning.length;
            const step = diff > 40 ? 4 : 1;
            displayedReasoning = accumulatedReasoning.substring(0, displayedReasoning.length + step);
            nextReasoning = displayedReasoning;
            updated = true;
          }

          if (updated) {
            setMessages(prev => prev.map(m =>
              m.id === aiMsgId ? { ...m, text: nextText, reasoning: nextReasoning } : m
            ));
          } else if (streamFinished) {
            if (typewriterInterval) {
              clearInterval(typewriterInterval);
              typewriterInterval = null;
            }
          }
        }, 15);
      };

      startTypewriter();

      const response = await sendMessageToNvidia(
        userPrompt,
        history,
        effectiveMajor || "Belum ditentukan",
        (chunk) => {
          setLoadingStep(null);
          if (chunk.content) accumulatedText += chunk.content;
          if (chunk.reasoning) accumulatedReasoning += chunk.reasoning;
        },
        extractedFilesData.length > 0 ? extractedFilesData : undefined
      );

      streamFinished = true;
      if (typewriterInterval) {
        clearInterval(typewriterInterval);
        typewriterInterval = null;
      }

      const finalAiMsg = {
        ...initialAiMsg,
        text: response.text,
        reasoning: response.reasoning,
        imageUrl: response.imageUrl,
        imageCaption: response.imageCaption,
        groundingMetadata: response.groundingMetadata,
        quickActions: response.quickActions,
        isStreaming: false
      };

      setMessages(prev => prev.map(m => m.id === aiMsgId ? finalAiMsg : m));
      setIsLoading(false);
      setLoadingStep(null);

      if (activeSessionId) {
        const currentMessages = [...messages, finalAiMsg];
        // generate title if needed
        let finalTitle;
        const currentSess = sessions.find(s => s.id === activeSessionId);
        if (currentSess && (currentSess.title === 'Sesi Baru' || currentSess.title.endsWith('...'))) {
          try {
            const { generateChatTitle } = await import('@/services/nvidiaService');
            finalTitle = await generateChatTitle(userPrompt);
          } catch (e) {
            console.error("Title generation failed", e);
          }
        }
        // Save to DB, then navigate if needed
        await saveChatToDb(activeSessionId, currentMessages, finalTitle);
        // If we are still on the 'new' page, navigate to the proper session URL
        if (params.sessionId === 'new') {
          router.replace(`/chat/${activeSessionId}`);
        }
      }

    } catch (error: any) {
      console.error("API Error:", error);
      setIsLoading(false);
      setLoadingStep(null);
      
      const errorMessage = error?.message || 'Terjadi kesalahan saat mengirim pesan.';
      toast.error(errorMessage);

      // Mark the user message that triggered this as failed (so user can retry)
      const lastUserMsg = baseMessages[baseMessages.length - 1];
      if (lastUserMsg && lastUserMsg.sender === 'user') {
        setFailedMessages(prev => new Set(prev).add(lastUserMsg.id));
      }
      // Remove any AI placeholder if it was added
      setMessages(prev => prev.filter(m => !(m.sender === 'ai' && m.isStreaming)));
    }
  };

  // Keep onSendMessageRef updated
  useEffect(() => {
    onSendMessageRef.current = onSendMessage;
  });

  // Online status handling
  useEffect(() => {
    const handleOnline = () => {
      // Could show toast
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // Prevent SSR flash/flicker by waiting for mount
  // Show skeleton during SSR or session loading to achieve instant FCP/LCP
  if (!hasMounted || status === 'loading' || isMessagesLoading) {
    const isNewChat = sessionIdFromUrl === 'new';

    if (isNewChat) {
      return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
          <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full space-y-8 animate-pulse">
            {/* Logo placeholder */}
            <div className="h-16 w-48 bg-muted rounded-2xl" />
            
            {/* Title / subtitle placeholders */}
            <div className="space-y-3 w-full flex flex-col items-center">
              <div className="h-6 bg-muted rounded-lg w-3/4" />
              <div className="h-4 bg-muted rounded-lg w-1/2" />
            </div>

            {/* Grid of options placeholder */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <div className="h-14 bg-muted/70 rounded-xl" />
              <div className="h-14 bg-muted/70 rounded-xl" />
              <div className="h-14 bg-muted/70 rounded-xl" />
              <div className="h-14 bg-muted/70 rounded-xl" />
            </div>
          </div>
          
          {/* Bottom input area skeleton */}
          <div className="border-t border-border/40 p-4 shrink-0 bg-background" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
            <div className="max-w-2xl mx-auto w-full h-12 bg-muted/40 rounded-xl" />
          </div>
        </div>
      );
    }

    // Thread Chat Skeleton (Loading an existing session)
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        {/* Scrollable messages area skeleton */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 max-w-2xl mx-auto w-full animate-pulse pt-8">
          {/* Message 1 (User) */}
          <div className="flex justify-end">
            <div className="max-w-[70%] bg-muted/60 h-10 w-44 rounded-2xl rounded-tr-none" />
          </div>

          {/* Message 2 (AI) */}
          <div className="flex justify-start items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-muted/70 shrink-0" />
            <div className="max-w-[85%] flex-1 space-y-2.5">
              <div className="h-4 bg-muted rounded w-[90%]" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-[60%]" />
            </div>
          </div>

          {/* Message 3 (User) */}
          <div className="flex justify-end">
            <div className="max-w-[70%] bg-muted/60 h-10 w-32 rounded-2xl rounded-tr-none" />
          </div>

          {/* Message 4 (AI) */}
          <div className="flex justify-start items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-muted/70 shrink-0" />
            <div className="max-w-[85%] flex-1 space-y-2.5">
              <div className="h-4 bg-muted rounded w-[80%]" />
              <div className="h-4 bg-muted rounded w-[45%]" />
            </div>
          </div>
        </div>

        {/* Bottom input area skeleton */}
        <div className="border-t border-border/40 p-4 shrink-0 bg-background" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
          <div className="max-w-2xl mx-auto w-full h-12 bg-muted/40 rounded-xl" />
        </div>
      </div>
    );
  }

  // If no effectiveMajor, show WelcomeScreen (for guests or if somehow missing)
  if (!effectiveMajor) {
    return (
      <WelcomeScreen
        onSuggestionClick={(prompt, major) => {
          if (major) {
            if (!isAuthenticated) {
              setUserMajor(major);
            }
            if (prompt) {
              setInput(prompt);
              setTimeout(() => onSendMessageRef.current?.(prompt), 100);
            }
          }
        }}
      />
    );
  }

   return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-background relative">
      <ChatInterface
          messages={messages}
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          loadingStep={loadingStep}
          onSendMessage={() => onSendMessage()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
            }
          }}
          attachedFiles={attachedFiles}
          setAttachedFiles={setAttachedFiles}
          fileInputRef={fileInputRef}
          textareaRef={textareaRef}
          messagesEndRef={messagesEndRef}
          handleFileChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) {
              files.forEach(file => {
                const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
                if (isImage) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setAttachedFiles(prev => [...prev, {
                      id: crypto.randomUUID(),
                      fileName: file.name,
                      fileType: file.type || 'image/jpeg',
                      previewUrl: reader.result as string,
                      originalFile: file
                    }]);
                  };
                  reader.readAsDataURL(file);
                } else {
                  setAttachedFiles(prev => [...prev, {
                    id: crypto.randomUUID(),
                    fileName: file.name,
                    fileType: file.type || 'application/octet-stream',
                    previewUrl: null,
                    originalFile: file
                  }]);
                }
              });
            }
          }}
          onSummarize={(id) => setSummarizingId(id)}
          onQuickAction={(action) => {
            const promptMap: Record<string, string> = {
              search_jobs: 'Cari lowongan kerja atau magang yang relevan buat jurusanku dong',
              view_trends: 'Gimana tren gaji dan peluang kerja buat jurusanku sekarang?',
              create_cv: 'Bantu aku bikin CV yang bagus buat lulusan SMK',
              search_scholarships: 'Ada info beasiswa kuliah buat lulusan SMK nggak?',
              search_courses: 'Kasih rekomendasi kursus atau sertifikasi buat nambah skillku'
            };
            const prompt = promptMap[action.actionId] || action.label;
            setInput(prompt);
            setTimeout(() => onSendMessage(prompt), 50);
          }}
          summarizingId={summarizingId}
          failedMessages={failedMessages}
          onRetry={handleRetry}
          suggestedPrompts={suggestedPrompts}
          onSuggestionClick={(prompt) => {
            setInput(prompt);
            setTimeout(() => onSendMessage(prompt), 50);
          }}
         />
      </div>
   );
}
