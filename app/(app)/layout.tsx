// app/(app)/layout.tsx
'use client';

import React from 'react';
import { flushSync } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut, signIn } from "next-auth/react";
import { useTheme } from 'next-themes';
import {
  MessageSquare,
  MessageSquarePlus,
  LogOut,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Trash2,
  Plus,
  Clock,
  PanelLeft,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useChat } from '@/context/ChatContext';

// No active nav items array (Settings and Theme Toggle rendered in footer)

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;
  const { theme, setTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);
  const {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    deleteSession,
    createNewChat,
    hasGuestSessions,
    mergeGuestSessions,
    clearGuestSessions
  } = useChat();

  React.useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    if (pathname !== '/chat') {
      router.push('/chat');
    }
  };

  const handleNewChat = React.useCallback(() => {
    createNewChat();
    if (pathname !== '/chat/new') {
      router.push('/chat/new');
    }
  }, [createNewChat, pathname, router]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcut if user is typing in inputs or textareas
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.getAttribute('contenteditable') === 'true'
      )) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewChat]);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const getHeaderTitle = () => {
    if (pathname.startsWith('/chat')) {
      if (currentSession && currentSession.title) {
        return currentSession.title;
      }
      return 'Chat Baru';
    }
    if (pathname.startsWith('/settings')) {
      return 'Pengaturan';
    }
    return 'VOKARA';
  };
  const headerTitle = getHeaderTitle();

  // Group sessions by exact relative time ranges
  const groupedSessions = sessions.reduce((acc: Record<string, typeof sessions>, session) => {
    const date = new Date(session.lastMessageAt);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const diffMs = today.getTime() - date.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);

    let group = 'Dulu';
    if (diffHrs < 1) group = '1 Jam Terakhir';
    else if (diffHrs < 3) group = '3 Jam Terakhir';
    else if (diffHrs < 12) group = '12 Jam Terakhir';
    else if (date.toDateString() === today.toDateString()) group = 'Hari Ini';
    else if (date.toDateString() === yesterday.toDateString()) group = 'Kemarin';
    else if (diffMs < 7 * 24 * 60 * 60 * 1000) group = '7 Hari Terakhir';

    if (!acc[group]) acc[group] = [];
    acc[group].push(session);
    return acc;
  }, {});

  const groupsOrder = [
    '1 Jam Terakhir',
    '3 Jam Terakhir',
    '12 Jam Terakhir',
    'Hari Ini',
    'Kemarin',
    '7 Hari Terakhir',
    'Dulu'
  ];


  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    // Create a full-screen overlay that fades out — zero zoom, zero squish
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 99999;
      pointer-events: none;
      background: ${theme === 'dark' ? '#ffffff' : '#09090b'};
      opacity: 0;
      transition: opacity 200ms ease-in-out;
    `;
    document.body.appendChild(overlay);

    // Fade overlay in
    requestAnimationFrame(() => {
      overlay.style.opacity = '0.15';
    });

    setTimeout(() => {
      // Instantly switch theme while overlay covers
      const css = document.createElement('style');
      css.appendChild(
        document.createTextNode(
          `*:not(.theme-spin-wrapper):not(.theme-spin-wrapper *) {
             transition: none !important;
          }`
        )
      );
      document.head.appendChild(css);

      flushSync(() => {
        setTheme(nextTheme);
      });

      // Force layout recalc then remove mute
      void document.body.offsetHeight;
      document.head.removeChild(css);

      // Fade overlay out
      overlay.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 200);
    }, 120);
  };


  // Generate initials from user name
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar border-r border-sidebar-border transition-all duration-[220ms] ease-in-out flex flex-col z-50 fixed inset-y-0 left-0 lg:relative shrink-0 overflow-hidden w-[240px]",
          isCollapsed ? "lg:w-[56px]" : "lg:w-[240px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar Header - Toggle Button */}
        <div className={cn(
          "h-16 flex items-center border-b border-sidebar-border shrink-0 transition-all duration-[220ms] ease-in-out",
          isCollapsed ? "justify-center px-3" : "justify-between px-3.5"
        )}>
          <div className={cn(
            "transition-all duration-[220ms] ease-in-out overflow-hidden whitespace-nowrap flex items-center min-w-0 flex-1",
            isCollapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-[150px] opacity-100 pr-2"
          )}>
            <img
              src="/vokara_horizontal.svg"
              alt="VOKARA"
              className="h-[20px] ml-2.5 w-auto shrink-0 dark:invert animate-in fade-in slide-in-from-left-2 duration-[220ms]"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
            onClick={() => {
              if (window.innerWidth < 1024) {
                setIsMobileOpen(false);
              } else {
                setIsCollapsed(!isCollapsed);
              }
            }}
          >
            {isMobileOpen || !isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <PanelLeft className="h-4 w-4 " />}
          </Button>
        </div>



        {/* Navigation */}
        <nav className="flex-1 flex flex-col min-h-0 py-4 space-y-3 px-3 overflow-hidden">
          {/* New Chat Button */}
          <Button
            variant="ghost"
            onClick={handleNewChat}
            title="New Chat (Ctrl + K)"
            className={cn(
              "w-full transition-all duration-[220ms] ease-in-out rounded-lg active:scale-[0.98] overflow-hidden flex items-center shrink-0 group",
              isCollapsed
                ? "border border-transparent hover:text-sidebar-foreground hover:bg-sidebar-accent shadow-none px-0 h-8 justify-center"
                : "border border-sidebar-border bg-background/50 hover:bg-sidebar-accent shadow-2xs px-3 h-12 justify-start"
            )}
          >
            <div className={cn(
              "flex items-center min-w-0 animate-in fade-in slide-in-from-left-2 duration-[220ms]",
              isCollapsed ? "justify-center pl-2 w-full" : "w-full"
            )}>
              <MessageSquarePlus className="h-[18px] w-[18px] text-sidebar-foreground/70 shrink-0 stroke-[2px] " />

              <span className={cn(
                "font-bold text-[13px] tracking-tight text-sidebar-foreground/95 truncate transition-all duration-[220ms] ease-in-out overflow-hidden whitespace-nowrap",
                isCollapsed ? "max-w-0 opacity-0 ml-0 pointer-events-none" : "max-w-[100px] opacity-100 ml-2.5"
              )}>
                New Chat
              </span>

              {/* Shortcuts */}
              <div className={cn(
                "flex items-center gap-1 shrink-0 transition-all duration-[220ms] ease-in-out overflow-hidden whitespace-nowrap ml-auto",
                isCollapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-[70px] opacity-100"
              )}>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-sidebar-border bg-sidebar-accent/60 px-1.5 font-mono text-[9px] font-semibold text-sidebar-foreground/50 shadow-[0_1px_0px_rgba(0,0,0,0.05)]">
                  Ctrl
                </kbd>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-sidebar-border bg-sidebar-accent/60 px-1.5 font-mono text-[9px] font-semibold text-sidebar-foreground/50 shadow-[0_1px_0px_rgba(0,0,0,0.05)]">
                  K
                </kbd>
              </div>
            </div>
          </Button>

          {/* Chat History Section */}
          <div className={cn(
            "transition-all duration-[220ms] ease-in-out overflow-hidden flex flex-col min-h-0 flex-1",
            isCollapsed ? "max-h-0 opacity-0 pointer-events-none mt-0" : "max-h-[1000px] opacity-100 mt-2"
          )}>
            <div
              className="flex items-center justify-between px-3 pb-2 select-none shrink-0 w-full cursor-pointer group/history"
              onClick={() => setIsHistoryCollapsed(!isHistoryCollapsed)}
              title={isHistoryCollapsed ? "Buka Riwayat Chat" : "Tutup Riwayat Chat"}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-sidebar-foreground/70 shrink-0 stroke-[2px] group-hover/history:text-sidebar-foreground transition-colors" />
                <p className="text-[13px] font-bold ml-1.5 text-sidebar-foreground/85 tracking-tight group-hover/history:text-sidebar-foreground transition-colors">Chat History</p>
              </div>
              <ChevronDown className={cn(
                "h-3.5 w-3.5 text-sidebar-foreground/45 shrink-0 stroke-[2px] transition-transform duration-[220ms] ease",
                isHistoryCollapsed && "-rotate-90"
              )} />
            </div>

            <div
              style={{
                flexGrow: isHistoryCollapsed ? 0 : 1,
                flexShrink: isHistoryCollapsed ? 0 : 1,
                flexBasis: isHistoryCollapsed ? '0px' : '0%',
                transition: 'all 220ms ease'
              }}
              className={cn(
                "overflow-y-auto scrollbar-hide px-3 pb-2 min-h-0 relative",
                isHistoryCollapsed ? "opacity-0 pointer-events-none mt-0 pb-0" : "opacity-100 mt-4"
              )}
            >
              {!mounted ? (
                <div className="space-y-3 mt-2 pl-6">
                  <div className="h-4 w-28 bg-sidebar-foreground/5 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-sidebar-foreground/5 rounded animate-pulse" />
                </div>
              ) : sessions.length === 0 ? (
                <p className="pl-6 py-2 text-[12px] text-muted-foreground/45 italic">Belum ada chat...</p>
              ) : (
                <div className="relative w-full space-y-5">
                  {/* Vertical Timeline Line */}
                  <div className="absolute left-[8px] -translate-x-1/2 top-[-10px] bottom-[16px] w-[2px] bg-sidebar-border/50 z-0 pointer-events-none" />

                  {groupsOrder.map(group => {
                    const items = groupedSessions[group];
                    if (!items || items.length === 0) return null;

                    return (
                      <div key={group} className="space-y-1.5 relative w-full">
                        {/* Timeline Header Row (Title + Bottom Underline Divider) */}
                        <div className="relative flex flex-col w-full pl-7.5 select-none">
                          {/* Circle Node (Dot) */}
                          <div className="absolute left-[8px] -translate-x-1/2 top-[5px] w-1.5 h-1.5 rounded-full bg-sidebar-foreground/30 z-10" />

                          {/* Text */}
                          <span className="text-[12px] font-medium text-sidebar-foreground/40 tracking-tight pb-1">
                            {group}
                          </span>

                          {/* Horizontal Underline Divider */}
                          <div className="h-[1px] mt-1 bg-sidebar-border/30 w-full" />
                        </div>

                        {/* Chat Items List under this category */}
                        <div className="space-y-0.5 pl-7.5">
                          {items.map((session) => (
                            <div
                              key={session.id}
                              className={cn(
                                "group flex items-center h-[32px] px-2.5 -mx-2.5 rounded-lg cursor-pointer transition-all duration-150 active:scale-[0.98]",
                                currentSessionId === session.id
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                                  : "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent/30 font-medium"
                              )}
                              onClick={() => handleSelectSession(session.id)}
                            >
                              <span className="flex-1 truncate text-[12px] tracking-wide">
                                {session.title || 'Chat Baru'}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 rounded-md transition-all shrink-0 ml-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSession(session.id);
                                }}
                                title="Hapus Chat"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Sidebar Footer — User Profile, Settings & Dark Mode */}
        <div className="border-t border-sidebar-border p-3 shrink-0 flex flex-col transition-all duration-[220ms] ease-in-out overflow-hidden w-full">
          {/* Actions for COLLAPSED state (Vertical ABOVE avatar) */}
          <div className={cn(
            "flex flex-col gap-2 transition-all duration-[220ms] ease-in-out overflow-hidden whitespace-nowrap w-full items-center",
            isCollapsed ? "max-h-[80px] opacity-100 mb-3" : "max-h-0 opacity-0 pointer-events-none mb-0"
          )}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleTheme}
              className="h-7 w-7 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent border border-sidebar-border/20 transition-all active:scale-[0.95] flex items-center justify-center overflow-hidden shrink-0"
              title={mounted && theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            >
              <div className={cn(
                "transition-transform duration-500 ease-out flex items-center justify-center theme-spin-wrapper",
                mounted && theme === 'dark' ? "rotate-[360deg]" : "rotate-0"
              )}>
                {mounted && theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </div>
            </Button>

            <Link href="/settings" className="shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent border border-sidebar-border/20 transition-all active:scale-[0.95]"
                title="Pengaturan"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {/* Main profile & actions row */}
          <div className="flex items-center justify-between w-full min-w-0">
            {user ? (
              <div className={cn(
                "flex items-center min-w-0 flex-1",
                isCollapsed && "justify-center"
              )}>
                {user?.image ? (
                  <img
                    src={user.image}
                    alt=""
                    className={cn(
                      "rounded-full object-cover border border-border shrink-0 transition-all duration-[220ms] ease-in-out",
                      isCollapsed ? "w-7 h-7" : "w-8 h-8"
                    )}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={cn(
                    "rounded-full bg-muted border border-border flex items-center justify-center font-semibold shrink-0 transition-all duration-[220ms] ease-in-out",
                    isCollapsed ? "w-7 h-7 text-[10px]" : "w-8 h-8 text-[11px]"
                  )}>
                    {initials}
                  </div>
                )}
                <div className={cn(
                  "flex-1 min-w-0 transition-all duration-[220ms] ease-in-out overflow-hidden flex flex-col justify-center whitespace-nowrap pt-[2px]",
                  isCollapsed ? "max-w-0  opacity-0 ml-0 pointer-events-none" : "max-w-[120px] opacity-100 ml-2.5"
                )}>
                  <p className="text-[12.5px] font-bold truncate text-sidebar-foreground leading-snug mb-[1px]">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate leading-normal">
                    {(() => {
                      const m = (user as any).major || 'Siswa';
                      if (m.toLowerCase().includes('komputer dan jaringan') || m.toLowerCase() === 'tkj') return 'TKJ';
                      if (m.toLowerCase().includes('perangkat lunak') || m.toLowerCase() === 'rpl') return 'RPL';
                      if (m.toLowerCase().includes('multimedia') || m.toLowerCase() === 'mm') return 'MM';
                      if (m.toLowerCase().includes('desain komunikasi visual') || m.toLowerCase() === 'dkv') return 'DKV';
                      if (m.toLowerCase().includes('audio video') || m.toLowerCase() === 'tav') return 'TAV';
                      if (m.toLowerCase().includes('pemesinan') || m.toLowerCase() === 'tpm') return 'TPM';
                      if (m.toLowerCase().includes('kendaraan ringan') || m.toLowerCase() === 'tkr') return 'TKR';
                      return m.slice(0, 12) + (m.length > 12 ? '..' : '');
                    })()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center min-w-0 flex-1">
                <Button
                  variant={isCollapsed ? "ghost" : "outline"}
                  className={cn(
                    "rounded-lg border bg-background hover:bg-muted text-foreground/80 hover:text-foreground text-[11px] font-bold shadow-sm transition-all duration-[220ms] ease-in-out overflow-hidden flex items-center justify-center shrink-0",
                    isCollapsed
                      ? "w-7 h-7 p-0 border-sidebar-border bg-muted"
                      : "w-full h-7 px-2 gap-1.5 border-border bg-background"
                  )}
                  onClick={() => signIn('google')}
                  title={isCollapsed ? "Login" : undefined}
                >
                  <svg className="h-[11px] w-[11px] shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className={cn(
                    "transition-all duration-[220ms] ease-in-out overflow-hidden whitespace-nowrap",
                    isCollapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-[60px] opacity-100 ml-1.5"
                  )}>
                    Login
                  </span>
                </Button>
              </div>
            )}

            {/* Actions for EXPANDED state (Horizontal) */}
            <div className={cn(
              "flex items-center gap-1 shrink-0 transition-all duration-[220ms] ease-in-out overflow-hidden whitespace-nowrap",
              isCollapsed ? "max-w-0 opacity-0 pointer-events-none ml-0" : "max-w-[70px] opacity-100 ml-2"
            )}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleTheme}
                className="h-7 w-7 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent border border-sidebar-border/20 transition-all active:scale-[0.95] flex items-center justify-center overflow-hidden"
                title={mounted && theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
              >
                <div className={cn(
                  "transition-transform duration-500 ease-out flex items-center justify-center theme-spin-wrapper",
                  mounted && theme === 'dark' ? "rotate-[360deg]" : "rotate-0"
                )}>
                  {mounted && theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                </div>
              </Button>

              <Link href="/settings">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent border border-sidebar-border/20 transition-all active:scale-[0.95]"
                  title="Pengaturan"
                >
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-border shrink-0 bg-background/80 backdrop-blur-md z-30">
          <div className="max-w-2xl mx-auto w-full h-full flex items-center justify-between px-4 relative">

            {/* Left Section: Unified Sidebar Trigger, Separator & Truncated Title */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground shrink-0 rounded-lg hover:bg-muted transition-colors lg:hidden"
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setIsMobileOpen(!isMobileOpen);
                  } else {
                    setIsCollapsed(!isCollapsed);
                  }
                }}
                title="Toggle Sidebar"
              >
                <PanelLeft className="h-[18px] w-[18px]" />
              </Button>

              <div className="h-4 w-px bg-border/60 shrink-0 mx-1 lg:hidden" />

              <span
                className={cn(
                  "text-sm font-semibold text-foreground pl-1 md:pl-0 max-md:truncate max-md:max-w-[180px]",
                  "md:absolute md:left-1/2 md:-translate-x-1/2 md:text-center md:whitespace-normal md:max-w-[480px]"
                )}
                title={headerTitle}
              >
                {headerTitle}
              </span>
            </div>

            {/* Right Section: New Chat Plus Button (Mobile-only) */}
            <div className="flex items-center gap-2 shrink-0 lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={handleNewChat}
                title="Chat Baru"
              >
                <Plus className="h-[18px] w-[18px]" />
              </Button>
            </div>

          </div>
        </header>

        {/* Guest Session Merge Prompt (Floating Toast Modal) */}
        {status === 'authenticated' && hasGuestSessions && (
          <div className="fixed top-6 left-6 right-6 md:left-auto md:right-6 md:w-[420px] z-50 bg-background/95 border border-border p-3.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-sm flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-5 duration-300">
            <div className="flex gap-3 items-center min-w-0">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="h-4.5 w-4.5 text-primary" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-xs font-bold text-foreground truncate">Simpan Chat Tamu?</h4>
                <p className="text-[11px] text-muted-foreground leading-normal truncate">
                  Simpan riwayat chat sesi sebelumnya ke akunmu.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearGuestSessions?.()}
                className="h-8 px-2.5 text-xs rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                Hapus
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => mergeGuestSessions()}
                className="h-8 px-3.5 text-xs font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              >
                Simpan
              </Button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className={cn(
          "flex-1 min-h-0 flex flex-col relative",
          pathname.startsWith('/chat') ? "overflow-hidden" : "overflow-y-auto scrollbar-hide"
        )}>
          <React.Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="h-5 w-5 border-2 border-border border-t-foreground rounded-full animate-spin" />
            </div>
          }>
            {children}
          </React.Suspense>
        </div>
      </main>
    </div>
  );
}
