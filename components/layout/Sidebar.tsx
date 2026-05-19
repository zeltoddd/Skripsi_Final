import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Settings, 
  FileText, 
  Clock,
  LayoutDashboard,
  BrainCircuit,
  History,
  GraduationCap,
  Briefcase,
  Users,
  Sun,
  Moon,
  Sparkles,
  Map as MapIcon
} from 'lucide-react';
import { ChatSession } from '../../types';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarGroupContent,
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarMenuAction
} from '../ui/sidebar';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { APP_NAME } from '../../constants';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onOpenCVWizard: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function AppSidebar({ 
  sessions, 
  activeSessionId, 
  onSelectSession, 
  onNewChat, 
  onDeleteSession,
  onOpenCVWizard,
  theme,
  onToggleTheme
}: SidebarProps) {
  const pathname = usePathname();
  const isChatActive = pathname.startsWith('/chat');
  
  const groupedSessions = sessions.reduce((acc: Record<string, ChatSession[]>, session) => {
    const date = new Date(session.lastMessageAt || session.updatedAt);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const diffMs = today.getTime() - date.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);

    let group = 'Dulu';
    if (diffHrs < 1) group = '1 Jam Terakhir';
    else if (date.toDateString() === today.toDateString()) group = 'Hari Ini';
    else if (date.toDateString() === yesterday.toDateString()) group = 'Kemarin';
    else if (diffMs < 7 * 24 * 60 * 60 * 1000) group = '7 Hari Terakhir';

    if (!acc[group]) acc[group] = [];
    acc[group].push(session);
    return acc;
  }, {});

  const groups = ['1 Jam Terakhir', 'Hari Ini', 'Kemarin', '7 Hari Terakhir', 'Dulu'].filter(g => groupedSessions[g]?.length > 0);

  return (
     <Sidebar collapsible="icon" className="border-r border-border bg-card">
        <SidebarHeader className="h-16 flex items-center justify-center p-0 border-b border-border group-data-[collapsible=icon]:p-0">
        <Link 
          href="/chat"
          onClick={onNewChat}
          className="flex items-center justify-center w-full h-full"
        >
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col ml-3 group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-sm tracking-tight leading-none text-foreground">{APP_NAME}</span>
            <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-widest mt-1">V2.0 PRO</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden p-0 group-data-[collapsible=icon]:p-0">
        <SidebarGroup className="p-0 group-data-[collapsible=icon]:p-0">
          <SidebarGroupLabel className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 group-data-[collapsible=icon]:hidden">Layanan Karir</SidebarGroupLabel>
          <SidebarGroupContent className="p-0 group-data-[collapsible=icon]:p-0">
            <SidebarMenu className="p-2 gap-1 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:gap-0">

               <SidebarMenuItem className="group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                 <SidebarMenuButton asChild tooltip="Chat" isActive={isChatActive} className="h-11 group-data-[collapsible=icon]:h-14 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                   <Link href="/chat" className="flex items-center gap-3 w-full group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
                     <MessageSquare className="h-5 w-5 shrink-0" />
                     <span className="group-data-[collapsible=icon]:hidden">Chat Asisten</span>
                   </Link>
                 </SidebarMenuButton>
               </SidebarMenuItem>
               <SidebarMenuItem className="group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                 <SidebarMenuButton asChild tooltip="Career Path" isActive={pathname === '/career-path'} className="h-11 group-data-[collapsible=icon]:h-14 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                   <Link href="/career-path" className="flex items-center gap-3 w-full group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
                     <MapIcon className="h-5 w-5 shrink-0" />
                     <span className="group-data-[collapsible=icon]:hidden">Peta Karir</span>
                   </Link>
                 </SidebarMenuButton>
               </SidebarMenuItem>
               <SidebarMenuItem className="group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                 <SidebarMenuButton asChild tooltip="Lowongan" isActive={pathname === '/jobs'} className="h-11 group-data-[collapsible=icon]:h-14 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                   <Link href="/jobs" className="flex items-center gap-3 w-full group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
                     <Briefcase className="h-5 w-5 shrink-0" />
                     <span className="group-data-[collapsible=icon]:hidden">Loker SMK</span>
                   </Link>
                 </SidebarMenuButton>
               </SidebarMenuItem>
               <SidebarMenuItem className="group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                 <SidebarMenuButton asChild tooltip="Beasiswa" isActive={pathname === '/scholarships'} className="h-11 group-data-[collapsible=icon]:h-14 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                   <Link href="/scholarships" className="flex items-center gap-3 w-full group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
                     <GraduationCap className="h-5 w-5 shrink-0" />
                     <span className="group-data-[collapsible=icon]:hidden">Beasiswa</span>
                   </Link>
                 </SidebarMenuButton>
               </SidebarMenuItem>
               {/* Settings */}
               <SidebarMenuItem className="group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                  <SidebarMenuButton asChild tooltip="Pengaturan" isActive={pathname === '/settings'} className="h-11 group-data-[collapsible=icon]:h-14 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                    <Link href="/settings" className="flex items-center gap-3 w-full group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
                     <Settings className="h-5 w-5 shrink-0" />
                     <span className="group-data-[collapsible=icon]:hidden">Pengaturan</span>
                   </Link>
                 </SidebarMenuButton>
               </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2 mx-3 group-data-[collapsible=icon]:hidden" />

        <div className="group-data-[collapsible=icon]:hidden">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-3 opacity-40">
              <History className="h-8 w-8" />
              <p className="text-sm font-medium">Belum ada riwayat</p>
            </div>
          ) : (
            groups.map(group => (
              <SidebarGroup key={group}>
                <SidebarGroupLabel className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  {group}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                     {groupedSessions[group].map(session => (
                       <SidebarMenuItem key={session.id} className="relative">
                          <SidebarMenuButton asChild tooltip={session.title} isActive={activeSessionId === session.id} className="h-10 rounded-lg group/btn pl-3 pr-12 gap-3">
                            <Link href={`/chat/${session.id}`} className="flex items-center gap-3 truncate">
                             <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
                             <span className="truncate font-medium">
                               {(() => {
                                 try {
                                   if (session.title.startsWith('{')) {
                                     const parsed = JSON.parse(session.title);
                                     return parsed.message || parsed.text || session.title;
                                   }
                                   return session.title;
                                 } catch (e) {
                                   return session.title;
                                 }
                               })()}
                             </span>
                           </Link>
                         </SidebarMenuButton>
                         <SidebarMenuAction
                           showOnHover
                           onClick={() => onDeleteSession(session.id)}
                           className="hover:text-destructive transition-colors right-2 top-2.5"
                         >
                           <Trash2 className="h-4 w-4" />
                         </SidebarMenuAction>
                       </SidebarMenuItem>
                     ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))
          )}
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:h-16 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
        <div className="flex flex-col gap-4 w-full items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleTheme}
            className="w-full justify-start gap-3 h-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:w-11 group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:p-0"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span className="group-data-[collapsible=icon]:hidden">Mode {theme === 'light' ? 'Gelap' : 'Terang'}</span>
          </Button>
          <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:hidden">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shadow-sm">
              ZR
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold truncate text-foreground">Ziyad Robith</span>
              <span className="text-[9px] text-muted-foreground truncate uppercase tracking-tighter">Premium Student</span>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
