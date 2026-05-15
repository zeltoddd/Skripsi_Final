# PROJECT-LITE.md — KarirSMK v2.0 (Skripsi Edition)
> **Scope: Uji Ahli — Sidang Akhir**
> Sprint target: 1–2 minggu
> Full roadmap ada di `PROJECT.md` → digunakan sebagai bahan **Saran Penelitian Selanjutnya**

---

## Prinsip Pengerjaan

> **Functional Prototype, bukan Production System.**
> Semua fitur yang disebut di paper harus bisa diklik dan ada halamannya.
> Data dummy/statis diperbolehkan kecuali untuk fitur inti penelitian.

---

## Status Fitur

| Fitur | Target | Keterangan |
|---|---|---|
| Chat AI + Persona "Kak Karir" | ✅ **Full implement** | Fitur inti, harus jalan beneran |
| Multi-provider AI (NVIDIA NIM + Gemini) | ✅ **Full implement** | Kontribusi utama penelitian |
| Smart Routing (tier-based, adaptive token) | ✅ **Full implement** | Efisiensi token & latensi |
| Admin: ganti provider & API key | ✅ **Full implement** | Bukti kontribusi multi-provider |
| CV Upload & Analisis PDF | ✅ **Full implement** | Fitur inti existing |
| CV Wizard + export | ✅ **Full implement** | Fitur inti existing |
| Quick Actions (Loker, Kursus, Tren, Beasiswa) | ✅ **Full implement** | Fitur inti existing |
| Career Trend Chart | ✅ **Full implement** | Visual, bagus untuk demo |
| Dark / Light mode | ✅ **Full implement** | Sudah ada, tinggal ported |
| Scholarship Tracker | ✅ **Data dari sekolah mitra** | Data riil hardcoded JSON, filter by jurusan |
| Job Board | 🟡 **UI + dummy data** | 10–15 item hardcoded, filter by jurusan |
| Counselor Panel | 🟡 **UI statis** | Halaman ada, data dummy/mockup |
| Chat session history | 🟡 **localStorage** | Simpan sesi lokal, cukup untuk demo |
| Auth / Login | ❌ **Skip** | Masuk saran penelitian selanjutnya |
| Database production | ❌ **Skip** | localStorage + JSON file cukup |
| Multi-tenant / multi-sekolah | ❌ **Skip** | Saran penelitian selanjutnya |
| Notifikasi email | ❌ **Skip** | Saran penelitian selanjutnya |

---

## Tech Stack (Simplified)

```
Framework  : React + TypeScript (Vite) — sama seperti prototipe asli
Styling    : Tailwind CSS + shadcn/ui
State      : useState / useContext (tidak perlu Zustand)
Storage    : localStorage (session history, settings)
Data       : JSON constants (scholarship, job board, majors)
Charts     : Recharts (sudah ada di prototipe)
Icons      : Lucide React
PDF        : (existing) tetap pakai implementasi sebelumnya
AI Layer   : Custom provider abstraction (lihat bawah)
```

> **Kenapa tidak Next.js?** Waktu setup lebih singkat dengan Vite. Migrasi ke Next.js masuk saran penelitian selanjutnya di `PROJECT.md`.

---

## Struktur Proyek

