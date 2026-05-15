// app/(app)/layout.tsx
'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from "next-auth/react";
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
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'AI Chat', icon: MessageSquare, href: '/chat' },
  { label: 'CV Builder', icon: FileText, href: '/cv-builder' },
  { label: 'Lowongan Kerja', icon: Briefcase, href: '/jobs' },
  { label: 'Beasiswa', icon: GraduationCap, href: '/scholarships' },
  { label: 'Peta Karir', icon: MapIcon, href: '/career-path' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const { sessions, currentSessionId, setCurrentSessionId, deleteSession, createNewChat } = useChat();

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
  const headerTitle = (pathname === '/chat' && currentSession && currentSession.messages.length > 0) 
    ? currentSession.title 
    : 'VOKARA';

  // Generate initials from user name
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
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
                    "w-full h-10 justify-start px-0 gap-0 overflow-hidden transition-all duration-300 rounded-xl",
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
                  sessions.slice(0, 8).map((session) => (
                    <div 
                      key={session.id}
                      className={cn(
                        "group flex items-center h-10 rounded-xl cursor-pointer transition-all duration-200",
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
                    {user?.name || 'Tamu'}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {(user as any)?.major || 'Siswa SMK'}
                  </p>
                </div>
                
                {user && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7 mr-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors shrink-0"
                    title="Keluar"
                    onClick={() => signOut({ callbackUrl: '/login' })}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="h-14 border-b border-border/40 shrink-0 bg-background/80 backdrop-blur-md z-30">
          <div className="max-w-2xl mx-auto w-full h-full flex items-center justify-between px-4">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 text-muted-foreground hover:text-foreground lg:hidden"
                onClick={() => setIsMobileOpen(true)}
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-2 truncate">
                {pathname === '/chat' && (
                  <PanelLeft className="h-4 w-4 text-muted-foreground/40 shrink-0 hidden lg:block" />
                )}
                <span className="text-sm font-semibold text-foreground truncate max-w-[200px] sm:max-w-md">
                  {headerTitle}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {pathname === '/chat' && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={handleNewChat}
                  title="Chat Baru"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              
              <Separator orientation="vertical" className="h-4 mx-1 hidden sm:block opacity-40" />
              
              {/* Header Avatar — from session */}
              <div className="w-8 h-8 rounded-full bg-muted border border-border cursor-pointer flex items-center justify-center overflow-hidden ml-1">
                {user?.image ? (
                  <img 
                    src={user.image} 
                    alt="" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-[10px] font-bold">{initials}</div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
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
