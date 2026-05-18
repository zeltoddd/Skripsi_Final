// components/auth/Login.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn } from "next-auth/react";
import { SMK_MAJORS } from '@/constants/majors';



function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function Login() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [kelas, setKelas] = useState('');
  const [major, setMajor] = useState('');
  const [hobby, setHobby] = useState('');

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !kelas || !major) return;

    const guestProfile = { name, kelas, major, hobby };
    localStorage.setItem('vokara_guest_profile', JSON.stringify(guestProfile));
    router.push('/chat');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="text-center space-y-3 flex flex-col items-center justify-center">
          <img
            src="/vokara-stacked.svg"
            alt="VOKARA Logo"
            className="w-52 h-auto dark:invert"
          />
          <p className="text-sm text-muted-foreground">
            Mulai bimbingan karirmu sekarang
          </p>
        </div>

        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 px-4 space-y-2">

            <form onSubmit={handleStart} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs">Nama Panggilan</Label>
                <Input
                  id="name"
                  placeholder="Misal: Budi"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="h-12 text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="kelas" className="text-xs">Kelas</Label>
                  <Select value={kelas} onValueChange={setKelas} required>
                    <SelectTrigger className="h-12 w-full text-sm">
                      <SelectValue placeholder="Pilih Kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="X">Kelas X</SelectItem>
                      <SelectItem value="XI">Kelas XI</SelectItem>
                      <SelectItem value="XII">Kelas XII</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="major" className="text-xs">Jurusan</Label>
                  <Select value={major} onValueChange={setMajor} required>
                    <SelectTrigger className="h-12 w-full text-sm">
                      <SelectValue placeholder="Pilih Jurusan" />
                    </SelectTrigger>
                    <SelectContent>
                      {SMK_MAJORS.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hobby" className="text-xs">Hobi / Minat (Opsional)</Label>
                <Input
                  id="hobby"
                  placeholder="Misal: Editing video, main game"
                  value={hobby}
                  onChange={e => setHobby(e.target.value)}
                  className="h-12 text-sm"
                />
              </div>
              <Button type="submit" className="w-full h-12 mt-4" size="lg" disabled={!name || !kelas || !major}>
                Mulai Chat Sekarang
                <ArrowRight className="h-3.5 w-3.5 ml-2" />
              </Button>
            </form>

            <div className="relative ">
              <div className="absolute inset-0 flex items-center ">
              </div>
              <div className="relative flex justify-center text-xs text-muted-foreground ">
                <span className="bg-card px-2">atau</span>
              </div>
            </div>

            {/* Google Sign-In */}
            <Button
              className="w-full h-12 gap-2.5"
              size="lg"
              variant="outline"
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/chat' })}
            >
              <GoogleIcon className="h-4 w-4" />
              Masuk dengan Google
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Dengan masuk, kamu menyetujui{' '}
          <span className="underline underline-offset-4 cursor-pointer hover:text-foreground transition-colors">
            Ketentuan Layanan
          </span>
          {' '}kami.
        </p>
      </div>
    </div>
  );
}
