// lib/ai/providers.ts

import { GeminiProvider } from './gemini';

export type AIProviderName = 'gemini' | 'openai' | 'anthropic' | 'groq' | 'openrouter' | 'ollama' | 'nvidia';

export interface FileData {
  mimeType: string;
  data: string;
  fileName: string;
}

export interface SendMessageParams {
  message: string;
  history?: any[];
  major: string;
  file?: FileData;
  config?: any;
}

export interface AIResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface IAIProvider {
  name: AIProviderName;
  sendMessage(params: SendMessageParams): Promise<AIResponse>;
  streamMessage(params: SendMessageParams): AsyncGenerator<string>;
  summarize(text: string): Promise<string>;
}

// Registry provider
export const PROVIDERS: Record<string, any> = {
  gemini: GeminiProvider,
  // Add other providers here as they are implemented
};

// Provider Config interface
export interface ProviderConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  baseUrl?: string;
}

/**
 * Factory to get the active AI provider based on school configuration.
 * For now, it defaults to Gemini if no schoolId is provided or found.
 */
export async function getActiveProvider(config?: any): Promise<IAIProvider> {
  const activeProviderName = config?.activeProvider || 'gemini';
  const ProviderClass = PROVIDERS[activeProviderName] || GeminiProvider;
  
  // Use API key from config or environment
  const apiKey = config?.apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
  
  return new ProviderClass(apiKey, config);
}
