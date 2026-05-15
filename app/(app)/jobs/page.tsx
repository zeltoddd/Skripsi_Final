// app/(app)/jobs/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Building2, 
  Clock, 
  Filter,
  ArrowUpRight,
  Sparkles,
  Zap,
  ChevronRight
} from 'lucide-react';
import { JOBS } from '@/services/RAG_SETUP';
import Link from 'next/link';

export default function JobBoardPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredJobs = JOBS.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topCompanies = Array.from(new Set(JOBS.map(j => j.company))).slice(0, 5);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Eksplorasi Karir</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Temukan lowongan magang dan kerja sesuai keahlian SMK-mu.
          </p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="Cari loker..." 
              className="pl-8 h-9 text-xs rounded-md border-border/60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 px-3 gap-2">
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Semua Lowongan</h2>
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
              {filteredJobs.length} Tersedia
            </span>
          </div>

          <div className="space-y-2">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="border border-border shadow-none hover:bg-accent/50 transition-colors cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0 border border-border/50">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold leading-tight">{job.title}</h4>
                          <Badge variant="secondary" className="text-[9px] h-3.5 px-1.5 font-bold uppercase tracking-tighter bg-primary/10 text-primary border-none">
                            Matching
                          </Badge>
                        </div>
                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-muted-foreground">{job.company}</p>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5">
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Briefcase className="h-3 w-3" />
                          {job.type}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <Zap className="h-3 w-3 fill-emerald-600/20" />
                          {job.salary}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredJobs.length === 0 && (
              <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed border-border">
                <p className="text-xs text-muted-foreground italic">Tidak ada lowongan yang ditemukan.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-6">
          {/* AI Insight Card */}
          <Card className="border border-border shadow-none bg-primary/5">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                AI Career Insight
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                "Berdasarkan trend saat ini, lulusan <strong>SMK RPL</strong> banyak dicari untuk posisi <strong>Frontend React</strong>. Pastikan CV-mu mencantumkan project nyata menggunakan Next.js."
              </p>
              <Link href="/chat">
                <Button variant="link" className="p-0 h-auto text-primary text-xs font-bold gap-1 mt-3">
                  Tanya Kak Karir detailnya
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Top Companies Widget */}
          <div>
            <h2 className="text-sm font-semibold mb-3">Top Perusahaan</h2>
            <div className="space-y-2">
              {topCompanies.map((c) => (
                <div key={c} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center text-[10px] font-bold">
                      {c.charAt(0)}
                    </div>
                    <span className="text-xs font-medium">{c}</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] h-4 px-1.5 opacity-60">Aktif</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
