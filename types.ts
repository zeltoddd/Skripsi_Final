export enum Sender {
  USER = 'user',
  AI = 'model'
}

export interface QuickAction {
  label: string;
  actionId: 'search_jobs' | 'search_courses' | 'view_trends' | 'create_cv' | 'search_scholarships';
  data?: string;
}

export interface FileData {
  mimeType: string;
  data: string;
  fileName: string;
}

export interface VideoRecommendation {
  title: string;
  searchQuery: string;
}

export interface TrendItem {
  role: string;
  demandScore: number; // 1-100
  growth: string;
  avgSalary: string;
}

export interface TrendData {
  major: string;
  items: TrendItem[];
}

export interface CVData {
  name: string;
  email: string;
  phone: string;
  education: string;
  gradYear: string;
  skills: string[];
  experience: string;
  summary: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  isError?: boolean;
  isStreaming?: boolean;
  groundingMetadata?: any;
  imageUrl?: string; 
  imageCaption?: string;
  summary?: string;
  quickActions?: QuickAction[];
  fileData?: FileData;
  videoRecommendation?: VideoRecommendation;
  trendData?: TrendData;
  reasoning?: string;
}

export interface SuggestionChip {
  label: string;
  prompt: string;
}

export enum AIProvider {
  GEMINI = 'gemini',
  NVIDIA = 'nvidia'
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  major: string;
  provider: AIProvider;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string | Date;
}