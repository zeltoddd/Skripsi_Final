'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ChatInterface from '@/components/chat/ChatInterface';
import WelcomeScreen from '@/components/chat/WelcomeScreen';
import { sendMessageToNvidia } from '@/services/nvidiaService';
import { useChat } from '@/context/ChatContext';
import { useSession } from 'next-auth/react';

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

  // Determine effective major: use session major if authenticated, else local userMajor (for guests)
  const isAuthenticated = !!authSession;
  const effectiveMajor = isAuthenticated ? sessionMajor : userMajor;

  const { currentSessionId, setCurrentSessionId, refreshSessions, sessions } = useChat();
  const params = useParams();
  const router = useRouter();
  const sessionIdFromUrl = params.sessionId as string;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
              setTimeout(() => onSendMessage(prompt), 100);
            }
          }
        }}
      />
    );
  }

  // Sync messages from database when currentSessionId changes
  const lastLoadedSessionId = useRef<string | null>(null);
  useEffect(() => {
    if (isLoading) return;
    if (currentSessionId !== lastLoadedSessionId.current) {
      if (currentSessionId) {
        const activeSession = sessions.find(s => s.id === currentSessionId);
        if (activeSession) {
          setMessages(activeSession.messages);
          lastLoadedSessionId.current = currentSessionId;
        }
      } else {
        setMessages([]);
        lastLoadedSessionId.current = null;
      }
    }
  }, [currentSessionId, sessions, isLoading]);

  // Auto-save to DB after successful AI response
   const saveChatToDb = async (sessionId: string, updatedMessages: any[], title?: string) => {
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, messages: updatedMessages }),
        credentials: 'include',
      });
      if (res.ok) {
        refreshSessions();
      } else {
        console.error("DB Save failed:", await res.json());
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

    // Create new session only for authenticated users
    if (!activeSessionId && isAuthenticated) {
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
          // Mark this session as loaded to prevent the sync effect from overwriting
          // our local streaming messages with stale DB data
          lastLoadedSessionId.current = activeSessionId;
          refreshSessions();
        } else {
          const errData = await res.json().catch(() => ({}));
          console.error("Failed to create session in DB:", errData.error || res.statusText);
        }
      } catch (error) {
        console.error("Failed to create session in DB:", error);
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
        timestamp: new Date(),
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
           // If we are still on the 'new' placeholder page, navigate to the real session URL
           if (params.sessionId === 'new') {
             router.replace(`/chat/${activeSessionId}`);
           }
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

   // Online status handling
   useEffect(() => {
     const handleOnline = () => {
       // Could show toast
     };
     window.addEventListener('online', handleOnline);
     return () => window.removeEventListener('online', handleOnline);
   }, []);

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
         />
      </main>
    </div>
  );
}
