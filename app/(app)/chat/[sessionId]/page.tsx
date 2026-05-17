'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ChatInterface from '@/components/chat/ChatInterface';
import WelcomeScreen from '@/components/chat/WelcomeScreen';
import { sendMessageToNvidia } from '@/services/nvidiaService';
import { useChat } from '@/context/ChatContext';
import { useSession, signOut } from 'next-auth/react';
import { getSuggestedPromptsForSession } from '@/lib/rag/suggestedPrompts';

export default function ChatSessionPage() {
  const { data: authSession, status } = useSession();
  const sessionMajor = (authSession?.user as any)?.major || null;

  const [userMajor, setUserMajor] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);
  const [failedMessages, setFailedMessages] = useState<Set<string>>(new Set());
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);

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

  // Load suggested prompts on mount or when effectiveMajor changes
  useEffect(() => {
    // Attempt to load guest profile from localStorage if it exists (run once logic)
    const guestProfileStr = localStorage.getItem('vokara_guest_profile');
    if (guestProfileStr && !userMajor) {
      try {
        const profile = JSON.parse(guestProfileStr);
        if (profile.major) {
          setUserMajor(profile.major);
        }
      } catch(e) {}
    }

    if (messages.length === 0 && effectiveMajor) {
      if (sessionIdFromUrl === 'new' || !currentSessionId) {
        // Force refresh the cache so every "New Chat" click gets fresh prompts
        import('@/lib/rag/suggestedPrompts').then(({ refreshSuggestedPrompts }) => {
          setSuggestedPrompts(refreshSuggestedPrompts('new-session', effectiveMajor));
        });
      } else {
        import('@/lib/rag/suggestedPrompts').then(({ getSuggestedPromptsForSession }) => {
          setSuggestedPrompts(getSuggestedPromptsForSession(currentSessionId, effectiveMajor));
        });
      }
    }
  }, [messages.length, effectiveMajor, sessionIdFromUrl, currentSessionId, userMajor]);

  // Sync messages from database when currentSessionId changes
  useEffect(() => {
    if (!currentSessionId) {
      if (!isLoading) setMessages([]);
      prevSessionIdRef.current = null;
      return;
    }

    const isNewSessionSwitch = prevSessionIdRef.current !== currentSessionId;
    prevSessionIdRef.current = currentSessionId;

    const activeSession = sessions.find(s => s.id === currentSessionId);
    
    if (activeSession) {
      setMessages(prev => {
        // Load from DB only on initial load or session switch
        if ((isNewSessionSwitch || prev.length === 0) && !isLoading) {
          return activeSession.messages;
        }
        
        // During active chat, NEVER overwrite local state with DB state
        // Local React state is the single source of truth for the active UI
        // This completely eliminates any UI flickering or re-ordering!
        return prev;
      });
    } else if (isNewSessionSwitch && !isLoading) {
      setMessages([]);
    }
  }, [currentSessionId, sessions, isLoading]);

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
      } else {
        console.error("DB Save failed:", await res.json().catch(() => ({})));
      }
    } catch (error) {
      console.error("DB Save failed:", error);
    }
  };

  const onSendMessage = async (textOverride?: any) => {
    const textToUse = typeof textOverride === 'string' ? textOverride : input;
    if (!textToUse.trim() && attachedFiles.length === 0) return;

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

    // Create new session
    if (!activeSessionId) {
      if (isAuthenticated) {
        try {
          const res = await fetch('/api/chat/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: textToUse.slice(0, 30) + (textToUse.length > 30 ? '...' : ''),
              messages: updatedMessages
            }),
            credentials: 'include',
          });

          if (res.ok) {
            const newSession = await res.json();
            activeSessionId = newSession.id;
            setCurrentSessionId(activeSessionId);
            window.history.replaceState(null, '', `/chat/${activeSessionId}`);
            refreshSessions();
          } else if (res.status === 401) {
            console.error("Failed to create session in DB: Unauthorized. Logging out...");
            signOut({ callbackUrl: '/login' });
            return;
          } else {
            const errData = await res.json().catch(() => ({}));
            console.error("Failed to create session in DB:", errData.error || res.statusText);
          }
        } catch (error) {
          console.error("Failed to create session in DB:", error);
        }
      } else if (saveGuestSession) {
        activeSessionId = crypto.randomUUID();
        setCurrentSessionId(activeSessionId);
        window.history.replaceState(null, '', `/chat/${activeSessionId}`);
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

      const response = await sendMessageToNvidia(
        textToUse,
        history,
        effectiveMajor || "Belum ditentukan",
        (chunk) => {
          setLoadingStep(null);
          if (chunk.content) accumulatedText += chunk.content;
          if (chunk.reasoning) accumulatedReasoning += chunk.reasoning;
          setMessages(prev => prev.map(m =>
            m.id === aiMsgId ? { ...m, text: accumulatedText, reasoning: accumulatedReasoning } : m
          ));
        },
        attachedFiles.length > 0 ? attachedFiles.map(f => ({ data: f.data, mimeType: f.fileType, fileName: f.fileName })) : undefined
      );

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
           if (currentSess && (currentSess.title === 'Sesi Baru' || currentSess.title.endsWith('...'))) {
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

      const response = await sendMessageToNvidia(
        userPrompt,
        history,
        effectiveMajor || "Belum ditentukan",
        (chunk) => {
          setLoadingStep(null);
          if (chunk.content) accumulatedText += chunk.content;
          if (chunk.reasoning) accumulatedReasoning += chunk.reasoning;
          setMessages(prev => prev.map(m =>
            m.id === aiMsgId ? { ...m, text: accumulatedText, reasoning: accumulatedReasoning } : m
          ));
        },
        attachedFiles.length > 0 ? attachedFiles.map(f => ({ data: f.data, mimeType: f.fileType, fileName: f.fileName })) : undefined
      );

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

    } catch (error) {
      console.error("API Error:", error);
      setIsLoading(false);
      setLoadingStep(null);
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

  // Show loading while session is loading
  if (status === 'loading') {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Memuat...</p>
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
    <div className="flex h-full overflow-hidden bg-background">
      <main className="flex-1 flex flex-col min-w-0 relative h-full">
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
      </main>
    </div>
  );
}
