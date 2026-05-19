import React, { useState, useEffect, useMemo } from 'react';
import { SMK_MAJORS } from '../../constants';
import { Button } from '../ui/button';
import { 
  Code, Palette, Film, Briefcase, Calculator, Map, ArrowRight, GraduationCap, Sparkles, ChevronLeft, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat } from '@/context/ChatContext';
import { getSuggestedPromptsForSession, refreshSuggestedPrompts } from '@/lib/rag/suggestedPrompts';

interface WelcomeProps {
  onSuggestionClick: (prompt: string, major?: string) => void;
}

const getMajorIcon = (iconName: string) => {
  switch (iconName) {
    case 'Calculator': return Calculator;
    case 'Briefcase': return Briefcase;
    case 'Map': return Map;
    case 'Palette': return Palette;
    case 'Film': return Film;
    case 'Code': return Code;
    default: return Sparkles;
  }
};

const QUICK_PROMPTS = [
  'Apa saja karir yang cocok untuk jurusan ini?',
  'Bagaimana cara membuat CV yang menarik?',
  'Beasiswa apa yang tersedia untuk lulusan SMK?',
  'Skill apa yang dibutuhkan industri saat ini?',
];

const Welcome: React.FC<WelcomeProps> = ({ onSuggestionClick }) => {
  const [selectedMajorId, setSelectedMajorId] = useState<string | null>(null);
  const { currentSessionId } = useChat();
  const [refreshToken, setRefreshToken] = useState(0);
  
  // Generate prompts based on selected major and current session (for consistency)
  const displayedPrompts = useMemo(() => {
    if (!selectedMajorId) return [];
    const sessionKey = currentSessionId || `new-${Date.now()}-${refreshToken}`;
    return getSuggestedPromptsForSession(sessionKey, selectedMajorId);
  }, [selectedMajorId, currentSessionId, refreshToken]);

  const getMajorLabel = (id: string) => SMK_MAJORS.find(m => m.id === id)?.label || id;

  if (!selectedMajorId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 max-w-2xl mx-auto">
        <div className="w-full space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Selamat datang di VEKORA</h1>
            <p className="text-sm text-muted-foreground">
              Pilih jurusanmu untuk mendapatkan panduan karir yang relevan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SMK_MAJORS.map((major) => {
              const Icon = getMajorIcon(major.icon);
              return (
                <button
                  key={major.id}
                  onClick={() => setSelectedMajorId(major.id)}
                  className="text-left p-3 rounded-lg border border-border bg-card hover:bg-accent hover:border-foreground/20 transition-colors flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium flex-1">{major.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 max-w-2xl mx-auto">
      <div className="w-full space-y-6">
        <div className="space-y-1">
          <button
            onClick={() => setSelectedMajorId(null)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ChevronLeft className="h-3 w-3" />
            Ganti jurusan
          </button>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">{getMajorLabel(selectedMajorId)}</span>
          </div>
          <h2 className="text-xl font-semibold tracking-tight">Apa yang ingin kamu tanyakan?</h2>
          <p className="text-xs text-muted-foreground">
            Berikut adalah beberapa topik yang bisa kamu mulai
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {displayedPrompts.map((prompt, i) => (
            <button
              key={`${selectedMajorId}-${i}`}
              onClick={() => onSuggestionClick(prompt, selectedMajorId)}
              className="text-left p-3 rounded-lg border border-border bg-card hover:bg-accent hover:border-foreground/20 transition-colors group"
            >
              <p className="text-sm font-medium leading-snug">{prompt}</p>
              <p className="text-xs text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                Klik untuk mulai →
              </p>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Atau ketik pertanyaanmu langsung di kolom chat di bawah.
          </p>
          <button
            onClick={() => {
              const sessionKey = currentSessionId || `new-${Date.now()}`;
              refreshSuggestedPrompts(sessionKey, selectedMajorId!);
              setRefreshToken(t => t + 1);
            }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh saran"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;