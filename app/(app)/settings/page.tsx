'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SMK_MAJORS } from '@/constants/majors';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const user = session?.user as any;
  const router = useRouter();
  const [name, setName] = useState(user?.name || '');
  const [grade, setGrade] = useState(user?.grade || 'X');
  const [major, setMajor] = useState(user?.major || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, grade, major }),
        credentials: 'include',
      });
      if (res.ok) {
        await update();
        toast.success('Profil berhasil diperbarui');
      } else {
        toast.error('Gagal memperbarui profil');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan Profil</h1>
        <p className="text-muted-foreground">Ubah informasi pribadi dan preferensi.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="major">Jurusan</Label>
          <Select value={major} onValueChange={setMajor} disabled={saving}>
            <SelectTrigger id="major">
              <SelectValue placeholder="Pilih jurusan" />
            </SelectTrigger>
            <SelectContent>
              {SMK_MAJORS.map((m) => (
                <SelectItem key={m.id} value={m.label}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="grade">Kelas</Label>
          <Select value={grade} onValueChange={setGrade} disabled={saving}>
            <SelectTrigger id="grade">
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
        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}
