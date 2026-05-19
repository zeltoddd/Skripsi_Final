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
import { VokaraStackedLogo } from '@/components/brand/Logo';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(props.messages.length);
  const latestMessage = props.messages[props.messages.length - 1];
  const isCurrentlyStreaming = latestMessage?.isStreaming;
  const shouldAutoScrollRef = useRef(true);
  const lastScrollTimeRef = useRef(0);

  // Monitor user's scroll gestures to enable/disable auto-scroll intelligently
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    
    // If user is within 100px of bottom, keep auto-scrolling. Otherwise, lock scroll position to let user read history.
    shouldAutoScrollRef.current = distanceToBottom < 100;
  };

  // Smart Auto-Scroll for incoming chunks
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const isNewMessage = props.messages.length > prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = props.messages.length;

    if (isNewMessage) {
      shouldAutoScrollRef.current = true;
      // Smooth scroll container to the absolute bottom on new message
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      return;
    }

    // During active text streaming, use throttled high-performance requestAnimationFrame scrollTop update 
    // to prevent browser forced-synchronous layout reflows and stuttering.
    if (shouldAutoScrollRef.current) {
      const now = Date.now();
      if (now - lastScrollTimeRef.current > 100) {
        lastScrollTimeRef.current = now;
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
          }
        });
      }
    }
  }, [props.messages]);

  // Khusus buat nembak ke bawah pas opsi muncul (streaming selesai)
  useEffect(() => {
    if (isCurrentlyStreaming === false) {
      const container = scrollContainerRef.current;
      if (!container) return;

      const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      if (distanceToBottom < 150) { // Toleransi agak gede pas opsi nongol
        shouldAutoScrollRef.current = true;
        setTimeout(() => {
          container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        }, 400); // Snappier response
      }
    }
  }, [isCurrentlyStreaming]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden relative">

      {/* ─── Messages Area ─── */}
      <div 
        ref={scrollContainerRef} 
        onScroll={handleScroll} 
        className="flex-1 overflow-y-auto px-4 scrollbar-hide"
      >
        <div className="max-w-2xl mx-auto w-full min-h-full flex flex-col space-y-6 pt-6 pb-6">
          {props.messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-5 sm:gap-6 py-6 animate-in fade-in duration-700">
              <div className="animate-in fade-in zoom-in-95 duration-700 flex justify-center">
                <VokaraStackedLogo className="h-[72px] sm:h-20 text-foreground opacity-100 transition-all duration-300" />
              </div>
              <p className="text-[13px] sm:text-sm text-foreground/80 text-center max-w-[280px] sm:max-w-[360px] leading-relaxed animate-in fade-in slide-in-from-bottom-4 delay-300 duration-700">
                Pilih topik di bawah atau ketik langsung pertanyaanmu seputar karir, skill, dan persiapan kerja.
              </p>

              {props.suggestedPrompts && props.suggestedPrompts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mt-2 sm:mt-4 animate-in fade-in slide-in-from-bottom-6 delay-500 duration-700">
                  {props.suggestedPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => props.onSuggestionClick && props.onSuggestionClick(prompt)}
                      className="text-left bg-card/60 dark:bg-muted/10 hover:bg-muted/80 dark:hover:bg-muted/20 border border-border/60 dark:border-foreground/10 hover:border-border dark:hover:border-border/70 rounded-2xl p-3.5 sm:p-4 px-4 transition-all duration-200 text-[13px] sm:text-sm text-foreground/80 hover:text-foreground group flex items-center gap-3 shadow-xs hover:shadow-sm"
                    >
                      <div className="p-1.5 rounded-xl bg-muted dark:bg-muted/20 group-hover:bg-background dark:group-hover:bg-zinc-800 border border-foreground/10 text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                        <FileText className="w-5 h-5 sm:w-4 sm:h-4" />
                      </div>
                      <span className="leading-snug sm:leading-relaxed line-clamp-2 font-medium">{prompt}</span>
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
                  loadingStep={(msg.sender === 'ai' || msg.sender === Sender.AI) && index === props.messages.length - 1 ? props.loadingStep : null}
                />
              ))}


              <div ref={props.messagesEndRef} className="h-4 w-full" />
            </>
          )}
        </div>
      </div>

      <div className="shrink-0 relative px-4 pt-2 z-20 bg-background" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
        <div className="absolute bottom-full left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        <div className="max-w-2xl mx-auto w-full">

          {/* Input container */}
          <div className="bg-background dark:bg-muted/20 border border-foreground/10 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] rounded-2xl p-2.5 px-3.5 transition-all relative z-10">
            {/* File Previews */}
            {props.attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {props.attachedFiles.map((file) => (
                  <div key={file.id} className="group relative w-24 h-16 rounded-lg overflow-hidden border border-border bg-background shadow-sm transition-all hover:border-foreground/20">
                    {file.previewUrl ? (
                      <img
                        src={file.previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover transition-opacity duration-300"
                        draggable={false}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/30">
                        <FileText className="h-5 w-5 text-muted-foreground/30" />
                        {file.fileType === 'application/pdf' && (
                          <span className="text-[7px] font-bold text-red-500/40 mt-0.5 uppercase">PDF</span>
                        )}
                      </div>
                    )}
                    {/* File Type Badge */}
                    <div className="absolute bottom-1 left-1 bg-white dark:bg-zinc-900 border border-border/40 px-1 py-0.2 rounded text-[7px] font-black uppercase tracking-wider shadow-sm z-10 select-none">
                      {file.fileName.split('.').pop() || 'FILE'}
                    </div>
                    {/* Close Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-4 w-4 rounded-full bg-black/50 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => props.setAttachedFiles(props.attachedFiles.filter(f => f.id !== file.id))}
                    >
                      <X className="h-2.5 w-2.5" />
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
              className="min-h-[28px] max-h-32 py-0 px-0 border-none shadow-none focus-visible:ring-0 text-sm md:text-[15px] resize-none bg-transparent dark:bg-transparent placeholder:text-muted-foreground/70 font-medium leading-relaxed"
              rows={1}
            />

            {/* Bottom row: actions */}
            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/5">
              <div className="flex items-center gap-1">
                {/* File upload */}
                <input
                  type="file"
                  ref={props.fileInputRef}
                  onChange={props.handleFileChange}
                  accept=".pdf,application/pdf"
                  multiple={false}
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={props.isLoading}
                  onClick={() => props.fileInputRef.current?.click()}
                  className="rounded-lg h-7 w-7 text-foreground/60 hover:text-foreground hover:bg-muted active:scale-95 transition-all duration-200"
                >
                  <Plus className="h-4.5 w-4.5" />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                {/* Model indicator */}
                <div className="flex items-center gap-1 text-[10px] text-foreground/50 font-bold tracking-tight cursor-pointer hover:text-foreground/80 transition-colors uppercase">
                  <span>VEKORA</span>
                  <span className="font-normal normal-case">Adaptive</span>
                  <ChevronDown className="h-2.5 w-2.5 opacity-70" />
                </div>

                <Button
                  onClick={props.onSendMessage}
                  disabled={(!(props.input || '').trim() && props.attachedFiles.length === 0) || props.isLoading}
                  size="icon"
                  className={cn(
                    "rounded-2xl h-9 w-9 transition-all duration-200 shrink-0 shadow-2xs",
                    ((props.input || '').trim() || props.attachedFiles.length > 0)
                      ? "bg-foreground hover:bg-foreground/90 hover:shadow-md active:scale-95 text-background"
                      : "bg-muted text-muted-foreground/30 cursor-not-allowed"
                  )}
                >
                  {props.isLoading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <ArrowUp className="h-4 w-4 stroke-[2.5px]" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
