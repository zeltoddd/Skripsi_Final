// components/career/CareerPath.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  ArrowRight, 
  ChevronRight, 
  Sparkles, 
  Trophy,
  BrainCircuit,
  Zap
} from 'lucide-react';
import { useSession } from 'next-auth/react';

const ROADMAP = [
  {
    stage: 'Entry Level',
    role: 'Junior Frontend Dev / UI Implementer',
    salary: 'Rp 6jt - 9jt',
    skills: ['HTML/CSS', 'JavaScript', 'React Dasar', 'Git'],
    icon: <Zap className="h-5 w-5" />
  },
  {
    stage: 'Mid Level',
    role: 'Frontend Engineer / Web Developer',
    salary: 'Rp 10jt - 18jt',
    skills: ['Next.js', 'TypeScript', 'State Management', 'Testing'],
    icon: <BrainCircuit className="h-5 w-5" />
  },
  {
    stage: 'Senior Level',
    role: 'Senior Engineer / Technical Lead',
    salary: 'Rp 20jt - 35jt+',
    skills: ['Architecture', 'System Design', 'Mentoring', 'Cloud Ops'],
    icon: <Trophy className="h-5 w-5" />
  }
];

export default function CareerPath() {
  const { data: session } = useSession();
  const major = (session?.user as any)?.major || 'Rekayasa Perangkat Lunak';

  return (
    <div className="flex-1 overflow-y-auto bg-muted/5 p-4 sm:p-8 space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 rounded-full px-4 py-1">
          Peta Karir {major} 🗺️
        </Badge>
        <h1 className="text-4xl font-black tracking-tight leading-tight">Rancang Masa Depanmu</h1>
        <p className="text-muted-foreground text-lg font-medium">Visualisasi langkah demi langkah untuk mencapai posisi puncak di industri teknologi.</p>
      </div>

      <div className="relative space-y-8 max-w-4xl mx-auto">
        {/* Connection Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/5 -translate-x-1/2 hidden md:block" />

        {ROADMAP.map((item, index) => (
          <div key={index} className={`flex flex-col md:flex-row items-center gap-8 relative ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
            {/* Stage Content */}
            <div className="flex-1 w-full">
              <Card className="rounded-[2.5rem] border-border/50 shadow-xl overflow-hidden group hover:border-primary/30 transition-all duration-500">
                <CardHeader className={`p-8 ${index === 0 ? 'bg-primary/5' : 'bg-muted/30'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none px-3 font-bold">{item.stage}</Badge>
                    <div className="p-3 rounded-2xl bg-background text-primary shadow-sm group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-black tracking-tight">{item.role}</CardTitle>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold mt-2">
                    <Zap className="h-4 w-4" />
                    {item.salary}
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Skill yang dibutuhkan:</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.skills.map(skill => (
                        <Badge key={skill} variant="outline" className="rounded-lg px-3 py-1 bg-background font-semibold">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full rounded-2xl h-12 gap-2 group-hover:gap-3 transition-all font-bold">
                    Lihat Cara Mencapai Ini
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Central Node */}
            <div className="hidden md:flex w-12 h-12 rounded-full bg-background border-4 border-primary items-center justify-center shadow-xl z-10 relative shrink-0">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            </div>

            {/* Empty space for alternative side */}
            <div className="flex-1 hidden md:block" />
          </div>
        ))}
      </div>

      <div className="bg-primary text-primary-foreground rounded-[3rem] p-10 sm:p-16 text-center space-y-6 shadow-2xl shadow-primary/20 relative overflow-hidden max-w-4xl mx-auto">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="w-40 h-40" />
        </div>
        
        <div className="relative z-10 space-y-4 max-w-xl mx-auto">
          <h2 className="text-3xl font-black leading-tight">Bingung mulai dari mana?</h2>
          <p className="text-primary-foreground/80 font-medium text-lg">Jangan khawatir, Kak Karir siap bantu buatkan roadmap personal berdasarkan minat dan bakatmu.</p>
          <div className="pt-4">
            <Button size="lg" variant="secondary" className="rounded-2xl px-10 h-16 font-black gap-2 hover:scale-105 transition-transform shadow-xl">
              Konsultasi Roadmap
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
