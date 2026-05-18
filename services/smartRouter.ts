// ============================================================
// smartRouter.ts
// Smart routing untuk KarirSMK
//
// Strategi:
// 1. Classify query → 3 tier (QUICK / STANDARD / DEEP)
// 2. Adaptive token budget per tier
// 3. Selective RAG injection — hanya data yang relevan
// 4. Eliminasi API call ke-2 (metadata via background, non-blocking)
// 5. Fallback & rotasi otomatis API keys NVIDIA jika limit/error
// ============================================================

import { getScholarshipContext, getDUDIContext, getCareerPathContext, getCourseContext, getHumanizerContext } from './RAG_SETUP'

export type QueryTier = 'QUICK' | 'STANDARD' | 'DEEP'

export type QueryIntent =
  | 'greeting'
  | 'career_advice'
  | 'job_search'
  | 'scholarship'
  | 'course_rec'
  | 'cv_help'
  | 'trend_data'
  | 'roadmap'
  | 'college_info'
  | 'interview_tips'
  | 'out_of_scope'

export interface RouteDecision {
  tier: QueryTier
  intents: QueryIntent[]
  model: string              // model string untuk NIM
  maxTokens: number
  temperature: number
  historyLimit: number       // berapa pesan history yang dibawa
  ragKeys: RagKey[]          // data apa yang diinjeksi
  fetchMetadataBg: boolean   // fetch trend/video di background (non-blocking)
}

export type RagKey = 'scholarships' | 'dudi' | 'career_paths' | 'courses' | 'trends' | 'humanizer'

// ============================================================
// MODEL CONFIG
// ============================================================

const MODELS = {
  flash: 'stepfun-ai/step-3.5-flash',   // main — fast & cheap
} as const

// ============================================================
// TOKEN BUDGET PER TIER
// Benchmark rata-rata: flash ~60 tok/s di NIM
// ============================================================

const TOKEN_BUDGET: Record<QueryTier, { maxTokens: number; historyLimit: number }> = {
  QUICK:    { maxTokens: 1024, historyLimit: 2 },
  STANDARD: { maxTokens: 2048, historyLimit: 6 },
  DEEP:     { maxTokens: 4096, historyLimit: 10 },
}


const TEMPERATURE: Record<QueryTier, number> = {
  QUICK:    0.3,
  STANDARD: 0.5,
  DEEP:     0.7,
}

// ============================================================
// INTENT DETECTION
// Rule-based — zero latency, zero extra API call
// ============================================================

const INTENT_PATTERNS: Record<QueryIntent, string[]> = {
  greeting:       ['halo', 'hai', 'hi', 'selamat', 'pagi', 'siang', 'malam', 'apa kabar', 'hei', 'test', 'bantu', 'tanya'],
  career_advice:  ['karir', 'kerja', 'kerjaan', 'profesi', 'bidang', 'jurusan', 'prospek', 'masa depan', 'setelah lulus', 'peluang', 'sukses', 'jadi apa'],
  job_search:     ['loker', 'lowongan', 'magang', 'pkl', 'rekrut', 'hiring', 'lamar', 'perusahaan', 'gaji', 'dudi', 'industri', 'cari kerja'],
  scholarship:    ['beasiswa', 'bantuan biaya', 'kip', 'biaya kuliah', 'subsidi', 'dana pendidikan', 'gratis', 'kuliah free'],
  course_rec:     ['kursus', 'belajar', 'sertifikat', 'pelatihan', 'skill', 'dicoding', 'myskill', 'kompetensi', 'bootcamp', 'belajar apa', 'asah'],
  cv_help:        ['cv', 'resume', 'lamaran', 'portofolio', 'riwayat hidup', 'surat lamaran', 'bikin cv', 'buat cv'],
  trend_data:     ['tren', 'grafik', 'statistik', 'data', 'permintaan pasar', 'populer', 'demand'],
  roadmap:        ['roadmap', 'langkah', 'alur', 'rencana', 'plan', 'tahapan', 'mulai dari mana', 'panduan'],
  college_info:   ['kuliah', 'snbp', 'snbt', 'universitas', 'perguruan tinggi', 'ptn', 'pts', 'politeknik', 'lanjut sekolah', 'jalur masuk', 'kartu indonesia pintar', 'kip-k'],
  interview_tips: ['wawancara', 'interview', 'tes', 'psikotes', 'seleksi', 'pertanyaan hrd', 'teknis', 'user'],
  out_of_scope:   ['pacar', 'cinta', 'bucin', 'agama', 'politik', 'pemerintah', 'pertandingan', 'bola', 'game', 'netflix', 'puisi', 'pantun', 'cerpen', 'novel'],

}

