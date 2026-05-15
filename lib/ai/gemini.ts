// lib/ai/gemini.ts
import { google } from '@ai-sdk/google';
import { generateText, streamText } from 'ai';
import { KAK_KARIR_SYSTEM_PROMPT } from '../../constants/persona';
import { IAIProvider, SendMessageParams, AIResponse } from './providers';

export class GeminiProvider implements IAIProvider {
  name = 'gemini' as const;
  private model;

  constructor(apiKey: string, config: any = {}) {
    // In a real app, this would use the apiKey provided. 
    // For local dev, it often uses process.env.GOOGLE_GENERATIVE_AI_API_KEY
    this.model = google(config.model || 'gemini-1.5-flash');
  }

  async sendMessage({ message, history = [], major }: SendMessageParams): Promise<AIResponse> {
    const { text, usage } = await generateText({
      model: this.model,
      system: KAK_KARIR_SYSTEM_PROMPT(major),
      messages: [
        ...history,
        { role: 'user', content: message }
      ],
    });

    return {
      text,
      usage: {
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
      }
    };
  }

  async *streamMessage({ message, history = [], major }: SendMessageParams): AsyncGenerator<string> {
    const { textStream } = await streamText({
      model: this.model,
      system: KAK_KARIR_SYSTEM_PROMPT(major),
      messages: [
        ...history,
        { role: 'user', content: message }
      ],
    });

    for await (const delta of textStream) {
      yield delta;
    }
  }

  async summarize(text: string): Promise<string> {
    const { text: summary } = await generateText({
      model: this.model,
      prompt: `Ringkaslah percakapan berikut dalam maksimal 5 kata untuk menjadi judul sesi: \n\n${text}`,
    });
    return summary;
  }
}
