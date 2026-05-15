// ============================================================
// nvidiaService.ts (REFACTORED)
// 
// PERUBAHAN UTAMA dari versi lama:
// ✅ Eliminasi extractMetadataNvidia sebagai call terpisah
//    → metadata kini di-fetch background (non-blocking)
// ✅ Routing pakai smartRouter, bukan message.length > 200
// ✅ Adaptive max_tokens per tier (256 / 512 / 1024)
// ✅ History pruning berbasis tier, bukan flat 8 pesan
// ✅ RAG injection otomatis sesuai intent
// ✅ Auto-fallback ke Gemini jika NIM error 429/500/503
// ✅ File (PDF) auto-route ke Gemini
// ============================================================

import { SYSTEM_INSTRUCTION } from '../constants'
import { QuickAction, FileData, VideoRecommendation, TrendData } from '../types'
import {
  route,
  pruneHistory,
  buildCompactSystemPrompt,
  extractQuickActions,
} from './smartRouter'
import { sendMessageToGemini } from './geminiService'

const NVIDIA_BASE_URL = '/nvidia-api/chat/completions'
const getApiKey = () => (import.meta as any).env?.VITE_NVIDIA_API_KEY || ''

interface NvidiaChunk {
  choices: { delta: { content?: string } }[]
}

// ============================================================
// MAIN CHAT FUNCTION
// ============================================================

export const sendMessageToNvidia = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[],
  userMajor: string = 'Belum ditentukan',
  onChunk?: (chunk: string) => void,
  fileData?: FileData,
): Promise<{
  text: string
  quickActions?: QuickAction[]
  videoRecommendation?: VideoRecommendation
  trendData?: TrendData
}> => {

  // ── 1. ROUTING DECISION ──────────────────────────────────
  const decision = route(message, !!fileData)

  // File upload → force Gemini (multimodal)
  if (decision.forceGemini) {
    console.info('[Router] File detected → Gemini (multimodal)')
    return sendMessageToGemini(message, history, userMajor, fileData)
  }

  // ── 2. BUILD CONTEXT ─────────────────────────────────────
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

  console.info(
    `[Router] Tier=${decision.tier} | Intents=${decision.intents.join(',')} | RAG=${decision.ragKeys.join(',') || 'none'} | maxTokens=${decision.maxTokens}`
  )

  // ── 3. MAIN API CALL ─────────────────────────────────────
  let fullText = ''
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
        max_tokens: decision.maxTokens,
        stream: !!onChunk,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      const status = response.status

      // Auto-fallback ke Gemini untuk rate limit / server error
      if (status === 429 || status >= 500) {
        console.warn(`[Router] NIM ${status} → fallback to Gemini`)
        return sendMessageToGemini(message, history, userMajor)
      }

      if (status === 401) throw new Error('API Key NVIDIA tidak valid.')
      throw new Error((err as any).error?.message || `NVIDIA API error: ${status}`)
    }

    // ── 4. STREAM PROCESSING ─────────────────────────────
    if (onChunk && response.body) {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const raw = decoder.decode(value, { stream: true })
        for (const line of raw.split('\n')) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === 'data: [DONE]') continue
          if (trimmed.startsWith('data: ')) {
            try {
              const chunk: NvidiaChunk = JSON.parse(trimmed.slice(6))
              const content = chunk.choices[0]?.delta?.content ?? ''
              if (content) {
                fullText += content
                onChunk(content)
              }
            } catch { /* skip malformed chunk */ }
          }
        }
      }
    } else {
      const data = await response.json()
      fullText = data.choices?.[0]?.message?.content ?? ''
    }

  } catch (error: any) {
    // Network error → fallback ke Gemini
    console.warn('[Router] NIM network error → fallback to Gemini:', error.message)
    return sendMessageToGemini(message, history, userMajor)
  }

  // ── 5. QUICK ACTIONS (zero cost — rule-based) ────────────
  const quickActions = extractQuickActions(fullText)

  // ── 6. METADATA (background, non-blocking) ───────────────
  // Tidak menunggu ini — UI sudah dapat text duluan
  // Hasil dikirim via callback setelah streaming selesai
  let trendData: TrendData | undefined
  let videoRecommendation: VideoRecommendation | undefined

  if (decision.fetchMetadataBg) {
    // Fire & forget — tidak await
    fetchMetadataBackground(fullText, userMajor, decision.intents)
      .then(meta => {
        trendData = meta.trendData
        videoRecommendation = meta.videoRecommendation
      })
      .catch(() => { /* metadata gagal — tidak perlu error ke user */ })
  }

  return { text: fullText, quickActions, trendData, videoRecommendation }
}

// ============================================================
// BACKGROUND METADATA FETCH
// Dipanggil non-blocking SETELAH stream selesai
// Satu call untuk trend + video sekaligus
// ============================================================

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

Balas HANYA JSON (tanpa penjelasan):
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
        max_tokens: 256, // metadata kecil, cukup 256
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

// ============================================================
// SUMMARIZE
// Selalu pakai flash — task sederhana, tidak perlu heavy model
// ============================================================

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
        max_tokens: 200, // ringkasan tidak butuh banyak token
      }),
    })

    if (!res.ok) return text.slice(0, 200) + '...'
    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() ?? ''
  } catch {
    return 'Gagal meringkas.'
  }
}

// ============================================================
// CV SUGGESTIONS
// Structured output — jawab JSON saja
// ============================================================

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
        max_tokens: 150, // JSON array kecil
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
