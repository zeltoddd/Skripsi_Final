// app/(app)/scholarships/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  GraduationCap, 
  Calendar, 
  MapPin, 
  Bookmark, 
  Search,
  School,
  ArrowRight,
  Sparkles,
  Trophy,
  ChevronRight,
  Filter
} from 'lucide-react';
import { SCHOLARSHIPS } from '@/services/RAG_SETUP';
import Link from 'next/link';

export default function ScholarshipTrackerPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredScholarships = SCHOLARSHIPS.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Beasiswa & Pendidikan</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Temukan bantuan biaya pendidikan eksklusif untuk lulusan SMK.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9 px-3 gap-2">
            <Bookmark className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tersimpan</span>
          </Button>
          <Link href="/chat">
            <Button size="sm" className="h-9 px-3 gap-2 shadow-none">
              <Sparkles className="h-3.5 w-3.5" />
              AI Recomendation
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border border-border shadow-none">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cari Beasiswa</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input 
                  placeholder="Nama program..." 
                  className="w-full pl-8 pr-3 py-1.5 rounded-md bg-muted/50 border-none text-xs focus:ring-1 focus:ring-primary outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Kategori</label>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className="bg-primary text-primary-foreground text-[10px] h-4 px-2">Semua</Badge>
                  <Badge variant="outline" className="text-[10px] h-4 px-2">Prestasi</Badge>
                  <Badge variant="outline" className="text-[10px] h-4 px-2">Ekonomi</Badge>
                  <Badge variant="outline" className="text-[10px] h-4 px-2">Vokasi</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-amber-500/5 shadow-none p-4">
            <div className="space-y-3">
              <div className="p-2 rounded-md bg-amber-500/10 text-amber-600 w-fit">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide">Tips Lolos Beasiswa</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                  Rata-rata beasiswa vokasi sangat melihat nilai rapor semester 1-5 dan sertifikat keahlian industri (LSP).
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main List */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold">Program Tersedia</h2>
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
              {filteredScholarships.length} Beasiswa
            </span>
          </div>

          {filteredScholarships.map((s) => (
            <Card key={s.id} className="border border-border shadow-none hover:bg-accent/30 transition-colors group overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-stretch">
                  <div className="flex flex-col items-center justify-center p-4 bg-muted/30 w-full sm:w-32 shrink-0 border-b sm:border-b-0 sm:border-r border-border/50 text-center">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground mb-1" />
                    <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-tighter">Deadline</span>
                    <span className="text-[11px] font-bold mt-0.5">
                      {new Date(s.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="p-4 flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{s.name}</h3>
                          <Badge variant="secondary" className="text-[9px] h-3.5 px-1.5 font-bold uppercase bg-blue-500/10 text-blue-600 border-none">{s.type}</Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <School className="h-3 w-3" />
                          {s.provider}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Detail
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-1 pt-2 border-t border-border/30">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3 text-primary/70" />
                        Nasional
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                        <GraduationCap className="h-3 w-3 text-primary/70" />
                        {s.benefit}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredScholarships.length === 0 && (
            <div className="text-center py-16 bg-muted/10 rounded-lg border border-dashed border-border">
              <p className="text-xs text-muted-foreground italic">Belum ada beasiswa yang ditemukan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