```
karirsmk-lite/
├── src/
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx       # Main chat (rebuilt UI)
│   │   │   ├── MessageBubble.tsx       # Rich bubble (text, chart, video, source)
│   │   │   ├── MessageInput.tsx        # Input bar + file attach
│   │   │   ├── QuickActions.tsx
│   │   │   ├── TrendChart.tsx
│   │   │   ├── SessionSidebar.tsx      # Riwayat dari localStorage
│   │   │   └── WelcomeScreen.tsx
│   │   ├── cv/
│   │   │   ├── CVWizard.tsx
│   │   │   └── CVPreview.tsx
│   │   ├── scholarship/
│   │   │   └── ScholarshipList.tsx     # Data dari sekolah mitra
│   │   ├── jobs/
│   │   │   └── JobBoard.tsx            # UI + dummy data
│   │   ├── counselor/
│   │   │   └── CounselorDashboard.tsx  # UI statis / mockup
│   │   ├── admin/
│   │   │   ├── ProviderSettings.tsx    # Ganti provider + API key
│   │   │   └── PersonaSettings.tsx     # Edit system prompt (opsional)
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx             # Navigasi utama
│   │   │   ├── Header.tsx
│   │   │   └── MajorSelector.tsx       # Pilih jurusan (onboarding simple)
│   │   └── ui/                         # shadcn/ui components
│   │
│   ├── services/
│   │   ├── aiProvider.ts               # Abstraksi multi-provider (BARU)
│   │   ├── gemini.ts                   # Provider Gemini (dari prototipe, refactor)
│   │   ├── openai.ts                   # Provider OpenAI (BARU)
│   │   └── groq.ts                     # Provider Groq (BARU)
│   │
│   ├── data/
│   │   ├── scholarships.ts             # Data beasiswa dari sekolah mitra
│   │   ├── jobs.ts                     # Dummy job listings
│   │   ├── majors.ts                   # Daftar jurusan SMK
│   │   └── suggestions.ts             # Suggestion chips per jurusan
│   │
│   ├── hooks/
│   │   ├── useChat.ts                  # Chat logic + session management
│   │   ├── useProvider.ts              # Load active AI provider dari settings
│   │   └── useLocalStorage.ts
│   │
│   ├── constants/
│   │   └── persona.ts                  # System prompt "Kak Karir"
│   │
│   ├── types.ts                        # (dari prototipe, extended)
│   ├── App.tsx
│   └── main.tsx
│
├── .env.local                          # API keys default (dev only)
├── package.json
└── vite.config.ts
```

---

## AI Provider Abstraction (Kontribusi Utama)

```typescript
// services/aiProvider.ts

export type ProviderName = 'gemini' | 'openai' | 'groq'

export interface ProviderConfig {
  provider: ProviderName
  apiKey: string
  model: string
  temperature?: number
}

export interface AIProvider {
  sendMessage(prompt: string, history: Message[], major: string, file?: FileData): Promise<AIResponse>
  summarize(text: string): Promise<string>
}

// Load config dari localStorage (disimpan via admin settings)
export function getActiveProvider(): AIProvider {
  const config: ProviderConfig = JSON.parse(
    localStorage.getItem('ai_provider_config') ?? '{}'
  ) || DEFAULT_CONFIG

  switch (config.provider) {
    case 'openai':  return new OpenAIProvider(config)
    case 'groq':    return new GroqProvider(config)
    default:        return new GeminiProvider(config)
  }
}
```

**Provider yang diimplementasi:**
- **Gemini** — refactor dari `geminiService.ts` yang sudah ada
- **OpenAI** — `gpt-4o-mini` (murah, cepat, cukup untuk demo)
- **Groq** — `llama-3.3-70b-versatile` (gratis tier, ultra-fast, impressive untuk demo)

---

## Admin Settings (Tanpa Auth)

Halaman `/admin` diakses via tombol tersembunyi di header (shift+klik logo, atau route langsung). Tidak perlu login — cukup untuk konteks skripsi uji ahli.

**Yang bisa dikonfigurasi:**
- Pilih provider aktif (Gemini / OpenAI / Groq)
- Input API key per provider
- Pilih model
- Slider temperature
- Tombol "Test Koneksi" → kirim test message ke provider
- Semua disimpan ke `localStorage`

---

## Data Beasiswa (Sekolah Mitra)

