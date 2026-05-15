// ============================================================
// nvidiaService.ts (REFACTORED)
// ============================================================

import { QuickAction, FileData, VideoRecommendation, TrendData } from '../types'
import {
  route,
  pruneHistory,
  buildCompactSystemPrompt,
  extractQuickActions,
} from './smartRouter'
import { sendMessageToGemini } from './geminiService'

const NVIDIA_BASE_URL = '/api/chat/nvidia'
const getApiKey = () => {
  // Support for both Next.js and legacy Vite environment variables
  const envKey = process.env.NEXT_PUBLIC_NVIDIA_API_KEY || (process.env as any).VITE_NVIDIA_API_KEY;
  if (envKey && envKey !== 'dummy_key') return envKey;

  const saved = typeof window !== 'undefined' ? localStorage.getItem('karirsmk_admin_config') : null;
  if (saved) {
    const config = JSON.parse(saved);
    if (config.nvidiaKey) return config.nvidiaKey;
  }
  return 'dummy_key';
}

interface NvidiaChunk {
  choices: { 
    delta: { 
      content?: string;
      reasoning_content?: string;
    } 
  }[]
}

export const sendMessageToNvidia = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[],
  userMajor: string = 'Belum ditentukan',
  onChunk?: (chunk: { content?: string; reasoning?: string }) => void,
  fileData?: FileData | FileData[],
): Promise<{
  text: string
  quickActions?: QuickAction[]
  videoRecommendation?: VideoRecommendation
  trendData?: TrendData
  imageCaption?: string
  reasoning?: string
  imageUrl?: string
  groundingMetadata?: any
}> => {

  const decision = route(message, !!fileData)

  if (decision.forceGemini) {
    console.info('[Router] File detected → (Multimodal needed, but Gemini is currently disabled)')
    throw new Error('Analisis file (multimodal) membutuhkan Gemini yang sedang dinonaktifkan sementara.');
  }

  const systemPrompt = buildCompactSystemPrompt(userMajor, decision.ragKeys)
  const prunedHistory = pruneHistory(history, decision.historyLimit)

  const messages = [
    { role: 'system', content: systemPrompt },
    ...prunedHistory.map(h => ({
      role: h.role === 'model' ? 'assistant' : 'user',
      content: h.parts[0].text,
    })),
    { role: 'user', content: message },
  ]

  let fullText = ''
  let fullReasoning = ''
  try {
    const response = await fetch(NVIDIA_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model: decision.model,
        messages,
        temperature: decision.temperature,
        top_p: 0.7,
        max_tokens: 4096,
        stream: !!onChunk,
      }),


    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      const status = response.status

      if (status === 429 || status >= 500) {
        throw new Error(`NVIDIA API sedang sibuk (Status: ${status}). Silakan coba lagi nanti.`);
      }

      if (status === 401) throw new Error('API Key NVIDIA tidak valid.')
      throw new Error((err as any).error?.message || `NVIDIA API error: ${status}`)
    }

    if (onChunk && response.body) {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        
        // Simpan baris terakhir yang mungkin belum lengkap ke buffer
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === 'data: [DONE]') continue
          if (trimmed.startsWith('data: ')) {
            try {
              const jsonStr = trimmed.slice(6)
              const chunk = JSON.parse(jsonStr)
              const delta = chunk.choices?.[0]?.delta
              if (!delta) continue
              
              const content = delta.content || ''
              const reasoning = delta.reasoning_content || ''
              
              if (content || reasoning) {
                if (content) fullText += content
                if (reasoning) fullReasoning += reasoning
                onChunk({ content, reasoning })
              }
            } catch (e) {
              // Abaikan chunk yang korup
            }
          }
        }
      }
    } else {

      const data = await response.json()
      const msg = data.choices?.[0]?.message
      fullText = msg?.content ?? ''
      fullReasoning = msg?.reasoning_content ?? ''
    }

  } catch (error: any) {
    console.error('[Router] NIM error:', error.message)
    throw error;
  }

  const quickActions = extractQuickActions(fullText)

  let trendData: TrendData | undefined
  let videoRecommendation: VideoRecommendation | undefined

  if (decision.fetchMetadataBg) {
    try {
      const meta = await fetchMetadataBackground(fullText, userMajor, decision.intents)
      trendData = meta.trendData
      videoRecommendation = meta.videoRecommendation
    } catch { /* skip metadata if fails */ }
  }

  return {
    text: fullText,
    quickActions,
    trendData,
    videoRecommendation,
    imageCaption: "Karir SMK " + userMajor,
    reasoning: fullReasoning
  }
}

