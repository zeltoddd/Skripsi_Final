// components/dashboard/StudentDashboard.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Briefcase,
  GraduationCap,
  ChevronRight,
  MessageSquare,
  TrendingUp,
  Calendar,
  ArrowRight,
  Target,
  Clock,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

// Removed static stats to use dynamic state


const getRecommendationsByMajor = (major: string) => {
  const defaults = [
    { href: '/jobs', icon: Briefcase, label: 'Lowongan Magang', desc: 'PT. Digital Creative — Junior Designer', badge: 'Baru' },
    { href: '/scholarships', icon: GraduationCap, label: 'Beasiswa D3 Astra', desc: 'Deadline: 1 Juni 2026 · Full scholarship', badge: 'Dibuka' },
  ];

  if (major.includes('Desain') || major.includes('Visual')) {
    return [
      { href: '/jobs', icon: Briefcase, label: 'Junior UI/UX Designer', desc: 'Aion Studio — Magang Remote', badge: 'Hot' },
      { href: '/jobs', icon: Briefcase, label: 'Graphic Designer', desc: 'Vokara Creative Lab — Surakarta', badge: 'Baru' },
    ];
  }

  if (major.includes('Teknik') || major.includes('Informatika')) {
    return [
      { href: '/jobs', icon: Briefcase, label: 'Backend Developer', desc: 'Gojek — Internship Program', badge: 'Popular' },
      { href: '/jobs', icon: Briefcase, label: 'Web Developer', desc: 'PT. Tech Solusi — Junior Role', badge: 'Baru' },
    ];
  }

  return defaults;
};





export default function StudentDashboard() {
  const { data: session } = useSession();
  const [sessionCount, setSessionCount] = React.useState(0);
  const [stats, setStats] = React.useState([
    { label: 'Kesiapan Kerja', value: '0%', delta: 'Mulai konsultasi', icon: Target },
    { label: 'Lamaran Dikirim', value: '0', delta: 'Belum ada data', icon: Briefcase },
    { label: 'Sesi Konsultasi Chat', value: '0', delta: 'Total konsultasi', icon: MessageSquare },
  ]);

  const user = session?.user;
  const major = (user as any)?.major || 'Belum pilih jurusan';
  const recommendations = getRecommendationsByMajor(major);


  // Fetch actual stats
  React.useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/chat/sessions');
        if (res.ok) {
          const sessions = await res.json();
          setStats(prev => prev.map(s =>
            s.label === 'Sesi Chat' ? { ...s, value: sessions.length.toString(), delta: 'Terupdate otomatis' } : s
          ));
        }
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    }
    if (session) fetchStats();
  }, [session]);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Halo, {user?.name?.split(' ')[0] || 'Tamu'} 👋</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Siswa {major} · Lanjutkan persiapan karirmu hari ini
        </p>
      </div>


      {/* Call to Action - Compact Horizontal Highlight */}
      {sessionCount === 0 && (
        <Card className="border-none shadow-lg bg-[#1a1a1a] text-white p-4 sm:p-5 mb-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-full bg-white/5 skew-x-[-20deg] translate-x-16 blur-xl" />
          
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-1 sm:mt-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight">Mulai Konsultasi Karir</h2>
                <p className="text-xs text-white/60 line-clamp-1">
                  Tanya Kak Karir AI tentang jurusan, loker, atau beasiswa yang cocok buatmu.
                </p>
              </div>
            </div>
            
            <Link href="/chat" className="shrink-0">
              <Button className="w-full sm:w-auto bg-white hover:bg-white/90 text-black font-bold gap-2 px-6 rounded-lg shadow-lg">
                <MessageSquare className="h-4 w-4" />
                Buka Chat
              </Button>
            </Link>
          </div>
        </Card>
      )}



      {/* Stat Cards - New Premium Design */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border border-border shadow-none overflow-hidden bg-card min-h-[140px] flex flex-col justify-between p-4">
              {/* Icon Top Left */}
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-foreground/70" />
              </div>

              {/* Bottom Section */}
              <div className="flex items-end justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold leading-[1.1] text-foreground tracking-tight">
                    {s.label.split(' ').map((word, i) => (
                      <React.Fragment key={i}>
                        {word}
                        <br />
                      </React.Fragment>
                    ))}
                  </h3>
                </div>


                <div className="text-right">
                  <div className="text-4xl sm:text-5xl font-black tracking-tighter leading-none mb-1">
                    {s.value}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                    {s.delta}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>





      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recommendations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Rekomendasi Untukmu</h2>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground gap-1 px-2">
              Lihat semua <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-2">
            {recommendations.map((r) => {
              const Icon = r.icon;
              return (
                <Link key={r.label} href={r.href}>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors group cursor-pointer">

                    <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{r.label}</p>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{r.badge}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{r.desc}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              );
            })}
          </div>

          <Separator />

          {/* CTA */}
          {sessionCount > 0 && (
            <Card className="border border-border shadow-none bg-card">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold">Mulai Konsultasi Karir</CardTitle>
                <CardDescription className="text-xs">
                  Tanya Kak Karir AI tentang jurusan, loker, atau beasiswa yang cocok buatmu.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <Link href="/chat">
                  <Button size="sm" className="gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Buka Chat
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right: Progress Profil */}
        <div className="space-y-4">
          <Card className="border border-border shadow-none">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Progress Profil
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {[
                { label: 'CV Lengkap', pct: 0 },
                { label: 'Skill Assessment', pct: 0 },
                { label: 'Career Roadmap', pct: 0 },
              ].map((p) => (
                <div key={p.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{p.label}</span>
                    <span className="font-medium">{p.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-foreground rounded-full"
                      style={{ width: `${p.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
