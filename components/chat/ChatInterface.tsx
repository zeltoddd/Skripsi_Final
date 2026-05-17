// components/chat/ChatInterface.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  ArrowUp, 
  FileText, 
  Plus, 
  X,
  PanelLeft,
  ChevronDown
} from 'lucide-react';
 import { cn } from '@/lib/utils';
 import ChatMessageBubble from './MessageBubble';
 import { Sender } from '@/types';
 import { useChat } from '@/context/ChatContext';

interface ChatInterfaceProps {
  messages: any[];
  input: string;
  setInput: (val: string) => void;
  isLoading: boolean;
  loadingStep?: string | null;
  onSendMessage: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  attachedFiles: any[];
  setAttachedFiles: (files: any[]) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSummarize: (id: string) => void;
  onQuickAction: (action: any) => void;
  summarizingId: string | null;
  failedMessages: Set<string>;
  onRetry: (userId: string) => void;
  suggestedPrompts?: string[];
  onSuggestionClick?: (prompt: string) => void;
}

export default function ChatInterface(props: ChatInterfaceProps) {
  const { sessions, currentSessionId, createNewChat } = useChat();
  
  // Get current session title
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const chatTitle = currentSession?.title || '';
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    props.messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [props.messages]);

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      
      {/* ─── Messages Area ─── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
        <div className="max-w-2xl mx-auto w-full space-y-6 pb-44">
          {props.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-8 mt-12 md:mt-24">
              <div className="animate-in fade-in zoom-in-95 duration-700 flex justify-center">
                <img src="/vokara-stacked.svg" alt="VOKARA" className="h-24 dark:invert opacity-100 pl-12" />
              </div>
              <p className="text-sm text-foreground/80 text-center max-w-[280px] leading-relaxed animate-in fade-in slide-in-from-bottom-4 delay-300 duration-700">
                Halo! Aku siap bantu kamu soal karir, beasiswa, loker, dan banyak lagi. Mulai chat aja ya!
              </p>
              
              {props.suggestedPrompts && props.suggestedPrompts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mt-4 animate-in fade-in slide-in-from-bottom-6 delay-500 duration-700">
                  {props.suggestedPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => props.onSuggestionClick && props.onSuggestionClick(prompt)}
                      className="text-left bg-background/50 hover:bg-muted border border-border/50 hover:border-border rounded-2xl p-4 transition-all duration-200 text-sm text-foreground/80 hover:text-foreground group flex items-start gap-3"
                    >
                      <div className="p-2 rounded-xl bg-muted group-hover:bg-background border border-border/30 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="leading-relaxed line-clamp-3 font-medium">{prompt}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
               {props.messages.map((msg, index) => (
                 <ChatMessageBubble 
                   key={msg.id} 
                   message={msg} 
                   onSummarize={props.onSummarize}
                   onQuickAction={props.onQuickAction} 
                   isSummarizing={props.summarizingId === msg.id} 
                   isLatest={(msg.sender === 'ai' || msg.sender === Sender.AI) && index === props.messages.length - 1}
                   failed={props.failedMessages.has(msg.id)}
                   onRetry={props.onRetry}
                 />
               ))}
              
              {props.isLoading && props.loadingStep && (
                <div className="flex gap-3 py-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/70 font-medium">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {props.loadingStep || 'Sedang berpikir...'}
                  </div>
                </div>
              )}
              <div ref={props.messagesEndRef} className="h-4 w-full" />
            </>
          )}
        </div>
      </div>

      {/* ─── Input Area (Fixed Bottom) ─── */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-16 pb-6 px-4 z-20">
        <div className="max-w-2xl mx-auto w-full">
          
          {/* Input container */}
          <div className="bg-background border border-foreground/20 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] rounded-3xl p-4 transition-all">
            {/* File Previews */}
            {props.attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {props.attachedFiles.map((file) => (
                  <div key={file.id} className="group relative w-32 h-20 rounded-xl overflow-hidden border border-border bg-background shadow-sm transition-all hover:border-foreground/20">
                    {file.previewUrl ? (
                      <img 
                        src={file.previewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover transition-opacity duration-300" 
                        draggable={false}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/30">
                        <FileText className="h-7 w-7 text-muted-foreground/30" />
                        {file.fileType === 'application/pdf' && (
                          <span className="text-[8px] font-bold text-red-500/40 mt-1 uppercase">PDF Document</span>
                        )}
                      </div>
                    )}
                    {/* File Type Badge */}
                    <div className="absolute bottom-1.5 left-1.5 bg-white dark:bg-zinc-900 border border-border/40 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shadow-sm z-10 select-none">
                      {file.fileName.split('.').pop() || 'FILE'}
                    </div>
                    {/* Close Button */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/50 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => props.setAttachedFiles(props.attachedFiles.filter(f => f.id !== file.id))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Textarea */}
            <Textarea 
              ref={props.textareaRef} 
              value={props.input} 
              onChange={e => props.setInput(e.target.value)} 
              onKeyDown={props.onKeyDown}
              placeholder={props.attachedFiles.length > 0 ? "Beri instruksi untuk file ini..." : "Tanya sesuatu..."}
              className="min-h-[40px] max-h-32 py-0 px-0 border-none shadow-none focus-visible:ring-0 text-sm md:text-base resize-none bg-transparent placeholder:text-muted-foreground/80 font-medium leading-relaxed"
              rows={1}
            />
            
            {/* Bottom row: actions */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-1">
                {/* File upload */}
                <input 
                  type="file" 
                  ref={props.fileInputRef} 
                  onChange={props.handleFileChange} 
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" 
                  multiple
                  className="hidden" 
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  disabled={props.isLoading}
                  onClick={() => props.fileInputRef.current?.click()}
                  className="rounded-xl h-9 w-9 -ml-2 text-foreground/70 hover:text-foreground hover:bg-muted transition-all"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                {/* Model indicator */}
                <div className="flex items-center gap-1.5 text-[11px] text-foreground/70 font-bold tracking-tight cursor-pointer hover:text-foreground/40 transition-colors uppercase">
                  <span>VOKARA</span>
                  <span className="font-normal normal-case">Adaptive</span>
                  <ChevronDown className="h-3 w-3 opacity-70" />
                </div>

                <Button 
                  onClick={props.onSendMessage} 
                  disabled={(!(props.input || '').trim() && props.attachedFiles.length === 0) || props.isLoading}
                  size="icon"
                  className={cn(
                    "rounded-full h-10 w-10 transition-all duration-200 shrink-0",
                    ((props.input || '').trim() || props.attachedFiles.length > 0) 
                      ? "bg-foreground hover:bg-foreground/90 text-background" 
                      : "bg-muted text-muted-foreground/40 cursor-not-allowed"
                  )}
                >
                  {props.isLoading
                    ? <Loader2 className="h-5 w-5 animate-spin" />
                    : <ArrowUp className="h-5 w-5 stroke-[2.5px]" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
