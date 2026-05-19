// ============================================================
// nvidiaService.ts (REFACTORED)
// ============================================================

import { QuickAction, FileData, VideoRecommendation, TrendData } from '../types'
import {
  route,
  pruneHistory,
  extractQuickActions,
  detectEmotionSignals,
} from './smartRouter'
import { retrieveContext } from '@/lib/rag/retriever';
import { buildVekoraSystemPrompt } from '@/lib/systemPrompt';
import { normalizeMajor } from './RAG_SETUP';


const NVIDIA_BASE_URL = '/api/chat/nvidia'
let activeKeyIndex = 0;

export const getAllApiKeys = (): string[] => {
  const envKey = process.env.NEXT_PUBLIC_NVIDIA_API_KEY || (process.env as any).VITE_NVIDIA_API_KEY;
  const rawKeys = (envKey && envKey !== 'dummy_key') ? envKey : '';

  if (!rawKeys) return ['dummy_key'];
  return rawKeys.split(',').map(k => k.trim()).filter(Boolean);
};

export const getApiKey = (): string => {
  const keys = getAllApiKeys();
  return keys[activeKeyIndex % keys.length] || 'dummy_key';
};

interface NvidiaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

function enforceAlternatingRoles(messages: NvidiaMessage[]): NvidiaMessage[] {
  if (messages.length === 0) return [];
  
  const result: NvidiaMessage[] = [];
  
  const systemMessages = messages.filter(m => m.role === 'system');
  const chatMessages = messages.filter(m => m.role !== 'system');
  
  if (chatMessages.length === 0) {
    return systemMessages;
  }
  
  let currentMessage: NvidiaMessage = { ...chatMessages[0] };
  
  for (let i = 1; i < chatMessages.length; i++) {
    const msg = chatMessages[i];
    if (msg.role === currentMessage.role) {
      currentMessage.content = `${currentMessage.content}\n\n${msg.content}`;
    } else {
      result.push(currentMessage);
      currentMessage = { ...msg };
    }
  }
  result.push(currentMessage);
  
  const finalChat = result;
  if (finalChat.length > 0 && finalChat[0].role === 'assistant') {
    finalChat.shift();
  }
  
  return [...systemMessages, ...finalChat];
}

