'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Map, 
  Briefcase, 
  GraduationCap,
  LogOut,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/constants';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'VOKARA Chat',
    href: '/chat',
    icon: MessageSquare,
  },
  {
    name: 'CV Builder',
    href: '/cv-builder',
    icon: FileText,
  },
  {
    name: 'Peta Karir',
    href: '/career-path',
    icon: Map,
  },
  {
    name: 'Loker SMK',
    href: '/jobs',
    icon: Briefcase,
  },
  {
    name: 'Beasiswa',
    href: '/scholarships',
    icon: GraduationCap,
  },
];

export default function ChatNavigationSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-full bg-white border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-spring-green-500 flex items-center justify-center shadow-lg shadow-spring-green-500/20">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight leading-none text-foreground">
              {APP_NAME}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-1">
              Bimbingan Karir
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-spring-green-100 text-spring-green-900 font-semibold'
                  : 'text-foreground/70 hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Card */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
          <Avatar className="h-10 w-10 border-2 border-spring-green-200">
            <AvatarImage src="/avatar.jpg" alt="User" />
            <AvatarFallback className="bg-spring-green-100 text-spring-green-900 font-bold text-sm">
              ZR
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-foreground">
              Ziyad Robith
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Premium Partner
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}