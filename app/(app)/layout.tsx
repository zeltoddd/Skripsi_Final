// app/(app)/layout.tsx
'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut, signIn } from "next-auth/react";
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Map as MapIcon, 
  LogOut,
  ChevronLeft,
  Sparkles,
  Trash2,
  Plus,
  Clock,
  PanelLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useChat } from '@/context/ChatContext';

const NAV_ITEMS = [
  { label: 'AI Chat', icon: MessageSquare, href: '/chat' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
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

  const handleNewChat = () => {
    createNewChat();
    if (pathname !== '/chat') {
      router.push('/chat');
    }
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const getHeaderTitle = () => {
    if (pathname.startsWith('/chat')) {
      if (currentSession && currentSession.title) {
        return currentSession.title;
      }
      return 'Chat Baru';
    }
    const navItem = NAV_ITEMS.find(item => pathname.startsWith(item.href));
    return navItem ? navItem.label : 'VOKARA';
  };
  const headerTitle = getHeaderTitle();

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
          "bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out flex flex-col z-50 fixed inset-y-0 left-0 lg:relative shrink-0",
          isCollapsed ? "lg:w-[56px]" : "lg:w-[240px]",
          isMobileOpen ? "translate-x-0 w-[240px]" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar Header - Toggle Button */}
        <div className="h-14 flex items-center border-b border-sidebar-border shrink-0 px-2">
          <div className="w-10 flex items-center justify-center shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsMobileOpen(false);
                } else {
                  setIsCollapsed(!isCollapsed);
                }
              }}
            >
              {isMobileOpen || !isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </Button>
          </div>
          
          {!isCollapsed && (
            <span className="font-bold text-sm text-sidebar-foreground truncate flex-1 animate-in fade-in slide-in-from-left-2 duration-300 ml-2 tracking-tight">VOKARA</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide py-4 space-y-1 px-2">
          {/* Navigation Items */}
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full h-10 justify-start px-0 gap-0 overflow-hidden transition-all duration-200 rounded-xl active:scale-[0.98]",
                    isActive 
                      ? "bg-primary/10 text-primary hover:bg-primary/15" 
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <div className="w-10 flex items-center justify-center shrink-0">
                    <Icon className={cn("h-[18px] w-[18px]", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                  </div>
                  {!isCollapsed && (
                    <span className="animate-in fade-in slide-in-from-left-2 duration-300 truncate font-semibold text-[13px] tracking-tight ml-2">
                      {item.label}
                    </span>
                  )}
                </Button>
              </Link>
            );
          })}

          {/* Chat History Section */}
          {!isCollapsed && (
            <div className="pt-6">
              <div className="flex items-center justify-between pl-0.5 pr-2 pb-2">
                <p className="pl-2 text-xs font-bold text-muted-foreground/60 tracking-tight">Riwayat chat</p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg"
                  onClick={handleNewChat}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              
              <div className="space-y-0.5 mt-1">
                {sessions.length === 0 ? (
                  <p className="pl-10 py-2 text-[11px] text-muted-foreground/40 italic">Belum ada chat...</p>
                ) : (
                  sessions.map((session) => (
                    <div 
                      key={session.id}
                      className={cn(
                        "group flex items-center h-10 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98]",
                        currentSessionId === session.id 
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-bold" 
                          : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 font-medium"
                      )}
                      onClick={() => handleSelectSession(session.id)}
                    >
                      <div className="w-10 flex items-center justify-center shrink-0">
                        <MessageSquare className={cn("h-4 w-4 shrink-0 opacity-60", currentSessionId === session.id && "text-primary opacity-100")} />
                      </div>
                      <span className="flex-1 truncate text-xs animate-in fade-in slide-in-from-left-1 duration-300 pr-2 ml-2">
                        {session.title || 'Chat Baru'}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 mr-1.5 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </nav>

        {/* Sidebar Footer — User Info from Session */}
        <div className="border-t border-sidebar-border py-2 px-2">
          {user ? (
            <div className="flex items-center rounded-xl group/footer h-10 transition-all duration-300">
              <div className="w-10 flex items-center justify-center shrink-0">
                {user?.image ? (
                  <img 
                    src={user.image} 
                    alt="" 
                    className="w-7 h-7 rounded-full object-cover border border-border" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-semibold">
                    {initials}
                  </div>
                )}
              </div>
              
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2 duration-300 ml-2">
                    <p className="text-xs font-bold truncate text-sidebar-foreground">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {(user as any).major || 'Siswa SMK'}
                    </p>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7 mr-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors shrink-0"
                    title="Keluar"
                    onClick={() => signOut({ callbackUrl: '/login' })}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center h-10 px-1">
              <Button 
                variant="outline" 
                className={cn(
                  "w-full rounded-xl border-border/80 shadow-sm transition-all text-xs font-semibold hover:bg-muted text-foreground/80 hover:text-foreground h-9",
                  isCollapsed ? "px-0 justify-center" : "px-3 justify-start gap-2"
                )}
                onClick={() => signIn('google')}
              >
                <svg className="h-[14px] w-[14px] shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">Login dengan Google</span>}
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="h-14 border-b border-border/40 shrink-0 bg-background/80 backdrop-blur-md z-30">
          <div className="max-w-2xl mx-auto w-full h-full flex items-center justify-between px-4">
            
            {/* Left Section: Unified Sidebar Trigger, Separator & Truncated Title */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 text-muted-foreground hover:text-foreground shrink-0 rounded-lg hover:bg-muted transition-colors"
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
              
              <div className="h-4 w-px bg-border/60 shrink-0 mx-1" />
              
              <span className="text-sm font-semibold text-foreground truncate pl-1 max-w-[180px] sm:max-w-[320px] md:max-w-[480px]" title={headerTitle}>
                {headerTitle}
              </span>
            </div>
            
            {/* Right Section: New Chat Plus Button */}
            <div className="flex items-center gap-2 shrink-0">
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
          "flex-1 min-h-0", // min-h-0 is important for flex children to shrink
          !pathname.startsWith('/chat') && "overflow-y-auto scrollbar-hide"
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