export function detectIntents(message: string): QueryIntent[] {
  const lower = message.toLowerCase()
  return (Object.entries(INTENT_PATTERNS) as [QueryIntent, string[]][])
    .filter(([, keywords]) => keywords.some(kw => lower.includes(kw)))
    .map(([intent]) => intent)
}

/**
 * Detect emotional signals in user message
 * Used to boost emotional support chunks in retrieval
 */
export function detectEmotionSignals(message: string): boolean {
  const signals = [
    'bingung', 'takut', 'khawatir', 'galau', 'stress', 'cemas',
    'minder', 'nggak yakin', 'gamau', 'nyerah', 'susah', 'susah banget',
    'nangis', 'sedih', 'hopeless', 'nyesel', 'malu', 'nggak bisa',
    'overwhelmed', 'burnout', 'capek banget', 'udah usaha', 'gak sanggup'
  ]
  const lower = message.toLowerCase()
  return signals.some(signal => lower.includes(signal))
}

// ============================================================
// TIER CLASSIFICATION
// Ditentukan dari kombinasi intent + karakteristik pesan
// ============================================================

export function classifyTier(intents: QueryIntent[], message: string, hasFile: boolean): QueryTier {
  if (hasFile) return 'DEEP'
  if (intents.includes('out_of_scope') && intents.length === 1) return 'QUICK'
  if (intents.length === 1 && intents.includes('greeting')) return 'QUICK'
  if (intents.length === 0 && message.split(' ').length <= 5) return 'QUICK'

  const deepIntents: QueryIntent[] = ['roadmap', 'cv_help']
  if (deepIntents.some(i => intents.includes(i))) return 'DEEP'
  if (intents.length >= 3) return 'DEEP'

  return 'STANDARD'
}

// ============================================================
// RAG KEY SELECTION
// Tentukan data apa yang perlu diinjeksi ke system prompt
// ============================================================

function selectRagKeys(intents: QueryIntent[]): RagKey[] {
  const ragMap: Partial<Record<QueryIntent, RagKey[]>> = {
    scholarship:  ['scholarships'],
    job_search:   ['dudi'],
    career_advice:['career_paths'],
    course_rec:   ['courses'],
    trend_data:   ['trends', 'career_paths'],
    roadmap:      ['career_paths', 'courses'],
    college_info: ['career_paths'],
    cv_help:      ['career_paths'],
  }

  const keys = new Set<RagKey>()
  intents.forEach(intent => {
    ragMap[intent]?.forEach(k => keys.add(k))
  })

  // Always include career paths and humanizer guide
  if (keys.size === 0) keys.add('career_paths')
  keys.add('humanizer')

  return Array.from(keys)
}

// ============================================================
// MAIN ROUTER
// ============================================================

export function route(
  message: string,
  hasFile: boolean = false,
): RouteDecision {
  const intents = detectIntents(message)
  const tier = classifyTier(intents, message, hasFile)
  const budget = TOKEN_BUDGET[tier]

  const fetchMetadataBg =
    tier !== 'QUICK' &&
    (intents.includes('trend_data') ||
      message.toLowerCase().includes('video') ||
      message.toLowerCase().includes('youtube'))

  return {
    tier,
    intents,
    model: MODELS.flash,
    maxTokens: budget.maxTokens,
    temperature: TEMPERATURE[tier],
    historyLimit: budget.historyLimit,
    ragKeys: selectRagKeys(intents),
    fetchMetadataBg,
  }
}

// ============================================================
// HISTORY PRUNER
// ============================================================

export function pruneHistory(
  history: { role: string; parts: { text: string }[] }[],
  limit: number
): typeof history {
  if (history.length <= limit) return history;
  
  // Ensure we keep at least 6 recent messages to preserve context continuity
  const MIN_RECENT = 6;
  const keepFromEnd = Math.max(limit - 1, MIN_RECENT);
  
  const first = history[0];
  const recent = history.slice(-keepFromEnd);
  return [first, ...recent];
}

