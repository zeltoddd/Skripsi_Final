// app/(app)/chat/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import ChatInterface from '@/components/chat/ChatInterface';
import WelcomeScreen from '@/components/chat/WelcomeScreen';
import { sendMessageToNvidia, generateChatTitle } from '@/services/nvidiaService';
import { useChat } from '@/context/ChatContext';
import { useSession } from 'next-auth/react';

export default function ChatPage() {
  const { data: session } = useSession();
  const sessionMajor = (session?.user as any)?.major || null;
  
  const [userMajor, setUserMajor] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);

  const { currentSessionId, setCurrentSessionId, refreshSessions, sessions } = useChat();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync major from session
  useEffect(() => {
    if (sessionMajor) setUserMajor(sessionMajor);
    setIsInitialized(true);
  }, [sessionMajor]);

  // Use a ref to track which session's messages we've already loaded to local state
  const lastLoadedSessionId = useRef<string | null>(null);

  // Sync messages from database ONLY when currentSessionId changes (switching sessions)
  useEffect(() => {
    // If we're loading AI response, don't touch the messages state
    if (isLoading) return; 

    // Only sync if the sessionId has actually changed to prevent overwriting during active chat
    if (currentSessionId !== lastLoadedSessionId.current) {
      if (currentSessionId) {
        const activeSession = sessions.find(s => s.id === currentSessionId);
        if (activeSession) {
          setMessages(activeSession.messages);
          lastLoadedSessionId.current = currentSessionId;
        }
      } else {
        // New Chat: clear messages
        setMessages([]);
        lastLoadedSessionId.current = null;
      }
    }
  }, [currentSessionId, sessions, isLoading]);

  // AUTO-SAVE logic to DB
  const saveChatToDb = async (sessionId: string, updatedMessages: any[], title?: string) => {
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          messages: updatedMessages
        })
      });
      
      if (res.ok) {
        refreshSessions();
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("DB Save failed:", errData.error || res.statusText, errData.details || "");
      }
    } catch (error) {
      console.error("DB Save failed:", error);
    }
  };

  const onSendMessage = async (textOverride?: any) => {
    const textToUse = typeof textOverride === 'string' ? textOverride : input;
    if (!textToUse.trim() && attachedFiles.length === 0) return;
    
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

    // Create new session in DB if doesn't exist
    if (!activeSessionId) {
      try {
        const res = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: textToUse.slice(0, 30) + (textToUse.length > 30 ? '...' : ''),
            messages: updatedMessages
          })
        });
        
        if (res.ok) {
          const newSession = await res.json();
          activeSessionId = newSession.id;
          setCurrentSessionId(activeSessionId);
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
      // Siapkan history untuk AI (termasuk pesan terbaru dari user)
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
        userMajor || "Belum ditentukan",
        (chunk) => {
          // Hilangkan spinner "Menganalisis" begitu AI mulai ngomong
          setLoadingStep(null);
          
          if (chunk.content) accumulatedText += chunk.content;
          if (chunk.reasoning) accumulatedReasoning += chunk.reasoning;
          
          setMessages(prev => prev.map(m => 
            m.id === aiMsgId 
              ? { ...m, text: accumulatedText, reasoning: accumulatedReasoning }
              : m
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
      
      // Matikan loading secepat mungkin agar UI terasa responsif
      setIsLoading(false);
      setLoadingStep(null);

      // Final save to DB for this turn (Background task)
      if (activeSessionId) {
        // Jalankan background save tanpa await agar tidak nge-lag di UI
        (async () => {
          let finalTitle;
          const currentSess = sessions.find(s => s.id === activeSessionId);
          if (currentSess && (currentSess.title === 'Sesi Baru' || currentSess.title.endsWith('...'))) {
            try {
              finalTitle = await generateChatTitle(textToUse);
            } catch (e) {
              console.error("Title generation failed", e);
            }
          }
          await saveChatToDb(activeSessionId, finalMessages, finalTitle);
        })();
      }

    } catch (error) {
      console.error("API Error:", error);
      const errorMsg = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: "Waduh, koneksi ke otak AI saya lagi terputus nih. Coba cek API Key di settings atau coba lagi nanti ya!",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      // Pastikan loading benar-benar mati jika terjadi error di tengah jalan
      setIsLoading(false);
      setLoadingStep(null);
    }
  };

  if (!userMajor) {
    return <WelcomeScreen onSuggestionClick={(prompt, major) => {
      if (major) {
        setUserMajor(major);
        if (prompt) {
          setInput(prompt);
          setTimeout(() => onSendMessage(prompt), 100);
        }
      }
    }} />;
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
          onSendMessage={onSendMessage} 
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
              'search_jobs': 'Cari lowongan kerja atau magang yang relevan buat jurusanku dong',
              'view_trends': 'Gimana tren gaji dan peluang kerja buat jurusanku sekarang?',
              'create_cv': 'Bantu aku bikin CV yang bagus buat lulusan SMK',
              'search_scholarships': 'Ada info beasiswa kuliah buat lulusan SMK nggak?',
              'search_courses': 'Kasih rekomendasi kursus atau sertifikasi buat nambah skillku'
            };
            const prompt = promptMap[action.actionId] || action.label;
            setInput(prompt);
            setTimeout(() => onSendMessage(prompt), 50);
          }} 
          summarizingId={summarizingId} 
        />
      </main>
    </div>
  );
}
