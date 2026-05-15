# PROJECT.md — KarirSMK v2.0
> **SaaS-Quality Rebuild: Bimbingan Karir SMK**
> Rebuilt from [github.com/zeltoddd/Skripsi](https://github.com/zeltoddd/Skripsi)

---

## 1. Ringkasan Proyek

**KarirSMK** adalah platform bimbingan karir berbasis AI untuk siswa dan lulusan SMK di Indonesia. Versi ini merupakan rebuild penuh dari prototipe skripsi menjadi produk SaaS berkualitas production, dengan UI/UX yang layak, fitur yang reliable, manajemen multi-provider AI, dan panel admin yang lengkap.

### Visi
> Menjadi platform bimbingan karir digital #1 untuk ekosistem SMK Indonesia — personal, cerdas, dan dapat diakses oleh setiap sekolah.

### Target Pengguna
| Peran | Deskripsi |
|---|---|
| **Siswa/Alumni SMK** | Pengguna utama — mencari info karir, beasiswa, CV, dan kursus |
| **Guru BK (Counselor)** | Memantau aktivitas bimbingan siswa, menambah resource |
| **Admin Sekolah** | Konfigurasi sistem, AI provider, user management |
| **Super Admin** | Kelola semua sekolah (multi-tenant) |

---

## 2. Fitur yang Dipertahankan (dari prototipe)

Semua fitur berikut **wajib dipertahankan** dan diperbaiki kualitasnya:

| Fitur | Status | Peningkatan di v2 |
|---|---|---|
| AI Chat dengan persona "Kak Karir" | ✅ Keep | Streaming response, retry logic, error handling proper |
| Pilih Jurusan SMK (7 jurusan) | ✅ Keep | Onboarding flow yang lebih baik, bisa diganti kapan saja |
| Upload & Analisis CV (PDF) | ✅ Keep | Preview PDF, progress bar, hasil lebih terstruktur |
| CV Wizard (generate CV) | ✅ Keep | Multi-step form, template pilihan, export ke PDF/DOCX |
| Quick Actions (Loker, Kursus, Tren, Beasiswa) | ✅ Keep | UI card yang lebih menarik, hasil real-time |
| Career Trend Chart | ✅ Keep | Recharts interaktif, filter by periode |
| Summarize pesan AI | ✅ Keep | Tombol lebih intuitif, collapsible |
| Video Recommendations | ✅ Keep | Embedded preview, link ke YouTube |
| Grounding / Source Links | ✅ Keep | UI sumber yang lebih rapi seperti kartu referensi |
| Dark / Light Mode | ✅ Keep | System preference + manual toggle, persisted |
| Suggestion Chips di welcome screen | ✅ Keep | Personalized berdasarkan jurusan |

### Persona AI yang Dipertahankan
Nama: **"Kak Karir"** (nama baru, karakter sama)
- Santun, ramah, inspiratif
- Panggil pengguna "kamu"
- Gunakan istilah akrab SMK: PKL, Loker, LSP, Sertifikasi, PPDB
- Emoji relevan tiap paragraf
- Bahasa Indonesia yang natural, tidak kaku
- Saran **spesifik per jurusan**, bukan jawaban generik
- Platform rekomendasi: Dicoding, Skill Academy, MySkill, Glints, Kalibrr, Karir.com

---

## 3. Fitur Baru v2.0

### 3.1 Autentikasi & Role Management
- **Login/Register** — email+password, Google OAuth
- **Role**: `student`, `counselor`, `school_admin`, `super_admin`
- **Onboarding Flow** — setelah register, siswa mengisi: nama, sekolah, jurusan, kelas, tahun lulus
- **Profile Page** — edit info, ganti avatar, lihat riwayat
- **Protected Routes** — tiap role punya halaman yang bisa/tidak bisa diakses

### 3.2 Persistensi Chat & Riwayat Sesi
- Setiap sesi chat tersimpan di database (bukan hanya in-memory)
- **Sidebar riwayat** seperti ChatGPT — list sesi sebelumnya
- **Resume sesi** — lanjut chat dari percakapan sebelumnya
- Auto-titling sesi berdasarkan topik pertama
- Hapus sesi, rename sesi
- Pencarian riwayat chat

### 3.3 Dashboard Siswa
- **Progress Card** — jumlah topik yang diexplore, CV yang dibuat, lowongan yang dilihat
- **Quick Stats** — sesi terakhir, fitur paling sering digunakan
- **Rekomendasi Hari Ini** — konten personal berdasarkan jurusan & aktivitas
- **Kalender Beasiswa** — deadline beasiswa yang relevan
- **Trending di Jurusanmu** — topik karir populer di jurusan yang sama

### 3.4 Admin Panel (School Admin)
Halaman khusus admin di `/admin`:

#### AI Provider Settings
Admin dapat mengkonfigurasi provider AI dari UI tanpa menyentuh kode:

| Provider | Model yang Tersedia |
|---|---|
| **Google Gemini** (default) | gemini-2.0-flash, gemini-1.5-pro, gemini-1.5-flash |
| **OpenAI** | gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo |
| **Anthropic Claude** | claude-sonnet-4-5, claude-3-5-haiku, claude-opus-4-5 |
| **Groq** | llama-3.3-70b, mixtral-8x7b, gemma2-9b (ultra-fast) |
| **OpenRouter** | Akses 100+ model via satu API key |
| **Ollama** (self-hosted) | llama3, mistral, phi3 — untuk sekolah yang ingin privacy penuh |

**Yang bisa dikonfigurasi admin:**
- Pilih provider aktif (satu aktif di satu waktu, atau per-fitur)
- Input & simpan API Key (dienkripsi di database)
- Pilih model spesifik per provider
- Set parameter: temperature, max_tokens, top_p
- Test koneksi provider langsung dari UI
- Fallback provider jika provider utama gagal
- Rate limit per user (request/hari)
- Toggle fitur AI: web search grounding, image generation, dll.

#### Persona & System Prompt Editor
- Edit system prompt "Kak Karir" via rich text editor
- Preview persona sebelum disimpan (test chat sandbox)
- Version history prompt — rollback ke versi sebelumnya
- Variabel template: `{userMajor}`, `{userName}`, `{schoolName}`

#### User Management
- Lihat daftar siswa terdaftar di sekolah
- Approve/reject registrasi (jika mode private)
- Reset password siswa
- Ban/unban akun
- Export data siswa (CSV)
- Assign jurusan massal

#### Konten Management
- Tambah/edit daftar jurusan SMK
- Tambah/edit suggestion chips di welcome screen
- Kelola daftar platform rekomendasi (Glints, Dicoding, dst.)
- Upload resource/modul tambahan

#### Analytics Dashboard (Admin)
- Total sesi chat per hari/minggu/bulan (line chart)
- Distribusi jurusan pengguna (pie chart)
- Fitur paling banyak digunakan (bar chart)
- Top pertanyaan yang sering ditanyakan (word cloud)
- Rata-rata panjang sesi
- Error rate API

### 3.5 Halaman Guru BK (Counselor)
- Lihat ringkasan aktivitas siswa (bukan isi chat — privacy)
- Jumlah siswa aktif per jurusan
- Topik yang sering ditanyakan siswa
- Tambah catatan bimbingan per siswa
- Jadwalkan sesi bimbingan 1-on-1
- Kirim broadcast message ke siswa

### 3.6 Fitur Konten Karir yang Dikembangkan
- **Job Board** — aggregasi lowongan dari Glints, Kalibrr via scraping/API, filter by jurusan
- **Scholarship Tracker** — daftar beasiswa aktif, simpan favorit, set pengingat deadline
- **Kursus Rekomendasi** — kurasi manual + AI, badge "Populer di Jurusanmu"
- **Career Path Explorer** — visualisasi tree/roadmap karir berdasarkan jurusan
- **Salary Insights** — estimasi gaji per role + kota (dari data publik)
- **Interview Simulator** — latihan wawancara kerja dengan AI (new)
- **Skill Gap Analyzer** — upload CV, bandingkan dengan job requirement

---

## 4. Tech Stack

### Frontend
```
Framework    : Next.js 14 (App Router)
Language     : TypeScript (strict mode)
Styling      : Tailwind CSS v3 + shadcn/ui
State        : Zustand (global) + TanStack Query (server state)
Forms        : React Hook Form + Zod validation
Charts       : Recharts
Animations   : Framer Motion
Icons        : Lucide React
PDF          : react-pdf (viewer) + @react-pdf/renderer (generator)
Rich Text    : TipTap (untuk prompt editor)
```

### Backend
```
Runtime      : Next.js API Routes (atau Fastify jika dipisah)
Database     : PostgreSQL (Supabase) — primary store
ORM          : Prisma
Auth         : NextAuth.js v5 (+ Supabase Auth sebagai alternatif)
File Storage : Supabase Storage (CV upload)
Cache        : Redis (Upstash) — rate limiting, session cache
Queue        : (opsional) BullMQ untuk task berat
```

### AI Integration Layer
```
Abstraction  : Vercel AI SDK (mendukung semua provider via unified interface)
Providers    : Google Gemini, OpenAI, Anthropic, Groq, Ollama, OpenRouter
Streaming    : Server-Sent Events (SSE) via AI SDK
PDF Parsing  : Gemini Vision / GPT-4o Vision (multimodal)
Web Search   : Google Search Grounding (Gemini) / Brave Search API
```

### Infrastructure
```
Hosting      : Vercel (frontend + API) atau Railway/Render
Database     : Supabase (PostgreSQL managed)
CDN          : Vercel Edge Network
Monitoring   : Sentry (error tracking) + Vercel Analytics
CI/CD        : GitHub Actions
Environment  : .env.local + Vault untuk production secrets
```

---

## 5. Struktur Proyek

```
karirsmk/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, register, onboarding)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── onboarding/page.tsx   # Major selection + profile setup
│   ├── (app)/                    # Protected app pages
│   │   ├── layout.tsx            # App shell (sidebar + header)
│   │   ├── dashboard/page.tsx    # Student dashboard
│   │   ├── chat/
│   │   │   ├── page.tsx          # New chat
│   │   │   └── [sessionId]/page.tsx  # Resume session
│   │   ├── cv-builder/page.tsx   # CV Wizard (enhanced)
│   │   ├── jobs/page.tsx         # Job board
│   │   ├── scholarships/page.tsx
│   │   ├── courses/page.tsx
│   │   ├── career-path/page.tsx  # Career roadmap explorer
│   │   └── profile/page.tsx
│   ├── (counselor)/              # Counselor-only pages
│   │   └── dashboard/page.tsx
│   ├── (admin)/                  # Admin-only pages
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx    # Analytics
│   │   ├── ai-settings/page.tsx  # Provider & model config
│   │   ├── persona/page.tsx      # System prompt editor
│   │   ├── users/page.tsx
│   │   └── content/page.tsx
│   └── api/                      # API Routes
│       ├── chat/route.ts         # Main AI chat (streaming)
│       ├── chat/summarize/route.ts
│       ├── cv/analyze/route.ts
│       ├── cv/generate/route.ts
│       ├── admin/providers/route.ts
│       ├── admin/analytics/route.ts
│       └── auth/[...nextauth]/route.ts
│
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx     # Main chat container
│   │   ├── MessageBubble.tsx     # Individual message
│   │   ├── MessageInput.tsx      # Input bar + file attach
│   │   ├── QuickActions.tsx      # Action chips
│   │   ├── TrendChart.tsx        # Recharts career trends
│   │   ├── VideoCard.tsx
│   │   ├── SourceLinks.tsx       # Grounding references
│   │   ├── SessionSidebar.tsx    # Chat history sidebar
│   │   └── WelcomeScreen.tsx     # Suggestion chips + onboarding prompt
│   ├── cv/
│   │   ├── CVWizard.tsx          # Multi-step CV builder
│   │   ├── CVPreview.tsx
│   │   └── CVTemplate*.tsx       # Multiple templates
│   ├── admin/
│   │   ├── ProviderCard.tsx      # AI provider config card
│   │   ├── ModelSelector.tsx
│   │   ├── PersonaEditor.tsx     # TipTap-based prompt editor
│   │   ├── AnalyticsChart.tsx
│   │   └── UserTable.tsx
│   ├── dashboard/
│   │   ├── ProgressCard.tsx
│   │   ├── RecommendationFeed.tsx
│   │   └── ScholarshipCalendar.tsx
│   └── ui/                       # shadcn/ui components
│
├── lib/
│   ├── ai/
│   │   ├── providers.ts          # Provider abstraction layer
│   │   ├── gemini.ts
│   │   ├── openai.ts
│   │   ├── anthropic.ts
│   │   ├── groq.ts
│   │   ├── openrouter.ts
│   │   └── ollama.ts
│   ├── db/
│   │   ├── prisma.ts             # Prisma client singleton
│   │   └── queries/              # Typed query helpers
│   ├── auth.ts                   # NextAuth config
│   ├── encryption.ts             # API key encryption
│   └── rate-limit.ts
│
├── prisma/
│   └── schema.prisma
│
├── types/
│   ├── chat.ts
│   ├── user.ts
│   └── admin.ts
│
└── constants/
    ├── persona.ts                # AI persona system prompt
    ├── majors.ts                 # SMK major list
    └── suggestions.ts            # Suggestion chips
```

---

## 6. Database Schema (Prisma)

```prisma
model School {
  id        String   @id @default(cuid())
  name      String
  city      String
  province  String
  createdAt DateTime @default(now())
  users     User[]
  aiConfig  AIConfig?
}

model User {
  id           String    @id @default(cuid())
  email        String    @unique
  name         String
  avatarUrl    String?
  role         Role      @default(STUDENT)
  school       School?   @relation(fields: [schoolId], references: [id])
  schoolId     String?
  major        String?   // jurusan SMK
  grade        String?   // kelas (X, XI, XII, Alumni)
  gradYear     Int?
  createdAt    DateTime  @default(now())
  sessions     ChatSession[]
  cvFiles      CVFile[]
}

enum Role {
  STUDENT
  COUNSELOR
  SCHOOL_ADMIN
  SUPER_ADMIN
}

model ChatSession {
  id        String        @id @default(cuid())
  title     String        @default("Sesi Baru")
  userId    String
  user      User          @relation(fields: [userId], references: [id])
  messages  ChatMessage[]
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
}

model ChatMessage {
  id          String      @id @default(cuid())
  sessionId   String
  session     ChatSession @relation(fields: [sessionId], references: [id])
  role        String      // 'user' | 'assistant'
  content     String      @db.Text
  metadata    Json?       // groundingMetadata, quickActions, trendData, etc.
  createdAt   DateTime    @default(now())
}

model CVFile {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  fileName    String
  storageUrl  String
  analysis    String?  @db.Text
  createdAt   DateTime @default(now())
}

model AIConfig {
  id              String   @id @default(cuid())
  schoolId        String   @unique
  school          School   @relation(fields: [schoolId], references: [id])
  activeProvider  String   @default("gemini") // gemini | openai | anthropic | groq | openrouter | ollama
  providerConfigs Json     // { gemini: { apiKey: encrypted, model: "...", temperature: 0.7 }, openai: {...}, ... }
  systemPrompt    String   @db.Text
  promptVersion   Int      @default(1)
  promptHistory   Json     // array of previous prompts
  features        Json     // { webSearch: true, imageGen: false, ... }
  rateLimitPerDay Int      @default(50)
  updatedAt       DateTime @updatedAt
}

model AnalyticsEvent {
  id        String   @id @default(cuid())
  schoolId  String
  userId    String?
  event     String   // 'chat_message', 'cv_upload', 'quick_action', etc.
  metadata  Json?
  createdAt DateTime @default(now())
}
```

---

## 7. AI Provider Abstraction Layer

```typescript
// lib/ai/providers.ts

export interface AIProvider {
  name: string
  sendMessage(params: SendMessageParams): Promise<AIResponse>
  streamMessage(params: SendMessageParams): AsyncGenerator<string>
  summarize(text: string): Promise<string>
  analyzeDocument(file: FileData, prompt: string): Promise<string>
}

export interface ProviderConfig {
  apiKey: string       // disimpan terenkripsi di DB
  model: string
  temperature?: number // default 0.7
  maxTokens?: number   // default 1024
  baseUrl?: string     // untuk Ollama / OpenRouter custom endpoint
}

// Registry provider
export const PROVIDERS = {
  gemini:      GeminiProvider,
  openai:      OpenAIProvider,
  anthropic:   AnthropicProvider,
  groq:        GroqProvider,
  openrouter:  OpenRouterProvider,
  ollama:      OllamaProvider,
}

// Factory — load config dari DB (AIConfig)
export async function getActiveProvider(schoolId: string): Promise<AIProvider> {
  const config = await db.aIConfig.findUnique({ where: { schoolId } })
  const ProviderClass = PROVIDERS[config.activeProvider]
  const providerConfig = config.providerConfigs[config.activeProvider]
  return new ProviderClass(decryptApiKey(providerConfig.apiKey), providerConfig)
}
```

**Catatan Implementasi Provider:**
- Gunakan **Vercel AI SDK** (`ai` package) sebagai lapisan abstraksi utama untuk streaming
- Semua provider expose interface yang sama (`sendMessage`, `streamMessage`, `analyzeDocument`)
- API key **dienkripsi di database** menggunakan AES-256 (jangan simpan plain text)
- Provider fallback: jika provider utama return 429/500, otomatis coba fallback provider
- Ollama hanya tersedia jika `baseUrl` dikonfigurasi (untuk sekolah self-hosted)

---

## 8. UI/UX Design System

### Tone & Aesthetic
**"Modern Educational Tech"** — bukan startup generic, bukan platform pemerintah yang kaku.
Inspirasi: Linear, Notion, Perplexity.ai — tapi dengan sentuhan warna yang hangat dan familiar untuk siswa SMA/SMK Indonesia.

### Color Palette
```css
/* Primary — Navy Indigo (profesional, pendidikan) */
--primary-50:  #eef2ff;
--primary-500: #6366f1;
--primary-600: #4f46e5;
--primary-900: #1e1b4b;

/* Accent — Amber (energik, semangat muda) */
--accent-400: #fbbf24;
--accent-500: #f59e0b;

/* Success — Emerald */
--success-500: #10b981;

/* Neutral */
--neutral-50:  #f9fafb;
--neutral-900: #0f172a;

/* Dark Mode Background */
--dark-bg:      #0d0f14;
--dark-surface: #161922;
--dark-border:  #1e2330;
```

### Typography
```
Display/Heading : "Plus Jakarta Sans" (Google Fonts) — modern, Indonesian-friendly
Body            : "DM Sans" — readable, friendly
Mono (code/data): "JetBrains Mono"
```

### Key UI Patterns

**Chat Interface:**
- Sidebar kiri: riwayat sesi (collapsible di mobile)
- Area tengah: chat messages
- Avatar "Kak Karir" dengan animasi subtle saat typing
- Bubble user: kanan, rounded-3xl, warna primary
- Bubble AI: kiri, dengan avatar, lebar penuh dengan card rich content
- Quick Action chips: horizontal scroll, pill shape
- Input bar: floating di bottom, frosted glass style

**Message Bubble AI (rich content):**
```
┌─────────────────────────────────────┐
│ 🎓 [Avatar Kak Karir]               │
│                                     │
│ [Teks markdown-rendered]            │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📊 Tren Karir RPL               │ │
│ │ [Recharts Bar/Line Chart]       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [🔍 Sumber] [📋 Ringkas] [▶ Video] │
│                                     │
│ Quick Actions:                      │
│ [💼 Cari Loker] [📚 Kursus] [🎓]  │
└─────────────────────────────────────┘
```

**Admin Panel:**
- Sidebar navigasi admin
- Provider cards dengan status indicator (connected/not connected/error)
- Form konfigurasi inline (expand on click)
- "Test Connection" button dengan live feedback
- Prompt editor dengan preview panel di sebelah (split view)

### Responsiveness
- **Mobile-first** — chat interface harus sempurna di smartphone
- Sidebar riwayat: drawer/overlay di mobile, fixed di desktop
- Admin panel: table jadi card stack di mobile
- CV Wizard: full-screen modal di mobile

---

## 9. Alur Pengguna Utama

### 9.1 Alur Siswa Baru
```
Landing Page
  → Register (email/Google)
  → Onboarding Step 1: Nama & Sekolah
  → Onboarding Step 2: Pilih Jurusan (7 pilihan dengan icon menarik)
  → Onboarding Step 3: Kelas & Tahun Lulus
  → Dashboard (welcome state)
  → Chat dengan Kak Karir (dimulai dengan greeting personal)
```

### 9.2 Alur Chat
```
Buka sesi baru / pilih sesi dari sidebar
  → Welcome screen dengan suggestion chips (personalized per jurusan)
  → Ketik pesan / pilih suggestion
  → AI stream response (bukan block)
  → Rich content muncul progressively
  → Quick actions muncul di bawah response
  → Klik quick action → trigger prompt baru
  → Sesi auto-saved
```

### 9.3 Alur Admin Setup Provider
```
Login sebagai admin
  → Admin Panel → AI Settings
  → Lihat daftar provider (card grid)
  → Klik provider yang ingin diaktifkan (e.g. OpenAI)
  → Expand form: input API key, pilih model, set parameter
  → Klik "Test Koneksi" → indicator hijau/merah
  → Klik "Aktifkan Provider"
  → Konfirmasi → provider aktif, semua chat siswa kini pakai OpenAI
```

### 9.4 Alur CV
```
Quick action "Buat CV" / menu CV Builder
  → Wizard Step 1: Info Personal (nama, email, telp)
  → Wizard Step 2: Pendidikan (sekolah, jurusan, tahun)
  → Wizard Step 3: Pengalaman (PKL, organisasi, freelance)
  → Wizard Step 4: Keahlian (chip selector + custom input)
  → Wizard Step 5: Ringkasan (AI-generated, bisa diedit)
  → Wizard Step 6: Pilih Template (3 template visual)
  → Preview → Export PDF / Simpan ke akun
```

---

## 10. API Endpoints

### Chat
```
POST   /api/chat                    Stream AI response (SSE)
GET    /api/chat/sessions           List sesi user
GET    /api/chat/sessions/:id       Detail sesi + messages
DELETE /api/chat/sessions/:id       Hapus sesi
PATCH  /api/chat/sessions/:id       Rename sesi
POST   /api/chat/summarize          Ringkas pesan
```

### CV
```
POST   /api/cv/upload               Upload PDF CV ke storage
POST   /api/cv/analyze              Analisis CV dengan AI
POST   /api/cv/generate             Generate CV dari CVData
GET    /api/cv                      List CV user
```

### Admin
```
GET    /api/admin/ai-config         Ambil konfigurasi AI sekolah
PATCH  /api/admin/ai-config         Update provider aktif & settings
POST   /api/admin/ai-config/test    Test koneksi provider
GET    /api/admin/analytics         Ambil data analytics
GET    /api/admin/users             List users sekolah
PATCH  /api/admin/users/:id         Update role / status user
GET    /api/admin/prompt-history    Riwayat versi system prompt
POST   /api/admin/prompt-restore    Restore prompt ke versi sebelumnya
```

---

## 11. Security & Compliance

- **API Key Encryption**: AES-256-GCM, key dari environment variable, tidak pernah expose ke frontend
- **Row-Level Security**: User hanya bisa akses data milik sekolah mereka
- **Rate Limiting**: Per-user via Redis (Upstash), configurable oleh admin
- **Input Sanitization**: Semua input di-sanitize sebelum dikirim ke AI
- **CORS**: Hanya allow origin yang terdaftar
- **File Upload Validation**: Hanya accept PDF, max 5MB, virus scan via storage provider
- **Auth**: JWT dengan refresh token, session invalidation saat logout
- **Admin Actions**: Semua perubahan config dicatat di audit log
- **Data Retention**: Chat history auto-delete setelah 1 tahun (configurable)

---

## 12. Environment Variables

```env
# App
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Database
DATABASE_URL=

# Supabase (file storage)
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Encryption (untuk API keys di DB)
ENCRYPTION_KEY=                    # 32-char random string

# Default AI Provider (fallback jika DB config belum ada)
DEFAULT_AI_PROVIDER=gemini
GEMINI_API_KEY=                    # untuk default/super-admin

# Redis (rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

**Catatan**: API key untuk tiap sekolah disimpan di database (terenkripsi), bukan di `.env`. File `.env` hanya untuk default/fallback dan system-level secrets.

---

## 13. Deployment & DevOps

### Recommended Stack
```
Production   : Vercel (auto-deploy dari main branch)
Staging      : Vercel Preview (auto-deploy dari PR)
Database     : Supabase (managed PostgreSQL + storage)
Cache/Queue  : Upstash (serverless Redis)
Monitoring   : Sentry + Vercel Analytics + Axiom (logs)
```

### CI/CD Pipeline (GitHub Actions)
```yaml
on: [push, pull_request]

jobs:
  lint:    ESLint + TypeScript check
  test:    Unit tests (Vitest) + integration tests
  build:   Next.js build check
  deploy:  Vercel deploy (main → production, PR → preview)
```

### Database Migration
```bash
# Development
npx prisma migrate dev --name init

# Production
npx prisma migrate deploy   # via CI/CD, tidak manual
```

---

## 14. Roadmap Pengembangan

### Phase 1 — MVP (4-6 minggu)
- [ ] Setup Next.js + Prisma + Supabase
- [ ] Auth: register, login, Google OAuth, onboarding
- [ ] Chat interface (persistent sessions, sidebar)
- [ ] Integrasi Gemini (provider pertama, paling mature)
- [ ] Fitur existing: quick actions, CV upload, CV wizard, trend chart
- [ ] Dark/light mode
- [ ] Basic admin panel: user list, AI config (Gemini only)
- [ ] Deploy ke Vercel

### Phase 2 — Multi-Provider & Admin Full (3-4 minggu)
- [ ] Tambah OpenAI, Anthropic, Groq provider
- [ ] Admin: persona editor + prompt versioning
- [ ] Admin: analytics dashboard
- [ ] Rate limiting per user
- [ ] Encryption API keys
- [ ] Tambah OpenRouter & Ollama provider
- [ ] Fallback provider logic

### Phase 3 — Fitur Karir Lengkap (4-5 minggu)
- [ ] Student dashboard
- [ ] Job board (Glints API / scraping)
- [ ] Scholarship tracker + deadline reminder
- [ ] Career path explorer (visual roadmap)
- [ ] Interview simulator
- [ ] Skill gap analyzer
- [ ] Counselor panel

### Phase 4 — Polish & Scale (3-4 minggu)
- [ ] Multi-tenant support (multi-school)
- [ ] Super admin panel
- [ ] Mobile PWA
- [ ] Notifikasi email (beasiswa deadline, dll.)
- [ ] Onboarding tour (Shepherd.js)
- [ ] A11y audit & screen reader support
- [ ] Load testing & optimization

---

## 15. Referensi & Dependencies Utama

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "typescript": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "@shadcn/ui": "latest",
    "ai": "^3.3.0",
    "@ai-sdk/google": "latest",
    "@ai-sdk/openai": "latest",
    "@ai-sdk/anthropic": "latest",
    "next-auth": "^5.0.0",
    "@prisma/client": "^5.14.0",
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.45.0",
    "react-hook-form": "^7.52.0",
    "zod": "^3.23.0",
    "recharts": "^2.12.0",
    "framer-motion": "^11.3.0",
    "lucide-react": "^0.400.0",
    "@react-pdf/renderer": "^3.4.0",
    "@tiptap/react": "^2.4.0",
    "groq-sdk": "^0.5.0"
  }
}
```

---

*Dokumen ini adalah living document. Update setiap kali ada keputusan arsitektur baru.*
*Last updated: Mei 2026*
