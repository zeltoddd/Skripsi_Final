// ============================================================
// roadmap.ts
// Semester-by-semester learning roadmap per major
// ============================================================

/**
 * Roadmap data per jurusan (extracted from dataset)
 */
const ROADMAPS: Record<string, string> = {
  rpl: `**Roadmap belajar RPL/PPLG:**
- Semester 1-2: Algoritma, pemrograman dasar (Python/Java), logika, HTML/CSS.
- Semester 3: OOP, database SQL, JavaScript dasar, Git.
- Semester 4: Web development (frontend + backend), mobile dasar, API.
- Semester 5: PKL, advanced project, sertifikasi cloud, portofolio GitHub.
- Semester 6: Ujian kompetensi, persiapan kerja atau startup.
Peluang usaha: Software House, SaaS startup, Mobile App Studio, Web Development Agency, Tech Consultant.`,

  dkv: `**Roadmap belajar DKV:**
- Semester 1-2: Dasar desain, teori warna, tipografi, Photoshop & Illustrator dasar.
- Semester 3: Desain grafis lanjut, branding, layout, fotografi.
- Semester 4: UI/UX dasar, motion graphics, After Effects, Figma.
- Semester 5: PKL, portofolio digital, sertifikasi Adobe, personal branding.
- Semester 6: Ujian kompetensi, persiapan kerja.
Peluang usaha: Design Studio, Print Shop, UI/UX Agency, Motion Graphics Studio, Digital Product Seller.`,

  bp: `**Roadmap belajar Broadcasting:**
- Semester 1-2: Dasar broadcasting, teknik kamera, editing dasar, penulisan naskah.
- Semester 3: Produksi radio, produksi TV, videografi, audio editing.
- Semester 4: Content creation, live streaming, podcast, social media strategy.
- Semester 5: PKL, portofolio video, sertifikasi Adobe, personal channel.
- Semester 6: Ujian kompetensi, persiapan kerja.
Peluang usaha: Production House, Content Creation Agency, Podcast Studio, YouTube Channel, TikTok Agency.`,

  pm: `**Roadmap belajar Pemasaran:**
- Semester 1-2: Dasar pemasaran, perilaku konsumen, riset pasar.
- Semester 3: Digital marketing, social media, content creation.
- Semester 4: E-commerce, SEO/SEM, email marketing, CRM.
- Semester 5: PKL, sertifikasi Google/Meta, portofolio campaign.
- Semester 6: Ujian kompetensi, persiapan kerja atau wirausaha.
Peluang usaha: Digital Marketing Agency, Social Media Management, E-commerce Store, Content Creation Agency.`,

  akl: `**Roadmap belajar AKL:**
- Semester 1-2: Dasar akuntansi, siklus akuntansi, jurnal, buku besar, neraca saldo.
- Semester 3: Akuntansi keuangan lanjut, laporan keuangan, perpajakan dasar.
- Semester 4: Komputer akuntansi (MYOB/Accurate), akuntansi koperasi, audit dasar.
- Semester 5: PKL, sertifikasi Brevet Pajak, portofolio.
- Semester 6: Ujian kompetensi, persiapan kerja.
Peluang usaha: Jasa pembukuan UMKM, Konsultan pajak online, Jasa payroll outsourcing, Financial coaching.`,

  mplb: `**Roadmap belajar MPLB:**
- Semester 1-2: Korespondensi, administrasi umum, teknologi perkantoran dasar.
- Semester 3: Manajemen arsip, manajemen rapat, korespondensi bisnis lanjut.
- Semester 4: Teknologi perkantoran lanjut, kepegawaian, public relations.
- Semester 5: PKL, sertifikasi MOS, portofolio administrasi digital.
- Semester 6: Ujian kompetensi, persiapan kerja.
Peluang usaha: Jasa Virtual Assistant, Setup Google Workspace/Office 365, Arsip digital perusahaan, Customer service outsourcing.`,

  ulp: `**Roadmap belajar ULP:**
- Semester 1-2: Dasar pariwisata, pengetahuan hotel & restoran, bahasa Inggris.
- Semester 3: Travel agency, tour guiding, event management, bahasa asing lanjut.
- Semester 4: Marketing pariwisata, sustainable tourism, kewirausahaan.
- Semester 5: PKL di hotel/restoran/travel agency, sertifikasi, portofolio.
- Semester 6: Ujian kompetensi, persiapan kerja.
Peluang usaha: Homestay/Guesthouse, Tour and Travel Agency, Event Organizer, Food Tour, Cultural Experience Provider.`,
};

/**
 * Get roadmap context for a specific major
 */
export function getRoadmapContext(jurusan: string): string {
  const key = jurusan.toLowerCase();
  return ROADMAPS[key] || `Roadmap belajar untuk jurusan ${jurusan}: Silakan konsultasi dengan Guru BK atau pakar jurusan untuk panduan belajar yang tepat.`;
}