```typescript
// data/scholarships.ts

export interface Scholarship {
  id: string
  name: string
  provider: string          // instansi pemberi beasiswa
  type: 'prestasi' | 'ekonomi' | 'minat-bakat'
  deadline: string          // ISO date
  major: string[]           // jurusan yang eligible, [] = semua
  requirements: string[]
  benefit: string           // nominal atau deskripsi
  contact: string
  link?: string
}

export const SCHOLARSHIPS: Scholarship[] = [
  // → diisi dari data yang kamu dapat dari sekolah mitra
  // contoh struktur:
  {
    id: 'bsm-2025',
    name: 'Beasiswa Siswa Berprestasi ...',
    provider: '...',
    type: 'prestasi',
    deadline: '2025-09-30',
    major: [],              // semua jurusan
    requirements: ['Nilai rata-rata min 80', 'Aktif organisasi'],
    benefit: 'Rp 500.000/bulan selama 1 tahun',
    contact: 'BK SMK ...',
  },
  // tambah dari data sekolah mitra...
]
```

Di UI: tampilkan sebagai card grid, filter by jurusan pengguna & tipe beasiswa, badge "Deadline Dekat" jika < 30 hari.

---

## Sprint Plan (10 Hari Kerja)

| Hari | Target |
|---|---|
| 1 | Setup project, install dependencies, routing dasar (Chat, Jobs, Scholarship, Counselor, Admin) |
| 2 | Port + rebuild UI Chat (MessageBubble, MessageInput, WelcomeScreen) |
| 3 | AI Provider abstraction + integrasi Gemini (port dari prototipe) |
| 4 | Tambah OpenAI provider + Groq provider |
| 5 | Admin settings page (provider switcher, API key input, test koneksi) |
| 6 | Session history localStorage + sidebar riwayat |
| 7 | Scholarship page (data sekolah mitra, filter, card UI) |
| 8 | Job board (dummy data) + Counselor panel (UI statis) |
| 9 | CV Wizard port + polish semua halaman |
| 10 | Bug fix, dark mode, responsive check, screenshot untuk laporan |

---

## Halaman & Route

```
/               → Onboarding pilih jurusan (jika belum dipilih) → redirect ke /chat
/chat           → Chat interface utama (sesi baru)
/chat/:id       → Resume sesi dari history
/scholarship    → Daftar beasiswa dari sekolah mitra
/jobs           → Job board (dummy)
/cv             → CV Builder
/counselor      → Counselor dashboard (UI statis)
/admin          → Provider & persona settings
```

---

## Yang Masuk "Saran Penelitian Selanjutnya" (dari PROJECT.md)

Poin-poin ini sudah terdokumentasi lengkap di `PROJECT.md` dan bisa langsung dikutip di bab kesimpulan:

- Sistem autentikasi dan manajemen pengguna berbasis role
- Persistent database (PostgreSQL) menggantikan localStorage
- Arsitektur multi-tenant untuk mendukung banyak sekolah
- Enkripsi API key provider AI di server
- Integrasi real-time job board via API Glints/Kalibrr
- Panel guru BK yang fungsional dengan data siswa aktual
- Notifikasi deadline beasiswa via email
- Deployment production dengan CI/CD pipeline
- Migrasi ke Next.js App Router untuk SSR dan performa lebih baik
- Penambahan provider: Anthropic Claude, OpenRouter, Ollama (self-hosted)

---

*Dokumen ini adalah scope resmi untuk pengerjaan skripsi sprint.*
*Untuk full roadmap sistem, lihat `PROJECT.md`.*

---

## Section 7 — AI Architecture

### Provider Stack

| Provider | Model | Peran |
|---|---|---|
| **NVIDIA NIM** | `stepfun-ai/step-3.5-flash` | Main — semua query teks |
| **Gemini** | `gemini-2.0-flash` | Fallback + file PDF (multimodal) |

Auto-fallback: NIM error 429/500/503 → Gemini otomatis tanpa intervensi user.

---

### Smart Routing — `smartRouter.ts`

Setiap pesan masuk diklasifikasi sebelum dikirim ke API. Zero latency overhead karena rule-based (tidak ada API call tambahan).

