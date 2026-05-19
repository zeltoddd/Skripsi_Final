import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { ChatMessage, QuickAction } from '../../types';
import { VokaraStackedLogo } from '../brand/Logo';
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
  loadingStep?: string | null;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  onSummarize,
  onQuickAction,
  isSummarizing,
  isLatest,
  failed,
  onRetry,
  loadingStep,
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
    const cleanTextToCopy = message.text
      .replace(/<[^>]*>/g, '')
      .replace(/(?:-|\*)*\s*\[?\*?OPSI:\*?\]?\s*.*?(?:\]|$)/gmi, '')
      .replace(/(?:\n|\s)*\[OPS[I:]*.*?$/gi, '')
      .replace(/(?:\n|^)\s*(?:[-*_]\s*){3,}\s*$/g, '')
      .trim();
    navigator.clipboard.writeText(cleanTextToCopy);
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
      .replace(/(?:-|\*)*\s*\[?\*?OPSI:\*?\]?\s*.*?(?:\]|$)/gmi, '') // Strip out raw UI tags
      .replace(/(?:\n|\s)*\[OPS[I:]*.*?$/gi, '')
      .replace(/(?:\n|^)\s*(?:[-*_]\s*){3,}\s*$/g, '') // Remove trailing HRs more aggressively
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
      <div className="w-full text-right mb-6 animate-in fade-in slide-in-from-right-2 slide-in-from-bottom-1 ease-out duration-500">
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
      "mb-10 group/ai animate-in fade-in slide-in-from-bottom-2 ease-out duration-700",
    )}>
      <div className="space-y-4">

        {isError && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-sm font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {message.text}
          </div>
        )}

        {!isError && (message.reasoning || (message.isStreaming && !message.text)) && (
          <div className="py-1">
            <button
              onClick={() => message.reasoning ? setIsReasoningOpen(!isReasoningOpen) : null}
              className={cn(
                "flex items-center gap-2 text-sm font-semibold transition-colors group/reasoning select-none",
                message.isStreaming && !message.reasoning ? "text-primary cursor-default" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn("transition-transform duration-200 shrink-0 w-4 flex justify-center")}>
                {message.isStreaming ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <div className={cn("transition-transform duration-200", isReasoningOpen ? "rotate-90" : "")}>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                )}
              </div>
              {message.isStreaming && !message.reasoning ? (loadingStep || "Menganalisis pertanyaan...") : "Analisis Konteks"}
            </button>

            {isReasoningOpen && message.reasoning && (
              <div className="mt-2 ml-2 pl-4 border-l border-border/60 space-y-3">
                {(() => {
                  // High-fidelity Contextual Dynamic Step Engine (3-5 steps)
                  // Genuinely parses, cleans, and translates real-time AI thoughts into polished career diagnostics
                  const cleanReasoning = (raw: string): string[] => {
                    if (!raw) return [];

                    // Step 1: Clean raw markdown and formatting
                    let cleanText = raw.replace(/```[\s\S]*?```/g, '').trim();

                    // Step 2: Split into sentences/clauses
                    const rawSentences = cleanText
                      .split(/[.!?\n]+/g)
                      .map(s => s.trim())
                      .filter(s => s.length > 15);

                    const processedSteps: string[] = [];

                    for (let sentence of rawSentences) {
                      // Block system prompts, system instructions, and token/rule references
                      if (
                        /system\s*instruction|system\s*prompt|model\s*id|nvidia|stepfun|smart\s*router|rag\s*key|api\s*key|bearer|dummy|history\s*limit|max\s*token|temperature|top_p|stream|choices|delta|content/i.test(sentence) ||
                        /format\s*opsi|pilihan\s*ganda|suggested\s*replies|ui\s*card|bullet\s*point|markdown\s*berlebihan|heading|paragraf\s*penjelasan|dua\s*opsi/i.test(sentence) ||
                        /bahasa\s*santai|ala\s*solo|panggil\s*kamu|jangan\s*basa-basi|to\s*the\s*point|tanpa\s*basa-basi|jangan\s*ngarang|jangan\s*bilang\s*maaf/i.test(sentence) ||
                        /aturan|rule|identitas|kepribadian|domain|batasan|blok\s*kode|card\s*demo/i.test(sentence) ||
                        /tugas\s*utama|rag_majors|referensi/i.test(sentence)
                      ) {
                        continue;
                      }

                      // Strip conversational filler words from start of thought sentences
                      let processed = sentence
                        .replace(/^(hmm|oke|nah|jadi|di sini|tampaknya|sepertinya|baiklah|pertama-tama|selanjutnya|lalu|kemudian|tapi|namun|maka|oleh karena itu|lalu karena),\s*/gi, '')
                        .replace(/^(hmm|oke|nah|jadi|di sini|tampaknya|sepertinya|baiklah|pertama-tama|selanjutnya|lalu|kemudian|tapi|namun|maka|oleh karena itu|lalu karena)\s/gi, '');

                      // Premium dynamic semantic replacements (convert raw thinking style to professional actions)
                      processed = processed
                        .replace(/\b(user\s+mau\s+tahu\s+apakah|user\s+spesifik\s+mau\s+tahu|pengguna\s+ingin\s+mengetahui|user\s+tanya|user\s+nanya)\b/gi, 'Menganalisis ketertarikan siswa mengenai')
                        .replace(/\b(file\s+yang\s+dikirim\s+ternyata\s+isinya|file\s+tidak\s+valid|file\s+tidak\s+bisa\s+dibaca)\b/gi, 'Mendeteksi adanya ketidaksesuaian format berkas digital')
                        .replace(/\b(aku\s+bisa\s+berikan|aku\s+harus\s+kasih|saya\s+perlu\s+menjelaskan|aku\s+bisa\s+jelaskan)\b/gi, 'Menyusun penjelasan komprehensif terkait')
                        .replace(/\b(perlu\s+dijelaskan\s+dulu\s+adalah|yang\s+perlu\s+dijelaskan)\b/gi, 'Menguraikan prioritas informasi utama bahwa');

                      // Prefix alignment: Ensure every dynamic sentence starts with an active professional Indonesian verb
                      if (!/^(menganalisis|mengidentifikasi|menyelaraskan|mengevaluasi|mencocokkan|merumuskan|menyusun|merekomendasikan|melakukan|mendeteksi|menelaah|menjelaskan|mempersiapkan|memetakan|menghubungkan|memverifikasi|mengarahkan|mengukur|menilai|menguraikan)/i.test(processed)) {
                        if (processed.toLowerCase().includes('beasiswa') || processed.toLowerCase().includes('kip')) {
                          processed = "Mengevaluasi kelayakan administrasi beasiswa " + processed.charAt(0).toLowerCase() + processed.slice(1);
                        } else if (processed.toLowerCase().includes('magang') || processed.toLowerCase().includes('pkl') || processed.toLowerCase().includes('kerja')) {
                          processed = "Menganalisis kecocokan program magang industri " + processed.charAt(0).toLowerCase() + processed.slice(1);
                        } else if (processed.toLowerCase().includes('jurusan') || processed.toLowerCase().includes('smk')) {
                          processed = "Menyelaraskan dengan kurikulum program keahlian " + processed.charAt(0).toLowerCase() + processed.slice(1);
                        } else {
                          processed = "Mengidentifikasi indikator bimbingan " + processed.charAt(0).toLowerCase() + processed.slice(1);
                        }
                      }

                      // Capitalize and clean punctuation
                      processed = processed.trim();
                      processed = processed.charAt(0).toUpperCase() + processed.slice(1);

                      if (processed.length > 20 && !processedSteps.includes(processed)) {
                        processedSteps.push(processed);
                      }
                    }

                    // Fallback to contextual defaults if the thinking text didn't yield enough clean points
                    if (processedSteps.length < 3) {
                      const lowerRaw = raw.toLowerCase();
                      if (lowerRaw.includes('file') || lowerRaw.includes('pdf')) {
                        processedSteps.push("Menelaah validitas isi berkas digital yang diunggah pengguna.");
                      } else {
                        processedSteps.push("Menganalisis parameter pertanyaan siswa guna memetakan arah eksplorasi.");
                      }

                      if (lowerRaw.includes('beasiswa') || lowerRaw.includes('kuliah')) {
                        processedSteps.push("Mengevaluasi peluang bantuan pendidikan tinggi dan prasyarat administrasi.");
                      } else if (lowerRaw.includes('magang') || lowerRaw.includes('pkl') || lowerRaw.includes('kerja')) {
                        processedSteps.push("Menganalisis kesiapan vokasional siswa terhadap program pelatihan kerja industri.");
                      } else {
                        processedSteps.push("Menyelaraskan bimbingan karir dengan kompetensi program keahlian SMK.");
                      }

                      processedSteps.push("Menyusun peta jalan taktis dan opsi tindak lanjut interaktif bagi siswa.");
                    }

                    // Strict limit to the sweet spot of 3 to 5 steps
                    return processedSteps.slice(0, 5);
                  };

                  return cleanReasoning(message.reasoning).map((paragraph: string, idx: number) => (
                    <div key={idx} className="relative py-0.5 animate-in fade-in duration-300">
                      <div className="absolute -left-[1.25rem] top-[0.6rem] w-1.5 h-1.5 rounded-full bg-primary/40 border border-background" />
                      <p className="text-[12.5px] leading-relaxed text-muted-foreground/80 font-medium">
                        {paragraph}
                      </p>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        )}



        {!isError && message.text && (
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
                      <details className="my-2 rounded-xl bg-background dark:bg-muted/20 border border-border group overflow-hidden transition-all duration-300">
                        <summary className="px-4 py-4 cursor-pointer bg-background dark:bg-transparent text-foreground flex items-center justify-between hover:bg-muted/50 transition-colors select-none font-semibold list-none [&::-webkit-details-marker]:hidden">
                          <span className="text-[14px] leading-snug">{title}</span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-open:rotate-180 shrink-0 ml-3" />
                        </summary>
                        {body.trim() && (
                          <div className="px-4 pb-4 pt-3 border-t border-border/60 text-foreground/90">
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
                  <td className="px-4 py-3 border-t border-border/40 text-foreground dark:text-foreground/90">
                    {children}
                  </td>
                ),
              }}
            >{message.text
              .replace(/<[^>]*>/g, '')
              .replace(/(?:-|\*)*\s*\[?\*?OPSI:\*?\]?\s*.*?(?:\]|$)/gmi, '')
              .replace(/(?:\n|\s)*\[OPS[I:]*.*?$/gi, '')
              .replace(/(?:\n|^)\s*(?:[-*_]\s*){3,}\s*$/g, '')
              .trim()}</ReactMarkdown>
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
        {!isError && (
          <div className={cn(
            "grid transition-[grid-template-rows,opacity,margin] duration-700 ease-out",
            message.isStreaming ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
          )}>
            <div className="overflow-hidden">
              <div className="flex flex-col gap-4 ">
                {/* Left: Quick Actions (Only on Latest) - Mutually Exclusive */}
                {isLatest && message.quickActions && message.quickActions.length > 0 && (() => {
                  const dynamicOptions = message.quickActions.filter((a: any) => a.actionId === 'dynamic_option');
                  const hardcodedActions = message.quickActions.filter((a: any) => a.actionId !== 'dynamic_option');

                  if (dynamicOptions.length > 0) {
                    return (
                      <div className="flex flex-col gap-1.5 w-full">
                        {dynamicOptions.map((action: any, idx: number) => (
                          <div key={`dyn-${idx}`} className="animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out" style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'backwards' }}>
                            <Button
                              variant="outline"
                              size="lg"
                              onClick={() => onQuickAction?.(action)}
                              className="group w-full justify-start bg-background dark:bg-muted/20 rounded-xl py-4 px-4 text-[13px] font-medium border border-border hover:bg-muted text-foreground/90 transition-all duration-300 hover:shadow-md hover:-translate-y-[1px] active:scale-[0.99] gap-3 whitespace-normal text-left h-auto"
                            >
                              <div className="shrink-0 transition-transform duration-300 group-hover:scale-110"><MessageCircle className="h-4 w-4 text-muted-foreground" /></div>
                              <span className="leading-snug">{action.label}</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    );
                  } else if (hardcodedActions.length > 0) {
                    return (
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex  flex-wrap items-center gap-2 ">
                          {hardcodedActions.slice(0, 2).map((action: any, idx: number) => (
                            <div key={`fixed-${idx}`} className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out" style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'backwards' }}>
                              <Button
                                variant="outline"
                                size="lg"
                                onClick={() => onQuickAction?.(action)}
                                className="group rounded-xl h-auto mt-4 py-3 px-4 text-[12px] font-semibold border-border bg-background dark:bg-muted/20 hover:bg-muted text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-md hover:-translate-y-[1px] active:scale-[0.97] gap-2"
                              >
                                <div className="shrink-0 transition-transform duration-300 group-hover:scale-110">{getActionIcon(action.actionId)}</div>
                                <span>{action.label}</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Bottom Row: Actions & Metadata */}
                <div className="flex justify-between mt-1 items-center opacity-60  animate-in fade-in duration-700" style={{ animationDelay: `${message.quickActions && message.quickActions.length > 0 ? message.quickActions.length * 100 : 0}ms`, animationFillMode: 'backwards' }}>
                  <div className="flex items-center gap-1.5">
                    <button
                      className={`transition-all duration-200 p-1.5 rounded-lg hover:bg-muted hover:scale-110 active:scale-95 ${isPlaying ? 'text-red-500 hover:text-red-600' : 'hover:text-foreground'}`}
                      onClick={handleSpeak}
                      title={isPlaying ? "Berhenti" : "Dengarkan Jawaban"}
                    >
                      {isPlaying ? <Square className="h-3.5 w-3.5 fill-current" /> : <Volume2 className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      className="transition-all duration-200 p-1.5 rounded-lg hover:bg-muted hover:scale-110 active:scale-95 hover:text-foreground"
                      onClick={handleCopy}
                      title="Salin Teks"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <span className="text-[10px]  font-regular tabular-nums uppercase leading-none">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).replace(':', '.').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VOKARA Branding Footer */}
        {isLatest && isAi && (
          <div className={cn(
            "pt-4 mt-2 border-t border-border flex items-center justify-between transition-all duration-1000 ease-out",
            message.isStreaming ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
          )}>
            <VokaraStackedLogo className="h-10 text-foreground opacity-70" />

            <div className="text-right">
              <p className="text-[10px] text-muted-foreground/80 font-medium leading-tight">
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
