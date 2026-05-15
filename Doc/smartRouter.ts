// ============================================================
// smartRouter.ts
// Smart routing untuk KarirSMK
//
// Strategi:
// 1. Classify query → 3 tier (QUICK / STANDARD / DEEP)
// 2. Adaptive token budget per tier
// 3. Selective RAG injection — hanya data yang relevan
// 4. Eliminasi API call ke-2 (metadata via background, non-blocking)
// 5. Auto-fallback NIM → Gemini jika error
// 6. File upload (PDF) → selalu route ke Gemini (multimodal)
// ============================================================

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
  forceGemini: boolean       // true = bypass NIM, langsung Gemini
}

export type RagKey = 'scholarships' | 'dudi' | 'career_paths' | 'courses' | 'trends'

// ============================================================
// MODEL CONFIG
// ============================================================

const MODELS = {
  flash: 'stepfun-ai/step-3.5-flash',   // main — fast & cheap
  // heavy: 'meta/llama-3.1-70b-instruct', // opsional untuk DEEP tier
} as const

// ============================================================
// TOKEN BUDGET PER TIER
// Benchmark rata-rata: flash ~60 tok/s di NIM
// ============================================================

const TOKEN_BUDGET: Record<QueryTier, { maxTokens: number; historyLimit: number }> = {
  QUICK:    { maxTokens: 256,  historyLimit: 2 },  // ~4 detik
  STANDARD: { maxTokens: 512,  historyLimit: 6 },  // ~8 detik
  DEEP:     { maxTokens: 1024, historyLimit: 10 }, // ~17 detik
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
  greeting:       ['halo', 'hai', 'hi', 'selamat', 'pagi', 'siang', 'malam', 'apa kabar', 'hei', 'test'],
  career_advice:  ['karir', 'kerja', 'kerjaan', 'profesi', 'bidang', 'jurusan', 'prospek', 'masa depan', 'setelah lulus', 'peluang'],
  job_search:     ['loker', 'lowongan', 'magang', 'pkl', 'rekrut', 'hiring', 'lamar', 'perusahaan', 'gaji'],
  scholarship:    ['beasiswa', 'bantuan biaya', 'kip', 'biaya kuliah', 'subsidi', 'dana pendidikan'],
  course_rec:     ['kursus', 'belajar', 'sertifikat', 'pelatihan', 'skill', 'dicoding', 'myskill', 'kompetensi', 'bootcamp'],
  cv_help:        ['cv', 'resume', 'lamaran', 'portofolio', 'riwayat hidup', 'surat lamaran'],
  trend_data:     ['tren', 'grafik', 'statistik', 'data', 'permintaan pasar', 'populer', 'demand'],
  roadmap:        ['roadmap', 'langkah', 'alur', 'rencana', 'plan', 'tahapan', 'mulai dari mana', 'panduan'],
  college_info:   ['kuliah', 'snbp', 'snbt', 'universitas', 'perguruan tinggi', 'ptn', 'pts', 'politeknik', 'lanjut sekolah'],
  interview_tips: ['wawancara', 'interview', 'tes', 'psikotes', 'seleksi', 'pertanyaan hrd'],
  out_of_scope:   ['pacar', 'cinta', 'bucin', 'agama', 'politik', 'pemerintah', 'pertandingan', 'bola', 'game', 'netflix'],
}

export function detectIntents(message: string): QueryIntent[] {
  const lower = message.toLowerCase()
  return (Object.entries(INTENT_PATTERNS) as [QueryIntent, string[]][])
    .filter(([, keywords]) => keywords.some(kw => lower.includes(kw)))
    .map(([intent]) => intent)
}

// ============================================================
// TIER CLASSIFICATION
// Ditentukan dari kombinasi intent + karakteristik pesan
// ============================================================

export function classifyTier(intents: QueryIntent[], message: string, hasFile: boolean): QueryTier {
  // File upload → selalu DEEP (analisis dokumen)
  if (hasFile) return 'DEEP'

  // Out of scope → QUICK (tolak dengan cepat)
  if (intents.includes('out_of_scope') && intents.length === 1) return 'QUICK'

  // Greeting saja → QUICK
  if (intents.length === 1 && intents.includes('greeting')) return 'QUICK'
  if (intents.length === 0 && message.split(' ').length <= 5) return 'QUICK'

  // DEEP tier triggers — butuh reasoning panjang
  const deepIntents: QueryIntent[] = ['roadmap', 'cv_help']
  if (deepIntents.some(i => intents.includes(i))) return 'DEEP'

  // Multi-intent → STANDARD ke atas
  if (intents.length >= 3) return 'DEEP'

  // Default → STANDARD
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

  // Max 2 RAG keys per request — cegah context bloat
  return Array.from(keys).slice(0, 2)
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

  // File (CV) → force Gemini karena multimodal
  const forceGemini = hasFile

  // Fetch trend/video di background hanya jika STANDARD ke atas
  // dan ada intent yang relevan — non-blocking, tidak ganggu streaming
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
    forceGemini,
  }
}

// ============================================================
// HISTORY PRUNER
// Potong history berdasarkan limit dari RouteDecision
// Selalu pertahankan pesan pertama (konteks jurusan)
// ============================================================

export function pruneHistory(
  history: { role: string; parts: { text: string }[] }[],
  limit: number
): typeof history {
  if (history.length <= limit) return history
  // Pertahankan pesan pertama + N pesan terakhir
  const first = history[0]
  const recent = history.slice(-limit + 1)
  return [first, ...recent]
}

// ============================================================
// SYSTEM PROMPT BUILDER
// Compact — hanya inject RAG yang relevan
// ============================================================

import { getScholarshipContext, getDUDIContext, getCareerPathContext, getCourseContext } from './RAG_SETUP'

export function buildCompactSystemPrompt(
  userMajor: string,
  ragKeys: RagKey[],
): string {
  const ragBlocks: string[] = []

  if (ragKeys.includes('scholarships')) {
    const data = getScholarshipContext()
    if (data) ragBlocks.push(`## Beasiswa Tersedia\n${data}`)
  }
  if (ragKeys.includes('dudi')) {
    const data = getDUDIContext(userMajor)
    if (data) ragBlocks.push(`## Mitra Kerja Sekolah\n${data}`)
  }
  if (ragKeys.includes('career_paths')) {
    const data = getCareerPathContext(userMajor)
    if (data) ragBlocks.push(data)
  }
  if (ragKeys.includes('courses')) {
    const data = getCourseContext(userMajor)
    if (data) ragBlocks.push(`## Kursus Rekomendasi\n${data}`)
  }

  const ragSection = ragBlocks.length
    ? `\n\n---\n## DATA REFERENSI (gunakan sebagai acuan utama)\n${ragBlocks.join('\n\n')}`
    : ''

  // System prompt compact — ~300 token
  return `PERAN: Kak Karir, mentor karir SMK ${userMajor} yang santun & spesifik.

ATURAN:
1. Panggil "kamu". Bahasa natural, ada emoji tiap paragraf.
2. SINGKAT: maks 3 kalimat per paragraf, langsung ke inti.
3. SPESIFIK: selalu kaitkan dengan jurusan ${userMajor}.
4. Jika tidak tahu data spesifik, katakan terus terang & arahkan ke sumber.
5. Tolak topik non-karir dengan sopan, alihkan ke topik karir.
6. Gunakan tabel Markdown untuk data perbandingan/gaji/skill.${ragSection}`
}

// ============================================================
// QUICK ACTION DETECTOR
// Dari teks respons AI — tetap rule-based, zero extra call
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

  return actions.slice(0, 3) // max 3 quick actions
}