**3 Tier Query:**

| Tier | Trigger | maxTokens | historyLimit | Contoh |
|---|---|---|---|---|
| **QUICK** | Greeting, single fact, out-of-scope | 256 | 2 pesan | "Halo", "apa itu PKL?" |
| **STANDARD** | Career advice, job search, kursus | 512 | 6 pesan | "Lulusan RPL bisa kerja apa?" |
| **DEEP** | Roadmap, CV help, multi-intent | 1024 | 10 pesan | "Buatkan roadmap karir 5 tahun untuk saya" |

**RAG Injection (selective):**

Hanya data yang relevan dengan intent yang diinjeksi ke system prompt. Max 2 RAG key per request.

| Intent Terdeteksi | Data yang Diinjeksi |
|---|---|
| `scholarship` | `scholarships` (data sekolah mitra) |
| `job_search` | `dudi` (daftar mitra kerja) |
| `career_advice` | `career_paths` (prospek jurusan) |
| `course_rec` | `courses` (rekomendasi kursus) |
| `trend_data` | `trends` + `career_paths` |
| `roadmap` | `career_paths` + `courses` |

**Background Metadata (non-blocking):**

Tren karir dan rekomendasi video di-fetch background SETELAH stream selesai — tidak mempengaruhi TTFT (Time to First Token). Satu call untuk keduanya, max 256 token.

---

### System Prompt — `SYSTEM_INSTRUCTIONS.ts`

Dynamic template yang di-build per request. Terdiri dari:
1. Persona "Kak Karir" yang compact (~150 token)
2. RAG context yang relevan (diinjeksi selektif)

**Total token system prompt:**
- Tanpa RAG: ~150 token
- Dengan 1 RAG key: ~400–600 token
- Dengan 2 RAG key: ~700–1000 token

Jauh di bawah context window NIM (128K) maupun Gemini (1M).

---

### RAG Knowledge Base — `RAG_SETUP.ts`

Data disimpan sebagai TypeScript constants (bukan vector DB). Retrieval via keyword matching — zero latency, zero infra.

**Skema data:**

```
SCHOLARSHIPS[]      ← data dari sekolah mitra (diisi setelah kunjungan)
DUDI_PARTNERS[]     ← daftar mitra kerja (diisi dari Hubin/BKK)
CAREER_PATHS[]      ← prospek karir per jurusan (sudah terisi)
COURSE_RECOMMENDATIONS[] ← rekomendasi kursus (sudah terisi)
TREND_DATA[]        ← skor demand karir per jurusan (sudah terisi)
```

**File yang perlu diisi setelah kunjungan sekolah:**
- `SCHOLARSHIPS[]` — data dari BK / kesiswaan
- `DUDI_PARTNERS[]` — data dari Hubin / BKK

---

### Alur Request Lengkap

```
User kirim pesan
      │
      ▼
smartRouter.route(message, hasFile)
      │
      ├─ hasFile=true ──────────────────→ Gemini (multimodal)
      │
      ├─ Tier=QUICK ────────────────────→ NIM flash, 256 tok, no RAG
      │
      ├─ Tier=STANDARD ─────────────────→ NIM flash, 512 tok, RAG selektif
      │
      └─ Tier=DEEP ─────────────────────→ NIM flash, 1024 tok, RAG penuh
                │
                ▼
         pruneHistory(limit)
                │
                ▼
         buildCompactSystemPrompt(major, ragKeys)
                │
                ▼
         fetch NVIDIA NIM (streaming)
                │
         ┌──────┴──────┐
         │             │
      Error?      Stream OK
     429/5xx           │
         │             ▼
         └──→ Gemini  Stream text ke UI (TTFT cepat)
             fallback       │
                            ▼
                  extractQuickActions(text) ← rule-based, zero cost
                            │
                            ▼
                  fetchMetadataBackground() ← non-blocking
                  (trendData + videoRec, 256 tok)
```