interface RequestOptions {
  model: string;
  messages: any[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
}


const callNvidiaWithRotation = async (
  options: RequestOptions,
): Promise<Response> => {
  const apiKeys = getAllApiKeys();
  let lastError: any = null;

  for (let attempt = 0; attempt < apiKeys.length; attempt++) {
    const currentKeyIndex = (activeKeyIndex + attempt) % apiKeys.length;
    const currentKey = apiKeys[currentKeyIndex];

    try {
      console.log(`[VOKARA RAG] Firing request using Key index ${currentKeyIndex} (Attempt ${attempt + 1}/${apiKeys.length})...`);
      const response = await fetch(NVIDIA_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentKey}`,
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 401) {
          throw new Error('API Key NVIDIA tidak valid.');
        }
        if (status === 429 || status >= 500) {
          throw new Error(`NVIDIA API limit habis atau server sibuk (Status: ${status}).`);
        }
        const err = await response.json().catch(() => ({}));
        throw new Error((err as any).error?.message || `NVIDIA API error: ${status}`);
      }

      // Success! Keep the current working key index
      activeKeyIndex = currentKeyIndex;
      return response;

    } catch (error: any) {
      console.warn(`[VOKARA RAG] API Key index ${currentKeyIndex} failed: ${error.message}`);
      lastError = error;

      if (attempt < apiKeys.length - 1) {
        console.log(`[VOKARA RAG] Rotating to next API key...`);
        continue;
      }
    }
  }

  throw lastError || new Error('Semua API Key NVIDIA telah dicoba dan gagal.');
};

function getDefaultOptions(userMajor: string): QuickAction[] {
  const majorKey = (userMajor || 'rpl').toLowerCase();
  let defaultLabels = ["Bagaimana prospek kerja jurusan ini?", "Tips sukses magang industri?"];

  if (majorKey.includes('rpl') || majorKey.includes('perangkat lunak')) {
    defaultLabels = ["Apa saja prospek kerja RPL?", "Bagaimana cara mulai portofolio?"];
  } else if (majorKey.includes('akl') || majorKey.includes('akuntansi')) {
    defaultLabels = ["Sertifikasi Akuntansi apa yang penting?", "Tips magang di bagian finance?"];
  } else if (majorKey.includes('mplb') || majorKey.includes('perkantoran')) {
    defaultLabels = ["Bagaimana melatih skill komunikasi?", "Saran karir staff administrasi?"];
  } else if (majorKey.includes('ulp') || majorKey.includes('pariwisata')) {
    defaultLabels = ["Peluang kerja industri pariwisata?", "Bahasa asing apa yang wajib dikuasai?"];
  } else if (majorKey.includes('pemasaran') || majorKey.includes('marketing')) {
    defaultLabels = ["Bagaimana cara belajar digital marketing?", "Skill penting untuk sales modern?"];
  } else if (majorKey.includes('dkv') || majorKey.includes('visual')) {
    defaultLabels = ["Portofolio DKV yang menarik seperti apa?", "Tips mulai jadi freelance designer?"];
  } else if (majorKey.includes('broadcasting') || majorKey.includes('film')) {
    defaultLabels = ["Cara belajar editing video pemula?", "Peluang kerja di stasiun TV/Media?"];
  }

  return defaultLabels.map(label => ({
    label,
    actionId: 'dynamic_option',
    payload: label
  }));
}

async function generateOptionsWithGemma(contextText: string, userMajor: string): Promise<QuickAction[]> {
  try {
    const systemPrompt = `Kamu adalah AI Assistant khusus untuk membuat opsi pertanyaan kelanjutan (follow-up questions) bagi siswa SMK jurusan ${userMajor}.
Tugasmu adalah menganalisis tanggapan dari mentor karir di bawah ini, lalu membuat tepat 2 (dua) opsi pertanyaan kelanjutan yang akan dipilih siswa untuk melanjutkan obrolan.

ATURAN UTAMA:
1. Harus berupa pertanyaan/pernyataan singkat dari sudut pandang SISWA (seolah-olah siswa yang bertanya ke mentor).
2. Maksimal 3 sampai 6 kata saja per opsi (sangat singkat, padat, dan langsung ke inti).
3. HANYA keluarkan format berikut secara kaku, tanpa penjelasan, tanpa penomoran, tanpa teks tambahan:
[OPSI: Pertanyaan singkat pertama?]
[OPSI: Pertanyaan singkat kedua?]

CONTOH MASUKAN:
"Setelah lulus Akuntansi, kamu bisa bekerja di kantor pajak atau bagian finance perusahaan. Kamu akan banyak memakai e-Faktur dan laporan SPT."

CONTOH KELUARAN:
[OPSI: Bagaimana cara belajar e-Faktur?]
[OPSI: Apa saja tugas staff finance?]`;

    const response = await callNvidiaWithRotation({
      model: 'google/gemma-3n-e4b-it',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Kutipan respons mentor:\n"${contextText.slice(0, 1000)}"` }
      ],
      temperature: 0.3,
      max_tokens: 128,
      stream: true
    });

    if (response.ok && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let content = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              const text = data.choices?.[0]?.delta?.content || '';
              if (text) content += text;
            } catch (e) {
              // ignore
            }
          }
        }
      }

      // Process any residual data in buffer
      if (buffer.trim()) {
        const trimmed = buffer.trim();
        if (trimmed !== 'data: [DONE]' && trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            const text = data.choices?.[0]?.delta?.content || '';
            if (text) content += text;
          } catch (e) {}
        }
      }

      const actions: QuickAction[] = [];
      const opsiRegex = /\[OPS[I:]+\s*(.*?)\]/gi;
      let match;
      while ((match = opsiRegex.exec(content)) !== null) {
        const text = match[1].trim();
        if (text && text.length > 2 && text.length < 60) {
          actions.push({
            label: text,
            actionId: 'dynamic_option',
            payload: text
          });
        }
      }

      // If regex failed but model outputted bullet points instead
      if (actions.length < 2) {
        const lines = content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim().replace(/^(?:-|\*|\d+\.)\s*/, '').replace(/\[OPS[I:]+\s*|\]/gi, '').trim();
          if (trimmed && trimmed.length > 2 && trimmed.length < 60 && !actions.some(a => a.label === trimmed)) {
            actions.push({
              label: trimmed,
              actionId: 'dynamic_option',
              payload: trimmed
            });
          }
        }
      }

      return actions;
    }
  } catch (error) {
    console.error('[Gemma Options Generator] Error:', error);
  }
  return [];
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
  userName?: string,
  userKelas?: string,
  selectedMode: 'fast' | 'adaptive' | 'deep' = 'adaptive',
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

  const t_start = performance.now();
  console.log(`[VOKARA RAG] Starting request preparation...`);

  // Retrieve guest profile dynamically if available (runs on client side)
  let profileName = userName;
  let activeKelas = userKelas;
  if (typeof window !== 'undefined') {
    const guestProfileStr = localStorage.getItem('vokara_guest_profile');
    if (guestProfileStr) {
      try {
        const profile = JSON.parse(guestProfileStr);
        if (!profileName && profile.name) profileName = profile.name;
        if (!activeKelas && profile.kelas) activeKelas = profile.kelas;
      } catch (e) {}
    }
  }

  const decision = route(message, !!fileData, selectedMode)
  const t_route = performance.now();
  console.log(`[VOKARA RAG] Routing took ${(t_route - t_start).toFixed(1)}ms (Model: ${decision.model})`);

  // RAG retrieval
  const emotionDetected = detectEmotionSignals(message);
  const normalizedJurusan = userMajor ? normalizeMajor(userMajor) : undefined;
  const context = await retrieveContext({
    jurusan: normalizedJurusan,
    intents: decision.intents,
    emotionDetected,
    maxTokens: decision.maxTokens,
    query: message,
    kelas: activeKelas,
  });
  const t_rag = performance.now();
  console.log(`[VOKARA RAG] RAG context retrieval took ${(t_rag - t_route).toFixed(1)}ms`);

  // Extract nickname (first name only) and format in Title Case
  let nickname = 'Siswa';
  if (profileName) {
    const rawFirst = profileName.trim().split(/\s+/)[0];
    nickname = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase();
  }

  const systemPrompt = buildVekoraSystemPrompt({
    userName: nickname,
    userMajor,
    context,
    hasTTS: true, // TTS is available in this deployment
    kelas: activeKelas,
    isFast: selectedMode === 'fast',
  });
  const prunedHistory = pruneHistory(history, decision.historyLimit)
  const t_prompt = performance.now();
  console.log(`[VOKARA RAG] Prompt building took ${(t_prompt - t_rag).toFixed(1)}ms`);

  let userContent = message;
  const normalizedFileData = Array.isArray(fileData) ? fileData : (fileData ? [fileData] : []);
  
  if (normalizedFileData.length > 0) {
    const fileTexts = normalizedFileData.map((f: any) => `[Isi File: ${f.fileName}]\n${f.text}\n[Akhir Isi File]`).join('\n\n');
    userContent = `Berikut adalah dokumen PDF yang diunggah oleh pengguna:\n\n${fileTexts}\n\nPertanyaan/Instruksi Pengguna:\n${message}`;
  }

  // FORCE GRAMMAR RULES ON USER CONTENT (CRITICAL FOR STEPFUN INSTRUCTION FOLLOWING)
  if (nickname && nickname !== 'Siswa') {
    userContent += `\n\n[ATURAN PENTING - WAJIB PATUH]: 
- JANGAN gunakan basa-basi/filler pembuka di awal kalimat (seperti "Wah, bagus banget...", "Tentu saja...", dsb). Langsung jawab inti pertanyaan pengguna di kalimat pertama.
- DILARANG KERAS menyapa atau memanggil nama pengguna di baris pertama atau awal kalimat respon (contoh: JANGAN PERNAH memulai respon dengan "${nickname}, ..." atau "Halo ${nickname}").
- Panggil nama "${nickname}" secara alami di tengah-tengah penjelasan atau di akhir kalimat jika benar-benar dirasa perlu saja.
- JANGAN PERNAH gunakan koma sebelum nama panggilan sapaan (contoh: tulis "Halo ${nickname}" atau "Semangat ${nickname}" BUKAN "Halo, ${nickname}").
- JANGAN meletakkan tanda seru (!) langsung setelah nama saat menyapa (contoh: tulis "Halo ${nickname}." BUKAN "Halo ${nickname}!").
- Tulis nama panggilan dengan Title Case (contoh: "${nickname}" BUKAN "${nickname.toUpperCase()}").`;
  } else {
    userContent += `\n\n[ATURAN PENTING - WAJIB PATUH]: 
- JANGAN gunakan basa-basi/filler pembuka di awal kalimat (seperti "Wah, bagus banget...", "Tentu saja...", dsb). Langsung jawab inti pertanyaan pengguna di kalimat pertama.`;
  }

  if (selectedMode === 'fast') {
    userContent += `\n\n[PENTING - WAJIB PATUH]: Tulis respons kamu dengan jelas, berikan judul ### ... di baris pertama, jelaskan dalam 1-2 paragraf pendek yang kaya wawasan, dan WAJIB sertakan 2 opsi interaktif dengan format [OPSI: Pilihan] di baris paling akhir pesanmu.`;
  }

  const rawMessages: NvidiaMessage[] = [
    { role: 'system', content: systemPrompt },
    ...prunedHistory.map(h => ({
      role: (h.role === 'model' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: h.parts[0].text,
    })),
    { role: 'user', content: userContent },
  ]

  const messages = enforceAlternatingRoles(rawMessages);

  let fullText = ''
  let fullReasoning = ''
  try {
    const t_fetch_start = performance.now();
    console.log(`[VOKARA RAG] Firing POST /api/chat/nvidia fetch...`);
    const response = await callNvidiaWithRotation({
      model: decision.model,
      messages,
      temperature: decision.temperature,
      top_p: 0.7,
      max_tokens: decision.maxTokens || 2048,
      stream: !!onChunk,
    });

    const t_fetch_response = performance.now();
    console.log(`[VOKARA RAG] Fetch response headers received in ${(t_fetch_response - t_fetch_start).toFixed(1)}ms (Status: ${response.status})`);

    if (onChunk && response.body) {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let isFirstChunk = true;
      let t_first_chunk = 0;

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        if (isFirstChunk) {
          isFirstChunk = false;
          t_first_chunk = performance.now();
          console.log(`[VOKARA RAG] First stream chunk received in ${(t_first_chunk - t_fetch_response).toFixed(1)}ms! Total TTFB: ${(t_first_chunk - t_start).toFixed(1)}ms`);
        }

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
              let reasoning = delta.reasoning_content || ''

              // Discard reasoning specifically for Gemma models to keep response fast, direct, and distraction-free
              if (decision.model.includes('gemma')) {
                reasoning = ''
              }

              if (content || reasoning) {
                if (reasoning) {
                  fullReasoning += reasoning
                  onChunk({ content: '', reasoning })
                }
                if (content) {
                  fullText += content
                  onChunk({ content, reasoning: '' })
                }
              }
            } catch (e) {
              // Abaikan chunk yang korup
            }
          }
        }
      }

      // Process any remaining content in the buffer after stream ends
      if (buffer.trim()) {
        const line = buffer.trim();
        if (line !== 'data: [DONE]' && line.startsWith('data: ')) {
          try {
            const jsonStr = line.slice(6)
            const chunk = JSON.parse(jsonStr)
            const delta = chunk.choices?.[0]?.delta
            if (delta) {
              const content = delta.content || ''
              let reasoning = delta.reasoning_content || ''
              
              if (decision.model.includes('gemma')) {
                reasoning = ''
              }

              if (content || reasoning) {
                if (reasoning) {
                  fullReasoning += reasoning
                  onChunk({ content: '', reasoning })
                }
                if (content) {
                  fullText += content
                  onChunk({ content, reasoning: '' })
                }
              }
            }
          } catch (e) {
            // ignore
          }
        }
      }
    } else {

      const data = await response.json()
      const msg = data.choices?.[0]?.message
      fullText = msg?.content ?? ''
      fullReasoning = decision.model.includes('gemma') ? '' : (msg?.reasoning_content ?? '')
    }

  } catch (error: any) {
    console.error('[Router] NIM error:', error.message)
    throw error;
  }

  let hardcodedActions = extractQuickActions(fullText)
  let dynamicActions: any[] = [];

  // Parse dynamic multiple choice options (more robust regex for AI formatting mistakes)
  const opsiRegex = /(?:-|\*|\d+\.)*\s*\[?\*?OPS[I:]+\*?\]?\s*:?\s*(.*?)(?:\]|\n|$)/gi;
  let match;
  while ((match = opsiRegex.exec(fullText)) !== null) {
    const text = match[1].replace(/\*\*/g, '').trim();
    // Validate length to ensure it is a short option pill (not full paragraphs)
    if (text && text.length > 2 && text.length < 60) {
      dynamicActions.push({
        label: text,
        actionId: 'dynamic_option',
        payload: text
      });
    }
  }

  // Combine: dynamic actions first, then hardcoded ones
  if (dynamicActions.length < 2) {
    // Fallback: If AI ignores [OPSI:] and just outputs a bullet list at the end
    const fallbackRegex = /(?:\n\n|^)(?:(?:[^:\n]{0,80}:\s*[\n\s]*))?((?:(?:-|\*|\d+\.)\s+[^\n]+(?:\n|$))+)$/;
    const fallbackMatch = fullText.match(fallbackRegex);

    if (fallbackMatch && fallbackMatch[1]) {
      const bullets = fallbackMatch[1].split('\n').filter(l => l.trim().length > 0);

      if (bullets.length >= 1 && bullets.length <= 5) {
        bullets.forEach(b => {
          const text = b.replace(/^(?:-|\*|\d+\.)\s*/, '').replace(/\*\*|__/g, '').trim();
          if (text && text.length > 2 && text.length < 60) {
            dynamicActions.push({
              label: text,
              actionId: 'dynamic_option',
              payload: text
            });
          }
        });
        fullText = fullText.substring(0, fallbackMatch.index).trim();
      }
    }
  }

  // If we still have less than 2 dynamic options, call Gemma-3 to generate high-quality options
  if (dynamicActions.length < 2) {
    console.log(`[VOKARA RAG] Found only ${dynamicActions.length} dynamic options. Calling Gemma-3 to generate high-quality options...`);
    const gemmaActions = await generateOptionsWithGemma(fullText, userMajor);
    
    // Merge only valid options from Gemma
    for (const action of gemmaActions) {
      if (dynamicActions.length >= 2) break;
      if (action.label && action.label.length > 2 && action.label.length < 60 && !dynamicActions.some(a => a.label === action.label)) {
        dynamicActions.push(action);
      }
    }
  }

  // Double fallback: if still less than 2 dynamic options, use hardcoded major-specific defaults
  if (dynamicActions.length < 2) {
    console.log(`[VOKARA RAG] Options count is still ${dynamicActions.length} after Gemma. Injecting defaults...`);
    const defaultActions = getDefaultOptions(userMajor);
    for (const action of defaultActions) {
      if (dynamicActions.length >= 2) break;
      if (!dynamicActions.some(a => a.label === action.label)) {
        dynamicActions.push(action);
      }
    }
  }

  let quickActions = [...dynamicActions, ...hardcodedActions];

  // Remove the [OPSI: ...] tags from the final text, including surrounding newlines and any trailing cut-off tags
  fullText = fullText
    .replace(/(?:-|\*|\d+\.)*\s*\[?\*?OPS[I:]+\*?\]?\s*:?\s*.*?(?:\]|$)/gmi, '\n')
    .replace(/(?:\n|\s)*\[OPS[I:]*.*?$/gi, '')
    .trim();

  // Bypassed fetchMetadataBackground as it is currently 100% dead weight (UI doesn't render it)
  // and blocking here adds 6-9 seconds of extra E2E latency after streaming completes.
  /*
  if (decision.fetchMetadataBg) {
    try {
      const meta = await fetchMetadataBackground(fullText, userMajor, decision.intents)
      trendData = meta.trendData
      videoRecommendation = meta.videoRecommendation
    } catch {  }
  }
  */

  const estimateTokenCount = (text: string): number => {
    if (!text) return 0;
    return Math.ceil(text.length / 4); // Standard 4-character rule of thumb for tokens
  };

  const promptText = messages.map(m => `${m.role}: ${m.content}`).join('\n');
  const promptTokens = estimateTokenCount(promptText);
  const completionTokens = estimateTokenCount(fullText + fullReasoning);
  const totalTokens = promptTokens + completionTokens;

  console.log(`%c[VOKARA TOKEN METRICS]%c
  - Prompt: ~${promptTokens} tokens (${promptText.length} chars)
  - Completion: ~${completionTokens} tokens (Content: ${fullText.length} chars, Reasoning: ${fullReasoning.length} chars)
  - Total: ~${totalTokens} tokens`, 
  'color: #10b981; font-weight: bold;', 'color: inherit;');

  return {
    text: fullText,
    quickActions,
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
    const res = await callNvidiaWithRotation({
      model: 'google/gemma-4-31b-it',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 256,
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    const match = content.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : {};
  } catch {
    return {};
  }
}

export const summarizeTextNvidia = async (text: string): Promise<string> => {
  try {
    const res = await callNvidiaWithRotation({
      model: 'google/gemma-4-31b-it',
      messages: [{
        role: 'user',
        content: `Ringkas ini menjadi 3-4 poin bullet. Singkat, langsung ke inti:\n\n${text.slice(0, 1000)}`,
      }],
      temperature: 0.2,
      max_tokens: 200,
    });

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? '';
  } catch {
    return text.slice(0, 200) + '...';
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
    const res = await callNvidiaWithRotation({
      model: 'google/gemma-4-31b-it',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 150,
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    const match = content.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [];
  } catch {
    return [];
  }
}

// Helper to generate a short title for a chat session
export async function generateChatTitle(firstMessage: string): Promise<string> {
  try {
    const response = await callNvidiaWithRotation({
      messages: [
        { role: 'system', content: 'Anda adalah asisten yang bertugas membuat judul singkat untuk percakapan. Balas HANYA dengan judulnya saja (maksimal 4 kata), tanpa tanda kutip, tanpa penjelasan.' },
        { role: 'user', content: `Buatkan judul singkat untuk percakapan yang dimulai dengan pesan ini: "${firstMessage}"` }
      ],
      model: "google/gemma-4-31b-it",
      temperature: 0.3,
      max_tokens: 50,
      stream: true
    });

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
