import React from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Calendar, GraduationCap, DollarSign, Phone, ExternalLink } from 'lucide-react';
import { Scholarship, SCHOLARSHIPS } from '../../services/RAG_SETUP';

interface ScholarshipListProps {
  major?: string;
}

const ScholarshipList: React.FC<ScholarshipListProps> = ({ major }) => {
  const filteredScholarships = SCHOLARSHIPS.filter(s =>
    !major || s.major.length === 0 || s.major.includes(major.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Beasiswa</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Beasiswa dari mitra industri dan instansi untuk siswa SMK.
        </p>
      </div>

      <Separator />

      {/* List */}
      <div className="space-y-3">
        {filteredScholarships.map((s) => (
          <div key={s.id} className="p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors">
            {/* Top Row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold leading-tight">{s.name}</p>
                  <Badge
                    variant={s.type === 'prestasi' ? 'default' : 'secondary'}
                    className="text-[10px] h-4 px-1.5 capitalize"
                  >
                    {s.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{s.provider}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <Calendar className="h-3 w-3" />
                {new Date(s.deadline).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <DollarSign className="h-3 w-3" />{s.benefit}
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-3 w-3" />
                {s.major.length === 0 ? (
                  'Semua jurusan'
                ) : (
                  s.major.map((m, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] h-4 px-1.5 uppercase">
                      {m}
                    </Badge>
                  ))
                )}
              </span>
            </div>

            {/* Requirements */}
            <div className="mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Persyaratan</p>
              <ul className="text-xs text-muted-foreground space-y-0.5 list-disc pl-4">
                {s.requirements.map((req, i) => <li key={i}>{req}</li>)}
              </ul>
            </div>

            {/* Action */}
            <Button size="sm" className="h-7 text-xs gap-1.5">
              <Phone className="h-3 w-3" />
              Hubungi {s.contact}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScholarshipList;
