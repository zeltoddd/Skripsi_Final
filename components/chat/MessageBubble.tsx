import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { ChatMessage, QuickAction } from '../../types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Briefcase, 
  TrendingUp, 
  FileText, 
  School, 
  AlertCircle, 
  Globe, 
  Loader2,
  Copy,
  Check,
  Sparkles,
  GraduationCap,
  ChevronRight,
  ChevronDown,
  Volume2,
  Square,
  MessageCircle,
  Send,
  User,
  Lightbulb,
  RefreshCw,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onSummarize?: (id: string) => void;
  onQuickAction?: (action: QuickAction) => void;
  isSummarizing?: boolean;
  isLatest?: boolean;
  failed?: boolean;
  onRetry?: (userId: string) => void;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  onSummarize,
  onQuickAction,
  isSummarizing,
  isLatest,
  failed,
  onRetry,
}) => {
  const sender = message.sender as string;
  const isAi = sender === 'ai' || sender === 'model';
  const isError = message.isError;
  const groundingChunks = message.groundingMetadata?.groundingChunks;
  const [copied, setCopied] = useState(false);
  const [isReasoningOpen, setIsReasoningOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    toast.success("Teks berhasil disalin");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    const cleanText = message.text
      .replace(/<[^>]*>/g, '') 
      .replace(/```card/gi, '')   // Remove the opening ```card
      .replace(/```/g, '')        // Remove closing backticks
      .replace(/\*\*/g, '')       // Remove bold markdown
      .replace(/#/g, '')          // Remove heading tags
      .replace(/\n+/g, '. ')      // Replace newlines with periods for natural pauses
      .trim();

    if (!cleanText) return;

    try {
      setIsPlaying(true);
      const url = `/api/chat/tts`;
      console.log(`🔊 Playing full audio response...`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText
        })
      });

      if (!response.ok) throw new Error("Failed to fetch audio");
      
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl); 
        setIsPlaying(false);
        audioRef.current = null;
      };
      
      audio.onerror = (e) => {
        console.error("❌ Audio playback error:", e);
        setIsPlaying(false);
        audioRef.current = null;
      };

      await audio.play();
    } catch (err) {
      console.error("⚠️ Playback failed:", err);
      setIsPlaying(false);
    }
  };

  const getActionIcon = (actionId: string) => {
    const iconClass = "h-4 w-4";
    switch (actionId) {
      case 'search_jobs': return <Briefcase className={iconClass} />;
      case 'view_trends': return <TrendingUp className={iconClass} />;
      case 'create_cv': return <FileText className={iconClass} />;
      case 'search_scholarships': return <School className={iconClass} />;
      case 'search_courses': return <GraduationCap className={iconClass} />;
      default: return <Sparkles className={iconClass} />;
    }
  };

  // ─── User Message ───
  if (!isAi) {
    return (
      <div className="w-full text-right mb-6 animate-in fade-in slide-in-from-right-2 duration-300">
        <div className="inline-block text-left max-w-[85%] sm:max-w-[70%] rounded-2xl px-5 py-3 text-[14px] leading-relaxed bg-[#1a1a1a] text-white font-medium shadow-sm break-words">
          {message.fileData && Array.isArray(message.fileData) && message.fileData.length > 0 && (
            <div className="flex flex-row flex-wrap gap-1.5 mb-3 justify-end items-center">
              {message.fileData.map((file: any, i: number) => (
                <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/10 border border-white/5 text-white/80 shrink-0">
                  <FileText className="h-3 w-3 opacity-50 shrink-0" />
                  <span className="text-[10px] font-bold truncate max-w-[100px] tracking-tight uppercase">{file.fileName.split('.').pop() || 'FILE'}</span>
                </div>
              ))}
            </div>
          )}
          {message.fileData && !Array.isArray(message.fileData) && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/10 border border-white/5 text-white/80 mb-3 ml-auto w-fit">
              <FileText className="h-3 w-3 opacity-50 shrink-0" />
              <span className="text-[10px] font-bold truncate max-w-[100px] tracking-tight uppercase">{message.fileData.fileName.split('.').pop() || 'FILE'}</span>
            </div>
          )}
          <div className="text-white/90">{message.text.trim()}</div>
        </div>
        {failed && onRetry && (
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => onRetry(message.id)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-destructive hover:text-destructive/80 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Coba lagi
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── AI Message ───
  return (
    <div className={cn(
      "mb-10 group/ai animate-in fade-in duration-500",
    )}>
      <div className="space-y-4">
        
        {isError && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-sm font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {message.text}
          </div>
        )}

        {!isError && message.reasoning && (
          <div className="py-1">
            <button 
              onClick={() => setIsReasoningOpen(!isReasoningOpen)}
              className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group/reasoning"
            >
              <div className={cn("transition-transform duration-200 shrink-0 w-4 flex justify-center", isReasoningOpen ? "rotate-90" : "")}>
                <ChevronRight className="h-4 w-4" />
              </div>
              Proses Berpikir
              {message.isStreaming && <Loader2 className="h-3 w-3 animate-spin ml-1 opacity-40" />}
            </button>
            
            {isReasoningOpen && (
              <div className="mt-2 ml-2 pl-4 border-l border-border/60 space-y-4">
                {message.reasoning.split('\n\n').filter(Boolean).map((paragraph: string, idx: number) => (
                  <div key={idx} className="relative py-0.5">
                    <div className="absolute -left-[1.25rem] top-[0.6rem] w-2 h-2 rounded-full bg-border border-2 border-background" />
                    <p className="text-[13px] leading-relaxed text-muted-foreground/80">
                      {paragraph}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!isError && (
          <div className="prose prose-sm dark:prose-invert max-w-none text-[15px] leading-[1.8] text-[#1a1a1a] dark:text-foreground font-medium">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={{
                p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                pre: ({ children }: any) => {
                  // extract language from the child <code> element
                  const childProps = children?.props || {};
                  const match = /language-(\w+)/.exec(childProps.className || '');
                  
                  if (match && match[1] === 'card') {
                    const rawContent = String(childProps.children).replace(/\n$/, '');
                    const lines = rawContent.split('\n');
                    let title = lines[0] || 'Insight Tambahan';
                    title = title.replace(/\*\*/g, '').replace(/^#+\s/, '').trim();
                    const body = lines.slice(1).join('\n');

                    return (
                      <details className="my-3 rounded-2xl bg-[#F9F9F9] border border-border/60 shadow-sm group overflow-hidden transition-all duration-300">
                        <summary className="px-4 py-3 cursor-pointer bg-[#1A1A1A] text-white flex items-center justify-between hover:bg-[#2A2A2A] transition-colors select-none font-medium list-none [&::-webkit-details-marker]:hidden">
                          <span className="text-[14px] leading-snug">{title}</span>
                          <ChevronDown className="h-4 w-4 text-white/50 transition-transform duration-300 group-open:rotate-180 shrink-0 ml-3" />
                        </summary>
                        {body.trim() && (
                          <div className="px-4 pb-4 pt-4 text-[#1A1A1A]">
                            <div className="prose prose-sm max-w-none prose-ul:list-none prose-ul:pl-0 prose-ul:ml-[6px] prose-ul:border-l-2 prose-ul:border-gray-300 prose-li:relative prose-li:pl-5 prose-li:before:absolute prose-li:before:w-[8px] prose-li:before:h-[8px] prose-li:before:rounded-full prose-li:before:bg-gray-400 prose-li:before:-left-[5px] prose-li:before:top-[7px] prose-p:mb-2 prose-li:mb-3">
                              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                {body}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </details>
                    );
                  }

                  return (
                    <pre className="bg-[#1a1a1a] dark:bg-muted p-4 rounded-xl overflow-x-auto my-4 text-white dark:text-foreground shadow-inner">
                      {children}
                    </pre>
                  );
                },
                code: ({ inline, className, children, ...props }: any) => {
                  if (!inline) {
                    return (
                      <code className={cn("text-[13px] font-mono leading-relaxed", className)} {...props}>
                        {children}
                      </code>
                    );
                  }

                  return (
                    <code className={cn("bg-muted px-1.5 py-0.5 rounded-md text-[13px] font-mono text-[#E94B35]", className)} {...props}>
                      {children}
                    </code>
                  );
                },
                table: ({ children }) => (
                  <div className="my-4 overflow-x-auto rounded-xl border border-border/60 bg-muted/5 shadow-sm">
                    <table className="w-full text-left text-sm border-collapse">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-muted/30 border-b border-border/60">
                    {children}
                  </thead>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-3 font-bold text-muted-foreground text-[12px] uppercase tracking-wider">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-3 border-t border-border/40 text-[#333] dark:text-foreground/90">
                    {children}
                  </td>
                ),
              }}
            >{message.text.replace(/<[^>]*>/g, '')}</ReactMarkdown>
          </div>
        )}


        {/* Citations */}
        {!isError && groundingChunks && groundingChunks.length > 0 && (
          <div className="pt-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-3">Sumber</p>
            <div className="flex flex-wrap gap-2">
              {groundingChunks.slice(0, 3).map((chunk: any, idx: number) => (
                chunk.web?.uri && (
                  <a key={idx} href={chunk.web.uri} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold border border-border bg-muted/10 hover:bg-muted/30 transition-all text-muted-foreground hover:text-foreground">
                    <Globe className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[150px]">{chunk.web.title}</span>
                  </a>
                )
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions + Metadata Row */}
        {!isError && !message.isStreaming && (
          <div className="flex flex-col gap-4 mt-4">
            {/* Left: Quick Actions (Only on Latest) */}
            {isLatest && message.quickActions && message.quickActions.length > 0 && (
              <div className="flex flex-col gap-2 w-full mt-2">
                {/* Dynamic Options (Full width light blocks) */}
                {message.quickActions.filter((a: any) => a.actionId === 'dynamic_option').map((action: any, idx: number) => (
                  <Button 
                    key={`dyn-${idx}`} 
                    variant="outline" 
                    size="sm"
                    onClick={() => onQuickAction?.(action)}
                    className="w-full justify-start rounded-xl py-3 px-4 text-[13px] font-medium border border-border/60 bg-[#F9F9F9] hover:bg-[#F0F0F0] text-[#1A1A1A] transition-all gap-3 whitespace-normal text-left h-auto"
                  >
                    <div className="shrink-0"><MessageCircle className="h-4 w-4 text-muted-foreground/80" /></div>
                    <span className="leading-snug">{action.label}</span>
                  </Button>
                ))}
                
                {/* Fixed/Hardcoded Actions (Horizontal Pills) */}
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {message.quickActions.filter((a: any) => a.actionId !== 'dynamic_option').slice(0, 3).map((action: any, idx: number) => (
                    <Button 
                      key={`fixed-${idx}`} 
                      variant="outline" 
                      size="sm"
                      onClick={() => onQuickAction?.(action)}
                      className="rounded-xl h-auto py-2 px-3 text-[12px] font-semibold border-border/80 bg-background hover:bg-muted text-[#1A1A1A] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all gap-2"
                    >
                      <div className="shrink-0">{getActionIcon(action.actionId)}</div>
                      <span>{action.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Row: Actions & Metadata */}
            <div className="flex justify-between items-center opacity-30 mt-2">
              <div className="flex items-center gap-1.5">
                <button 
                  className={`transition-colors p-1 rounded-lg hover:bg-muted ${isPlaying ? 'text-red-500 hover:text-red-600' : 'hover:text-foreground'}`}
                  onClick={handleSpeak}
                  title={isPlaying ? "Berhenti" : "Dengarkan Jawaban"}
                >
                  {isPlaying ? <Square className="h-3.5 w-3.5 fill-current" /> : <Volume2 className="h-3.5 w-3.5" />}
                </button>
                <button 
                  className="hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted" 
                  onClick={handleCopy}
                  title="Salin Teks"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <span className="text-[10px] font-bold tabular-nums uppercase leading-none">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).replace(':', '.').toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* VOKARA Branding Footer */}
        {isLatest && isAi && !message.isStreaming && (
          <div className="pt-4 mt-6 border-t border-border/40 flex items-center justify-between animate-in fade-in duration-1000">
            <img src="/vokara-stacked.svg" alt="VOKARA" className="h-10 dark:invert opacity-60" />
            
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground/40 font-medium leading-tight">
                AI dapat membuat kesalahan. <br />
                Periksa kembali informasi penting.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessageBubble;
