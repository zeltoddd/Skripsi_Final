import React from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { MapPin, Briefcase, DollarSign, Clock, ExternalLink, Search } from 'lucide-react';
import { JOBS } from '../../services/RAG_SETUP';

const JobBoard: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Lowongan Kerja & DUDI</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Daftar mitra industri (DU/DI) dan lowongan terbaru untuk siswa & alumni SMK.
        </p>
      </div>

      {/* Search bar placeholder */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground">
        <Search className="h-4 w-4 shrink-0" />
        <span>Cari perusahaan, bidang industri, atau lokasi...</span>
      </div>

      <Separator />

      {/* Job List */}
      <div className="space-y-2">
        {JOBS.map((job) => (
          <div
            key={job.id}
            className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors group"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-md bg-muted border border-border flex items-center justify-center font-semibold text-sm shrink-0">
              {job.company.charAt(0)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold leading-tight">{job.title}</p>
                  <p className="text-xs text-muted-foreground">{job.company}</p>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 shrink-0 hidden sm:flex">
                  Detail <ExternalLink className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />{job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />{job.type}
                </span>
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <DollarSign className="h-3 w-3" />{job.salary}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />{job.posted}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 pt-0.5">
                {job.major.map((m) => (
                  <Badge key={m} variant="secondary" className="text-[10px] h-4 px-1.5 font-medium uppercase">
                    {m}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobBoard;
