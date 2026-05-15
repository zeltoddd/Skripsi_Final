// app/(app)/career-path/page.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  Map, 
  ArrowRight, 
  ChevronRight, 
  Sparkles, 
  Target,
  Trophy,
  BrainCircuit,
  Zap
} from 'lucide-react';
import Link from 'next/link';

const ROADMAP = [
  {
    stage: 'Entry Level',
    role: 'Junior Frontend Dev / UI Implementer',
    salary: 'Rp 6jt - 9jt',
    skills: ['HTML/CSS', 'JavaScript', 'React Dasar', 'Git'],
    icon: <Zap className="h-4 w-4" />
  },
  {
    stage: 'Mid Level',
    role: 'Frontend Engineer / Web Developer',
    salary: 'Rp 10jt - 18jt',
    skills: ['Next.js', 'TypeScript', 'State Management', 'Testing'],
    icon: <BrainCircuit className="h-4 w-4" />
  },
  {
    stage: 'Senior Level',
    role: 'Senior Engineer / Technical Lead',
    salary: 'Rp 20jt - 35jt+',
    skills: ['Architecture', 'System Design', 'Mentoring', 'Cloud Ops'],
    icon: <Trophy className="h-4 w-4" />
  }
];

export default function CareerPathPage() {
  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-lg font-semibold tracking-tight">Peta Karir Vokasi</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Visualisasi langkah nyata untuk mencapai posisi puncak di industri teknologi.
        </p>
      </div>

      <div className="relative space-y-4">
        {/* Connection Line (Simplified) */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border hidden md:block" />

        {ROADMAP.map((item, index) => (
          <div key={index} className="flex gap-6 relative">
            {/* Node Icon */}
            <div className="hidden md:flex w-12 h-12 rounded-full bg-background border border-border items-center justify-center shrink-0 z-10 shadow-sm">
              <div className="text-primary">{item.icon}</div>
            </div>

            {/* Content Card */}
            <Card className="flex-1 border border-border shadow-none hover:bg-accent/30 transition-colors group">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[9px] h-4 px-1.5 font-bold uppercase bg-primary/10 text-primary border-none">{item.stage}</Badge>
                      <h3 className="font-semibold text-base">{item.role}</h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-1">
                      {item.skills.map(skill => (
                        <Badge key={skill} variant="outline" className="text-[10px] h-4 px-2 font-medium opacity-70">{skill}</Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 pt-1">
                      <Zap className="h-3 w-3" />
                      Estimasi: {item.salary}
                    </div>
                  </div>
                  
                  <Button size="sm" variant="ghost" className="h-8 text-xs gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    Pelajari Skill
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <Card className="border border-border shadow-none bg-primary/5">
        <CardContent className="p-8 text-center space-y-4">
          <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold">Bingung mulai dari mana?</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Kak Karir siap bantu buatkan roadmap personal berdasarkan minat dan bakatmu saat ini.
            </p>
          </div>
          <Link href="/chat">
            <Button size="sm" className="gap-2 h-9 px-6 shadow-none">
              Konsultasi Karir Sekarang
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
