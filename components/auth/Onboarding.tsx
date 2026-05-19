// components/auth/Onboarding.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Calculator, Building, Plane, TrendingUp, Palette, Video, Code,
  ArrowLeft, Check, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from "next-auth/react";
import { SMK_MAJORS } from '@/constants/majors';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const getIcon = (iconName: string, className?: string) => {
  const props = { className: className || "h-4 w-4" };
  switch (iconName) {
    case 'Calculator': return <Calculator {...props} />;
    case 'Building': return <Building {...props} />;
    case 'Plane': return <Plane {...props} />;
    case 'TrendingUp': return <TrendingUp {...props} />;
    case 'Palette': return <Palette {...props} />;
    case 'Video': return <Video {...props} />;
    case 'Code': return <Code {...props} />;
    default: return <Code {...props} />;
  }
};

export default function Onboarding() {
  const [selected, setSelected] = useState<string | null>(null);
  const [grade, setGrade] = useState<string>('X');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { update } = useSession();

  const handleFinish = async () => {
    if (!selected || isSaving) return;

    const majorLabel = SMK_MAJORS.find(m => m.id === selected)?.label;
    if (!majorLabel) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/user/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ major: majorLabel, grade }),
        credentials: 'include',
      });

      if (res.ok) {
        // Refresh session to sync major in session.user
        await update();
        router.push('/chat');
      } else {
        const data = await res.json();
        alert(data.error || "Terjadi kesalahan saat memproses onboarding.");
        if (res.status === 404 || res.status === 401) {
          // Stale session (user deleted from DB) -> clear cookie & force log in again
          await signOut({ callbackUrl: '/login' });
        }
      }
    } catch (err) {
      console.error('Onboarding error:', err);
      alert("Koneksi gagal. Silakan periksa koneksi internet Anda.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Langkah Terakhir ✨</p>
          <h1 className="text-2xl font-bold tracking-tight">Pilih jurusanmu</h1>
          <p className="text-sm text-muted-foreground">
            Kami akan menyesuaikan bimbingan karir dan rekomendasi berdasarkan bidang keahlianmu.
          </p>
        </div>

        {/* Grade Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Kelas ( Tingkat )</label>
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-none focus:ring-primary/30">
              <SelectValue placeholder="Pilih kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="X">X (Kelas 10)</SelectItem>
              <SelectItem value="XI">XI (Kelas 11)</SelectItem>
              <SelectItem value="XII">XII (Kelas 12)</SelectItem>
              <SelectItem value="Alumni">Alumni</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Major Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SMK_MAJORS.map((major) => {
            const isSelected = selected === major.id;
            return (
              <button
                key={major.id}
                onClick={() => setSelected(major.id)}
                className={cn(
                  "text-left p-4 rounded-xl border transition-all flex items-center gap-3 group",
                  isSelected
                    ? "border-foreground bg-foreground text-background shadow-lg scale-[1.02]"
                    : "border-border bg-card hover:bg-accent hover:border-border"
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                  isSelected ? "bg-background/20" : "bg-muted"
                )}>
                  {getIcon(major.icon, cn("h-4 w-4", isSelected ? "text-background" : "text-muted-foreground"))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-bold leading-tight truncate", isSelected ? "text-background" : "")}>
                    {major.label}
                  </p>
                  <p className={cn("text-[10px] uppercase font-semibold tracking-wider", isSelected ? "text-background/60" : "text-muted-foreground")}>
                    {major.id}
                  </p>
                </div>
                {isSelected && <Check className="h-4 w-4 text-background shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4">
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="lg" className="rounded-xl px-6">
              Kembali
            </Button>
          </Link>
          <Button
            size="lg"
            onClick={handleFinish}
            disabled={!selected || isSaving}
            className="flex-1 rounded-xl font-bold h-12 shadow-xl shadow-primary/10 transition-all active:scale-95"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Menyiapkan Profile..
              </>
            ) : (
              'Mulai Eksplorasi Karir'
            )}
          </Button>
        </div>

        <p className="text-center text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
          Satu akun untuk masa depanmu
        </p>
      </div>
    </div>
  );
}