async function fetchMetadataBackground(
  responseText: string,
  userMajor: string,
  intents: string[],
): Promise<{ trendData?: TrendData; videoRecommendation?: VideoRecommendation }> {
  const needsTrend = intents.includes('trend_data')
  const needsVideo = responseText.toLowerCase().includes('video') || responseText.toLowerCase().includes('youtube')

  if (!needsTrend && !needsVideo) return {}

  const prompt = `Dari respons berikut untuk siswa SMK ${userMajor}:
${responseText.slice(0, 600)}

Balas HANYA JSON:
{
  ${needsVideo ? '"videoRecommendation": {"title": "...", "searchQuery": "..."},' : ''}
  ${needsTrend ? '"trendData": {"major": "...", "items": [{"role": "...", "demandScore": 80, "growth": "+10%", "avgSalary": "Rp X jt"}]}' : '"trendData": null'}
}`

  try {
    const res = await fetch(NVIDIA_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model: 'stepfun-ai/step-3.5-flash', 
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 256,
      }),
    })

    if (!res.ok) return {}
    const data = await res.json()
    const content = data.choices?.[0]?.message?.content ?? ''
    const match = content.match(/\{[\s\S]*\}/)
    return match ? JSON.parse(match[0]) : {}
  } catch {
    return {}
  }
}

export const summarizeTextNvidia = async (text: string): Promise<string> => {
  try {
    const res = await fetch(NVIDIA_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model: 'stepfun-ai/step-3.5-flash',
        messages: [{
          role: 'user',
          content: `Ringkas ini menjadi 3-4 poin bullet. Singkat, langsung ke inti:\n\n${text.slice(0, 1000)}`,
        }],
        temperature: 0.2,
        max_tokens: 200,
      }),
    })

    if (!res.ok) return text.slice(0, 200) + '...'
    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() ?? ''
  } catch {
    return 'Gagal meringkas.'
  }
}

export const fetchCVSuggestionsNvidia = async (
  section: 'skills' | 'experience',
  major: string,
): Promise<string[]> => {
  const prompt = section === 'skills'
    ? `6 skill (teknis + soft) paling dicari untuk lulusan SMK ${major}. JSON array saja: ["Skill 1", ...]`
    : `3 deskripsi pengalaman PKL profesional untuk SMK ${major}. JSON array saja: ["Contoh 1", ...]`

  try {
    const res = await fetch(NVIDIA_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model: 'stepfun-ai/step-3.5-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 150,
      }),
    })

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content ?? ''
    const match = content.match(/\[[\s\S]*\]/)
    return match ? JSON.parse(match[0]) : []
  } catch {
    return []
  }
}

// Helper to generate a short title for a chat session
export async function generateChatTitle(firstMessage: string): Promise<string> {
  try {
    const response = await fetch('/api/chat/nvidia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'Anda adalah asisten yang bertugas membuat judul singkat untuk percakapan. Balas HANYA dengan judulnya saja (maksimal 4 kata), tanpa tanda kutip, tanpa penjelasan.' },
          { role: 'user', content: `Buatkan judul singkat untuk percakapan yang dimulai dengan pesan ini: "${firstMessage}"` }
        ],
        model: "stepfun-ai/step-3.5-flash",
        temperature: 0.3,
        max_tokens: 50,
        stream: true
      }),
    });

    if (!response.ok) throw new Error('Failed to generate title');
    
    const reader = response.body?.getReader();
    let title = "";
    
    if (reader) {
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              const content = data.choices?.[0]?.delta?.content || "";
              if (content) title += content;
            } catch (e) {
              // Skip malformed chunks
            }
          }
        }
      }
    }
    
    const finalTitle = title.trim()
      .replace(/^["']|["']$/g, '')
      .replace(/\.\.\.$/, ''); // Hapus titik-titik di akhir kalau ada dari AI
    return finalTitle || (firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : ''));
  } catch (error) {
    console.error("Title generation failed:", error);
    return firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : '');
  }
}
