'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
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
import { motion } from 'framer-motion';
import { ChevronLeft, Trash2, LogOut } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function SettingsPage() {
  const { data: session, update, status } = useSession();
  const user = session?.user as any;
  const router = useRouter();

  const { sessions, refreshSessions, clearGuestSessions } = useChat();
  const [deletingChats, setDeletingChats] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [name, setName] = useState('');
  const [grade, setGrade] = useState('X');
  const [major, setMajor] = useState('');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync state with session data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setGrade(user.grade || 'X');
      setMajor(user.major || '');
    }
  }, [user]);

  // Track if changes have been made
  useEffect(() => {
    if (user) {
      const isChanged =
        name !== (user.name || '') ||
        grade !== (user.grade || 'X') ||
        major !== (user.major || '');
      setHasChanges(isChanged);
    }
  }, [name, grade, major, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Nama lengkap tidak boleh kosong');
      return;
    }

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
        setHasChanges(false);
      } else {
        toast.error('Gagal memperbarui profil');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan koneksi');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (user) {
      setName(user.name || '');
      setGrade(user.grade || 'X');
      setMajor(user.major || '');
      toast.info('Perubahan dibatalkan');
    }
  };

  const handleDeleteAllChats = async () => {
    setDeletingChats(true);
    try {
      if (status === 'unauthenticated') {
        if (clearGuestSessions) {
          clearGuestSessions();
        }
        toast.success('Semua riwayat chat berhasil dihapus');
        setShowDeleteConfirm(false);
        return;
      }

      const res = await fetch('/api/chat/sessions', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        await refreshSessions();
        toast.success('Semua riwayat chat berhasil dihapus');
        setShowDeleteConfirm(false);
      } else {
        toast.error('Gagal menghapus riwayat chat');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan koneksi');
    } finally {
      setDeletingChats(false);
    }
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await signOut({ callbackUrl: '/login' });
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground font-medium animate-pulse">Memuat pengaturan...</p>
      </div>
    );
  }

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-6"
    >
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1"
          >
            <ChevronLeft className="h-3 w-3" />
            Kembali
          </button>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Pengaturan Profil</h1>
        </div>
      </div>

      {/* Main Container Card (Spacious flat design, no shadow) */}
      <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">

        {/* Profile Card Header Row */}
        <div className="p-6 flex items-center gap-4 bg-muted/20">
          {user?.image ? (
            <img
              src={user.image}
              alt={name}
              className="h-14 w-14 rounded-full object-cover border border-border shrink-0 bg-muted"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0 border border-primary/20">
              {initials}
            </div>
          )}
          <div className="space-y-0.5 min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate">{name || 'Siswa SMK'}</h2>
            <p className="text-xs text-muted-foreground truncate">{user?.email || 'siswa@vokara.id'}</p>
          </div>
        </div>

        {/* Input Form Fields */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-card">

          {/* Name input */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium text-foreground/80">
              Nama Lengkap
            </Label>
            <Input
              id="name"
              placeholder="Ketik nama lengkap..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              required
              className="rounded-lg border-border bg-background h-10 text-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-colors"
            />
          </div>

          {/* Major Select */}
          <div className="space-y-1.5">
            <Label htmlFor="major" className="text-xs font-medium text-foreground/80">
              Jurusan SMK
            </Label>
            <Select value={major} onValueChange={setMajor} disabled={saving}>
              <SelectTrigger id="major" className="rounded-lg border-border bg-background h-10 text-sm focus:ring-0 focus:border-primary transition-colors">
                <SelectValue placeholder="Pilih jurusan sekolah..." />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-border">
                {SMK_MAJORS.map((m) => (
                  <SelectItem key={m.id} value={m.label} className="text-sm rounded-md py-1.5 cursor-pointer">
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grade Select */}
          <div className="space-y-1.5">
            <Label htmlFor="grade" className="text-xs font-medium text-foreground/80">
              Tingkat Kelas
            </Label>
            <Select value={grade} onValueChange={setGrade} disabled={saving}>
              <SelectTrigger id="grade" className="rounded-lg border-border bg-background h-10 text-sm focus:ring-0 focus:border-primary transition-colors">
                <SelectValue placeholder="Pilih tingkatan..." />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-border">
                <SelectItem value="X" className="text-sm rounded-md py-1.5 cursor-pointer">X (Kelas 10)</SelectItem>
                <SelectItem value="XI" className="text-sm rounded-md py-1.5 cursor-pointer">XI (Kelas 11)</SelectItem>
                <SelectItem value="XII" className="text-sm rounded-md py-1.5 cursor-pointer">XII (Kelas 12)</SelectItem>
                <SelectItem value="Alumni" className="text-sm rounded-md py-1.5 cursor-pointer">Alumni / Lulusan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={handleReset}
              className="rounded-lg h-9 px-4 text-xs font-medium hover:bg-muted active:scale-[0.98] transition-all"
            >
              Batal
            </Button>

            <Button
              type="submit"
              disabled={saving || !hasChanges}
              className="rounded-lg h-9 px-4 text-xs font-medium active:scale-[0.98] transition-all bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>

      </div>

      {/* Account & Chat Management Card */}
      <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
        {/* Title/Header for Danger/Account Zone */}
        <div className="p-6 bg-muted/20">
          <h3 className="text-sm font-semibold text-foreground">Akun & Riwayat Chat</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Kelola riwayat percakapan dan sesi login Anda di Vokara.</p>
        </div>

        {/* Action Items List */}
        <div className="p-6 space-y-5 bg-card">
          {/* Row 1: Delete History */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-foreground tracking-tight  text-destructive/90">Hapus Riwayat Chat</h4>
              <p className="text-[12px] text-muted-foreground">Menghapus seluruh sesi percakapan Anda. Tindakan ini tidak bisa dibatalkan.</p>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deletingChats || sessions.length === 0}
              className="rounded-lg h-12 px-4 text-xs font-bold shrink-0 active:scale-[0.98] transition-all bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground border border-destructive/20 disabled:opacity-40 disabled:hover:bg-destructive/10 disabled:hover:text-destructive shrink-0"
            >
              Hapus Semua Chat
            </Button>
          </div>

          {/* Row 2: Logout */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-border/60">
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-foreground tracking-tight ">Sesi Login</h4>
              <p className="text-[12px] text-muted-foreground">Keluar dari sesi akun aktif Anda pada perangkat ini.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowLogoutConfirm(true)}
              className="rounded-lg h-12 px-4 text-xs font-bold shrink-0 active:scale-[0.98] transition-all hover:bg-muted border-border text-foreground/80 hover:text-foreground shrink-0"
            >
              Keluar Akun
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent size="default">
          <AlertDialogHeader className='pt-3'>
            <AlertDialogMedia className="bg-destructive/10 text-destructive rounded-lg p-2.5">
              <Trash2 className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-base font-semibold">Hapus Semua Riwayat Chat?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Tindakan ini akan menghapus seluruh sesi percakapan Anda di Vokara. Semua pesan yang sudah dikirim atau diterima tidak akan bisa dipulihkan kembali.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={deletingChats} className="rounded-lg h-12 text-xs font-semibold">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deletingChats}
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAllChats();
              }}
              className="rounded-lg h-12 text-xs font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deletingChats ? 'Menghapus...' : 'Ya, Hapus Semua'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent size="default">
          <AlertDialogHeader className='pt-4'>
            <AlertDialogMedia className="bg-muted text-foreground rounded-lg p-2.5">
              <LogOut className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-base font-semibold">Keluar dari Vokara?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Apakah Anda yakin ingin mengakhiri sesi aktif Anda saat ini pada perangkat ini? Anda harus login kembali untuk mengakses bimbingan karir Anda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-lg h-12 text-xs font-semibold">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              variant="default"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              className="rounded-lg h-12 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Ya, Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
