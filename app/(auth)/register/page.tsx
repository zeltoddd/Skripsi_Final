// app/(auth)/register/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { MessageSquare, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/30 mb-4 -rotate-3 hover:rotate-0 transition-transform duration-500">
            <MessageSquare className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Buat Akun Baru</h1>
          <p className="text-muted-foreground">Mulai langkah pertamamu menuju karir impian.</p>
        </div>

        <Card className="rounded-[2.5rem] border-border/50 shadow-2xl overflow-hidden">
          <CardHeader className="space-y-1 pt-10 px-10">
            <CardTitle className="text-xl font-bold">Daftar Sekarang</CardTitle>
            <CardDescription>Bergabunglah dengan ribuan siswa SMK lainnya.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-10 pb-8">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" placeholder="Ziyad Robith" className="rounded-xl h-11 bg-muted/30 border-none focus-visible:ring-primary/30" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="nama@sekolah.sch.id" className="rounded-xl h-11 bg-muted/30 border-none focus-visible:ring-primary/30" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" className="rounded-xl h-11 bg-muted/30 border-none focus-visible:ring-primary/30" />
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50 mt-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Dengan mendaftar, kamu menyetujui <strong>Syarat & Ketentuan</strong> serta <strong>Kebijakan Privasi</strong> KarirSMK.
              </p>
            </div>

            <Link href="/onboarding">
              <Button className="w-full rounded-2xl h-14 text-lg font-bold gap-2 shadow-lg shadow-primary/20 mt-4">
                Daftar & Lanjutkan
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t border-border/50 p-6 flex justify-center">
            <p className="text-sm text-muted-foreground font-medium">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-primary font-black hover:underline">Masuk Saja</Link>
            </p>
          </CardFooter>
        </Card>

        <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase font-black tracking-widest">
          <Sparkles className="h-3 w-3" />
          Masa Depan Menantimu
          <Sparkles className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
}
