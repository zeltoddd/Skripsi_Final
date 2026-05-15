// app/(app)/cv-builder/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  User, 
  GraduationCap, 
  Briefcase, 
  Star, 
  ChevronRight, 
  ChevronLeft, 
  Download,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function CVBuilderPage() {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const steps = [
    { id: 1, title: 'Info Personal', icon: <User className="h-4 w-4" /> },
    { id: 2, title: 'Pendidikan', icon: <GraduationCap className="h-4 w-4" /> },
    { id: 3, title: 'Pengalaman', icon: <Briefcase className="h-4 w-4" /> },
    { id: 4, title: 'Keahlian', icon: <Star className="h-4 w-4" /> },
    { id: 5, title: 'Ringkasan AI', icon: <Sparkles className="h-4 w-4" /> },
    { id: 6, title: 'Selesai', icon: <CheckCircle2 className="h-4 w-4" /> },
  ];

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8 animate-in fade-in duration-700">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">CV Wizard v2.0</h1>
        <p className="text-muted-foreground text-lg">Bangun CV standar ATS yang disukai HRD perusahaan besar.</p>
      </div>

      {/* Progress Stepper */}
      <div className="flex justify-between items-center px-2">
        {steps.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-2 relative z-10">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
              step >= s.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110' : 'bg-muted text-muted-foreground'
            }`}>
              {s.icon}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block ${
              step === s.id ? 'text-primary' : 'text-muted-foreground'
            }`}>{s.title}</span>
          </div>
        ))}
        {/* Progress Line */}
        <div className="absolute left-0 right-0 h-0.5 bg-muted -z-0 mx-20 top-[11.5rem]" />
      </div>

      <Card className="rounded-3xl border-border/50 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
        <CardHeader className="bg-muted/30 border-b border-border/50 p-8">
          <CardTitle className="text-xl flex items-center gap-3">
            {steps[step-1].icon}
            {steps[step-1].title}
          </CardTitle>
          <CardDescription>Lengkapi informasi berikut dengan jujur dan detail.</CardDescription>
        </CardHeader>
        
        <CardContent className="p-8 flex-1">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input placeholder="Contoh: Ziyad Robith" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Email Profesional</Label>
                  <Input type="email" placeholder="ziyad@email.com" className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nomor WhatsApp (Aktif)</Label>
                <Input placeholder="0812..." className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Link LinkedIn / Portfolio</Label>
                <Input placeholder="https://linkedin.com/in/..." className="rounded-xl" />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Sparkles className="h-5 w-5" />
                  AI Summary Generator
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "Lulusan SMK Rekayasa Perangkat Lunak dengan fokus pada pengembangan Web (React/Node.js). Memiliki pengalaman PKL di PT. Teknologi Indonesia selama 6 bulan, di mana saya berhasil membangun modul manajemen inventaris..."
                </p>
                <Button variant="outline" className="rounded-full gap-2 border-primary/30 text-primary hover:bg-primary/10">
                  <RefreshCcw className="h-4 w-4" />
                  Generate Ulang
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Edit Ringkasan Dirimu</Label>
                <Textarea rows={6} className="rounded-2xl resize-none" />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="flex flex-col items-center justify-center text-center space-y-6 h-full animate-in zoom-in duration-500">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">CV Siap Didownload!</h3>
                <p className="text-muted-foreground max-w-sm">Selamat! CV-mu sudah selesai diproses dan siap digunakan untuk melamar pekerjaan impian.</p>
              </div>
              <div className="flex gap-4">
                <Button className="rounded-full gap-2 px-8 h-12 shadow-lg shadow-primary/20">
                  <Download className="h-5 w-5" />
                  Export PDF
                </Button>
                <Button variant="outline" className="rounded-full px-8 h-12">
                  Edit Lagi
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <div className="p-8 border-t border-border/50 bg-muted/10 flex justify-between">
          <Button 
            variant="ghost" 
            disabled={step === 1} 
            onClick={() => setStep(step - 1)}
            className="rounded-full px-6"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          
          {step < totalSteps ? (
            <Button 
              onClick={() => setStep(step + 1)}
              className="rounded-full px-8 gap-2 shadow-lg shadow-primary/20"
            >
              Lanjutkan
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              variant="outline"
              onClick={() => toast.success("Draft disimpan!")}
              className="rounded-full px-8"
            >
              Simpan Draft
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function RefreshCcw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  )
}
