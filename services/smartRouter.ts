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
  llama: 'meta/llama-3.1-8b-instruct',   // main — warm-cached, ultra-fast & high quality
  gemma: 'google/gemma-3n-e4b-it',        // Google Gemma 3 4B Instruct — extremely fast & lightweight
} as const

// ============================================================
// TOKEN BUDGET PER TIER
// Benchmark rata-rata: flash ~60 tok/s di NIM
// ============================================================

const TOKEN_BUDGET: Record<QueryTier, { maxTokens: number; historyLimit: number }> = {
  QUICK: { maxTokens: 2048, historyLimit: 2 },
  STANDARD: { maxTokens: 3072, historyLimit: 6 },
  DEEP: { maxTokens: 4096, historyLimit: 10 },
}


const TEMPERATURE: Record<QueryTier, number> = {
  QUICK: 0.3,
  STANDARD: 0.4,
  DEEP: 0.5,
}

// ============================================================
// INTENT DETECTION
// Rule-based — zero latency, zero extra API call
// ============================================================

const INTENT_PATTERNS: Record<QueryIntent, string[]> = {
  greeting: ['halo', 'hai', 'hi', 'selamat', 'pagi', 'siang', 'malam', 'apa kabar', 'hei', 'test', 'bantu', 'tanya'],
  career_advice: ['karir', 'kerja', 'kerjaan', 'profesi', 'bidang', 'jurusan', 'prospek', 'masa depan', 'setelah lulus', 'peluang', 'sukses', 'jadi apa'],
  job_search: ['loker', 'lowongan', 'magang', 'pkl', 'rekrut', 'hiring', 'lamar', 'perusahaan', 'gaji', 'dudi', 'industri', 'cari kerja'],
  scholarship: ['beasiswa', 'bantuan biaya', 'kip', 'biaya kuliah', 'subsidi', 'dana pendidikan', 'gratis', 'kuliah free'],
  course_rec: ['kursus', 'belajar', 'sertifikat', 'pelatihan', 'skill', 'dicoding', 'myskill', 'kompetensi', 'bootcamp', 'belajar apa', 'asah'],
  cv_help: ['cv', 'resume', 'lamaran', 'portofolio', 'riwayat hidup', 'surat lamaran', 'bikin cv', 'buat cv'],
  trend_data: ['tren', 'grafik', 'statistik', 'data', 'permintaan pasar', 'populer', 'demand'],
  roadmap: ['roadmap', 'langkah', 'alur', 'rencana', 'plan', 'tahapan', 'mulai dari mana', 'panduan'],
  college_info: ['kuliah', 'snbp', 'snbt', 'universitas', 'perguruan tinggi', 'ptn', 'pts', 'politeknik', 'lanjut sekolah', 'jalur masuk', 'kartu indonesia pintar', 'kip-k'],
  interview_tips: ['wawancara', 'interview', 'tes', 'psikotes', 'seleksi', 'pertanyaan hrd', 'teknis', 'user'],
  out_of_scope: ['pacar', 'cinta', 'bucin', 'agama', 'politik', 'pemerintah', 'pertandingan', 'bola', 'game', 'netflix', 'puisi', 'pantun', 'cerpen', 'novel'],

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
    scholarship: ['scholarships'],
    job_search: ['dudi'],
    career_advice: ['career_paths'],
    course_rec: ['courses'],
    trend_data: ['trends', 'career_paths'],
    roadmap: ['career_paths', 'courses'],
    college_info: ['career_paths'],
    cv_help: ['career_paths'],
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
  selectedMode: 'fast' | 'adaptive' | 'deep' = 'adaptive',
): RouteDecision {
  const intents = detectIntents(message)
  
  let tier: QueryTier = 'STANDARD'
  let model: string = MODELS.llama
  let maxTokens = 2048
  let temperature = 0.4
  let historyLimit = 6
  let fetchMetadataBg = false

  if (selectedMode === 'fast') {
    tier = 'QUICK'
    model = MODELS.gemma
    maxTokens = 1024
    temperature = 0.5
    historyLimit = 3
    fetchMetadataBg = false
  } else if (selectedMode === 'deep') {
    tier = 'DEEP'
    // Deep mode utilizes the StepFun 3.5 Flash model for high-performance reasoning and agentic tasks
    model = 'stepfun-ai/step-3.5-flash'
    maxTokens = 4096
    temperature = 0.6
    historyLimit = 10
    fetchMetadataBg = true
  } else {
    // Adaptive mode (default smart router tier classification)
    tier = classifyTier(intents, message, hasFile)
    const budget = TOKEN_BUDGET[tier]
    model = MODELS.llama
    maxTokens = budget.maxTokens
    temperature = TEMPERATURE[tier]
    historyLimit = budget.historyLimit
    fetchMetadataBg =
      tier !== 'QUICK' &&
      (intents.includes('trend_data') ||
        message.toLowerCase().includes('video') ||
        message.toLowerCase().includes('youtube'))
  }

  return {
    tier,
    intents,
    model,
    maxTokens,
    temperature,
    historyLimit,
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

  // If the limit is small (e.g., 3 or less in Fast mode), respect it strictly to prevent context contamination
  const keepFromEnd = limit <= 3 ? limit : Math.max(limit - 1, 6);

  const first = history[0];
  const recent = history.slice(-keepFromEnd);
  return [first, ...recent];
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