// ============================================================
// SYSTEM PROMPT BUILDER
// ============================================================

export function buildCompactSystemPrompt(
  userMajor: string,
  ragKeys: RagKey[],
): string {
  const ragBlocks: string[] = []

  if (ragKeys.includes('scholarships')) {
    const data = getScholarshipContext()
    if (data) ragBlocks.push(`## BEASISWA\n${data}`)
  }
  if (ragKeys.includes('dudi')) {
    const data = getDUDIContext(userMajor)
    if (data) ragBlocks.push(`## DUDI\n${data}`)
  }
  if (ragKeys.includes('career_paths')) {
    const data = getCareerPathContext(userMajor)
    if (data) ragBlocks.push(`## KARIR & SKILL\n${data}`)
  }
  if (ragKeys.includes('courses')) {
    const data = getCourseContext(userMajor)
    if (data) ragBlocks.push(`## KURSUS\n${data}`)
  }
  if (ragKeys.includes('humanizer')) {
    const data = getHumanizerContext()
    if (data) ragBlocks.push(data)
  }

  const ragSection = ragBlocks.length
    ? `\n\nREF DATA (WAJIB):\n${ragBlocks.join('\n\n')}`
    : ''

  return `KAMU VOKARA, Mentor Karir AI khusus siswa SMK.
IDENTITAS (MANDATORI):
1. KAMU ADALAH AI: Jangan pernah mengaku manusia. Kalau ditanya, kamu adalah AI Career Mentor yang dilatih untuk membantu siswa SMK.
2. BAHASA: Gunakan 100% Bahasa Indonesia yang natural. DILARANG KERAS menggunakan karakter Mandarin/Cina (Hanja/Kanji) atau bahasa selain Indonesia.
3. NO NOISE: Jangan pernah mengeluarkan celetukan kecil yang tidak bermakna atau gumaman seperti "eh,", "coincidence?", "巧合?", atau sejenisnya. Fokus 100% pada informasi.
4. HUMAN-LIKE: Bicara santai tapi pro, seperti kakak mentor yang berpengalaman di industri. 
5. EKSPRESI (PENTING): Gunakan tag ekspresi <breath> di awal paragraf atau sebelum menjelaskan hal penting, <laugh> jika bercanda/ramah, dan <sigh> jika ada hal yang kurang baik/serius. Gunakan secukupnya agar natural.
6. GAYA: No AI-isms (merupakan, bukti nyata, vital, krusial). RITME: Campur kalimat pendek & panjang. 
7. AKU: Pakai "Aku" & "Kamu".
8. NO FILLER: Langsung ke poin, no "Tentu!", no "Semoga membantu".
9. JURUSAN: Fokus ke ${userMajor}.
10. OUT-OF-SCOPE: Tolak halus topik di luar karir/pendidikan (asmara, politik, agama, hiburan, puisi non-karir). Alihkan kembali ke masa depan & skill SMK.
11. FORMAT: Double enter antar paragraf, max 3 kalimat per paragraf. Gunakan TABEL jika bandingkan data.${ragSection}`

}


// ============================================================
// QUICK ACTION DETECTOR
// ============================================================

export function extractQuickActions(text: string) {
  const lower = text.toLowerCase()
  const actions = []

  if (['loker', 'lowongan', 'magang', 'pkl', 'perusahaan', 'gaji'].some(k => lower.includes(k)))
    actions.push({ label: 'Cari Loker/Magang', actionId: 'search_jobs' as const })

  if (['tren', 'grafik', 'statistik', 'permintaan', 'demand'].some(k => lower.includes(k)))
    actions.push({ label: 'Lihat Tren Karir', actionId: 'view_trends' as const })

  if (['cv', 'resume', 'lamaran', 'portofolio'].some(k => lower.includes(k)))
    actions.push({ label: 'Buat CV SMK', actionId: 'create_cv' as const })

  if (['beasiswa', 'dana', 'bantuan biaya', 'kip'].some(k => lower.includes(k)))
    actions.push({ label: 'Cari Beasiswa', actionId: 'search_scholarships' as const })

  if (['kursus', 'sertifikat', 'pelatihan', 'kuliah', 'kampus'].some(k => lower.includes(k)))
    actions.push({ label: 'Kursus & Kampus', actionId: 'search_courses' as const })

  return actions.slice(0, 2) 
}
