import React from 'react';
import { AIProvider } from '../../types';
import { APP_NAME } from '../../constants';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip';
import { SidebarTrigger } from '../ui/sidebar';
import { ChevronDown, Plus, Bot, Sparkles, Check, Share2, MoreHorizontal, User, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface HeaderProps {
  onNewChat: () => void;
  provider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ onNewChat, provider, onProviderChange, title }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">

        {/* Left Section: Sidebar Trigger & New Chat */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-border mx-1 hidden sm:block" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNewChat}
                className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs font-semibold">Chat Baru</TooltipContent>
          </Tooltip>
        </div>

        {/* Center Section: Title & Provider Selector */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-3 gap-2 hover:bg-accent/50 rounded-full group transition-all">
                <span className="font-semibold text-sm tracking-tight truncate max-w-[120px] sm:max-w-[240px]">
                  {title || APP_NAME}
                </span>
                <div className="flex items-center gap-1.5 pl-1 border-l border-border/50 ml-1">
                  {provider === AIProvider.NVIDIA ? (
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                  )}
                  <ChevronDown className="h-3 w-3 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56 mt-2 rounded-2xl p-1 shadow-2xl border-border/50 animate-in fade-in zoom-in-95 duration-200">
              <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-3 py-2">
                Pilih Model AI
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="mx-1 my-1 opacity-50" />
              <DropdownMenuItem
                onClick={() => onProviderChange(AIProvider.NVIDIA)}
                className="flex items-center justify-between px-3 py-2.5 cursor-pointer rounded-xl focus:bg-primary/5 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">NVIDIA NIM</span>
                    <span className="text-[10px] text-muted-foreground font-medium">Respon Cepat & Stabil</span>
                  </div>
                </div>
                {provider === AIProvider.NVIDIA && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onProviderChange(AIProvider.GEMINI)}
                className="flex items-center justify-between px-3 py-2.5 cursor-pointer rounded-xl focus:bg-blue-500/5 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">Google Gemini</span>
                    <span className="text-[10px] text-muted-foreground font-medium">Analisis Mendalam & File</span>
                  </div>
                </div>
                {provider === AIProvider.GEMINI && <Check className="h-4 w-4 text-blue-500" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hidden sm:flex">
            <Share2 className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full overflow-hidden border border-border/50 p-0.5 hover:ring-2 hover:ring-primary/20 transition-all">
                <Avatar className="h-full w-full">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">ZY</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl shadow-2xl border-border/50">
              <DropdownMenuLabel className="flex flex-col px-3 py-2">
                <span className="font-semibold text-sm">Ziyad Robith</span>
                <span className="text-[10px] text-muted-foreground font-medium truncate">ziyad.robith@example.com</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="opacity-50" />
              <DropdownMenuItem className="gap-2 px-3 py-2.5 cursor-pointer rounded-xl">
                <User className="h-4 w-4" /> Profil Saya
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 px-3 py-2.5 cursor-pointer rounded-xl">
                <Settings className="h-4 w-4" /> Pengaturan
              </DropdownMenuItem>
              <DropdownMenuSeparator className="opacity-50" />
              <DropdownMenuItem className="gap-2 px-3 py-2.5 cursor-pointer rounded-xl text-destructive focus:bg-destructive/10">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;