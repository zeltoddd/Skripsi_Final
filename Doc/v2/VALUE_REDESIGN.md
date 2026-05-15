# VALUE_REDESIGN.md
> Berdasarkan transkrip wawancara langsung dengan Koordinator BK
> SMK Negeri 6 Surakarta
> Tujuan: tajamkan purpose, value prop, dan suggestion chips

---

## Masalah Sesungguhnya (dari transkrip)

Bukan "siswa tidak tahu karir". Lebih spesifik dari itu:

> **Siswa SMK kelas XII menghadapi dilema terbesar dalam hidupnya
> — kerja, kuliah, atau dua-duanya — tanpa punya waktu bertemu
> guru BK yang 1 orang menanggung 254 siswa.**

Pertanyaan yang paling sering melanda mereka (verbatim dari transkrip):

| # | Pertanyaan riil siswa | Frekuensi |
|---|---|---|
| 1 | "Bisa kerja sambil kuliah nggak, Bu?" | 🔴 Sangat sering |
| 2 | "Gimana cara masuk PTN dari SMK?" (SNBP/SNBT) | 🔴 Sangat sering |
| 3 | "Lowongan kerja apa yang cocok buat jurusan saya?" | 🔴 Sangat sering |
| 4 | "Beasiswa apa yang bisa saya daftar?" | 🟡 Sering |
| 5 | "PKL dimana yang bagus buat jurusan saya?" | 🟡 Sering |
| 6 | "Kalau mau wirausaha, mulai dari mana?" | 🟡 Sering |
| 7 | "SMK bisa kuliah nggak sih?" (miskonsepsi) | 🟢 Ada |

---

## Value Proposition Baru

### ❌ Versi Lama (tidak tajam)
> "Deep Intel — AI Career Oracle untuk SMK"
> "Asisten karir cerdas untuk masa depanmu"

Masalah: abstrak, tidak bicara ke pain point, "Oracle" terdengar intimidating.

### ✅ Versi Baru (tajam, dari data riil)

**Headline:**
> Bingung kerja atau kuliah setelah lulus SMK?
> Tanya Kak Karir — gratis, privat, 24 jam.

**Subheadline:**
> 1 guru BK untuk 254 siswa di SMK Negeri 6 Surakarta.
> Kak Karir ada untuk menjawab semua yang kamu simpan sendiri.

**Kenapa ini lebih kuat:**
- Angka "1:254" langsung bikin siswa relate — mereka merasakan ini setiap hari
- "yang kamu simpan sendiri" — menyentuh aspek privasi yang disebut Ibu BK
  (*"anak-anak itu kadang ada yang ambil maminya sendiri, ada yang tergantung"*)
- Tidak menjual fitur — menjual solusi untuk dilema yang nyata

---

## Suggestion Chips — Versi Baru

Ganti dari chips generik ke **pertanyaan yang paling sering bikin siswa galau**.
Tulis seperti siswa yang lagi bingung, bukan seperti menu aplikasi.

### Chip Set A — Untuk semua jurusan (default, sebelum pilih jurusan)

```tsx
const SUGGESTION_CHIPS_DEFAULT = [
  {
    icon: "🤔",
    label: "Kerja dulu atau kuliah dulu?",
    prompt: "Kak, aku bingung nih — lebih baik kerja dulu atau langsung kuliah setelah lulus SMK? Gimana cara mikirnya?"
  },
  {
    icon: "🎓",
    label: "Lulusan SMK bisa masuk PTN?",
    prompt: "Kak, bener nggak sih lulusan SMK bisa masuk universitas negeri? Gimana caranya lewat SNBP atau SNBT?"
  },
  {
    icon: "💼",
    label: "Kerja apa yang cocok buat aku?",
    prompt: "Kak, aku mau kerja setelah lulus tapi bingung cocoknya di bidang apa. Bisa bantu arahkan?"
  },
  {
    icon: "🎯",
    label: "Kerja sambil kuliah, bisa?",
    prompt: "Kak, bisa nggak ya kerja sambil kuliah? Ada tips atau program yang memungkinkan itu?"
  },
  {
    icon: "📋",
    label: "Beasiswa apa yang bisa aku daftar?",
    prompt: "Kak, beasiswa apa saja yang tersedia buat siswa SMK seperti aku? Gimana cara daftarnya?"
  },
  {
    icon: "🚀",
    label: "Mau wirausaha, mulai dari mana?",
    prompt: "Kak, aku pengen coba wirausaha setelah lulus. Dari mana mulainya dan apa yang perlu dipersiapkan?"
  },
]
```

### Chip Set B — Setelah pilih jurusan (personalized)

```tsx
const SUGGESTION_CHIPS_BY_MAJOR: Record<string, SuggestionChip[]> = {
  RPL: [
    { icon: "💻", label: "Gaji programmer fresh graduate?",
      prompt: "Kak, berapa rata-rata gaji programmer atau developer fresh graduate lulusan SMK RPL? Dan kota mana yang paling banyak lowongannya?" },
    { icon: "📁", label: "Portofolio buat melamar kerja",
      prompt: "Kak, aku lulusan RPL. Portofolio seperti apa yang dibutuhkan untuk melamar kerja sebagai developer?" },
    { icon: "🎓", label: "Kuliah IT dari SMK RPL",
      prompt: "Kak, aku dari RPL mau kuliah jurusan IT atau Informatika. Bisa lewat SNBP nggak? Politeknik mana yang bagus?" },
    { icon: "🔐", label: "Jadi cybersecurity expert",
      prompt: "Kak, aku tertarik di bidang cybersecurity. Dari SMK RPL bisa nggak? Mulai dari mana?" },
  ],
  DKV: [
    { icon: "🎨", label: "Freelance desain, bisa dari sekarang?",
      prompt: "Kak, aku masih kelas XII DKV. Bisa mulai freelance desain dari sekarang? Gimana caranya dapat klien pertama?" },
    { icon: "📱", label: "UI/UX designer itu gimana?",
      prompt: "Kak, aku dari DKV tertarik jadi UI/UX designer. Bedanya sama desainer grafis apa? Skill apa yang perlu dipelajari?" },
    { icon: "💰", label: "Jurusan DKV gajinya berapa?",
      prompt: "Kak, lulusan DKV rata-rata kerja di mana dan gajinya berapa? Aku mau realistis perencanaan keuangannya." },
    { icon: "🏢", label: "Masuk agency kreatif",
      prompt: "Kak, aku pengen kerja di advertising agency atau creative studio. Persyaratannya apa aja buat fresh graduate DKV?" },
  ],
  AKL: [
    { icon: "💳", label: "Kerja di bank, syaratnya apa?",
      prompt: "Kak, aku dari AKL pengen kerja di bank atau lembaga keuangan. Syaratnya apa? Harus sarjana dulu atau bisa langsung?" },
    { icon: "📊", label: "Brevet pajak itu perlu nggak?",
      prompt: "Kak, katanya lulusan AKL perlu ambil brevet pajak. Itu apa, perlu nggak, dan berapa biayanya?" },
    { icon: "🧾", label: "Akuntansi vs langsung kerja",
      prompt: "Kak, aku dari AKL. Lebih baik langsung kerja sebagai staff keuangan atau kuliah akuntansi dulu?" },
    { icon: "🏦", label: "Info lowongan BUMN untuk AKL",
      prompt: "Kak, ada info lowongan BUMN atau instansi pemerintah yang cocok untuk lulusan SMK AKL?" },
  ],
  MPLB: [
    { icon: "🗂️", label: "Admin kantor itu kerja apa aja?",
      prompt: "Kak, kerja sebagai administrasi perkantoran itu sehari-harinya ngapain? Gajinya berapa untuk fresh graduate?" },
    { icon: "💼", label: "HRD bisa dari MPLB?",
      prompt: "Kak, aku dari MPLB tertarik jadi HRD. Bisa langsung dari SMK atau harus kuliah dulu?" },
    { icon: "📝", label: "Sertifikasi MOS itu penting?",
      prompt: "Kak, sertifikasi Microsoft Office Specialist (MOS) itu penting nggak buat cari kerja lulusan MPLB?" },
    { icon: "🌐", label: "Kerja di perusahaan multinasional",
      prompt: "Kak, lulusan MPLB bisa kerja di perusahaan multinasional nggak? Skill tambahan apa yang perlu disiapkan?" },
  ],
  Pemasaran: [
    { icon: "📣", label: "Digital marketing dari nol",
      prompt: "Kak, aku mau terjun ke digital marketing setelah lulus. Mulai belajar dari mana? Platform apa yang paling dicari?" },
    { icon: "🛒", label: "Jualan online sebagai karir",
      prompt: "Kak, bisa nggak jualan online di Shopee/TikTok dijadikan karir serius setelah lulus SMK Pemasaran?" },
    { icon: "💡", label: "Sales vs marketing, bedanya?",
      prompt: "Kak, aku bingung bedanya posisi Sales dengan Marketing. Mana yang lebih cocok buat fresh graduate?" },
    { icon: "📊", label: "Google Ads dan Meta Ads",
      prompt: "Kak, katanya skill Google Ads dan Meta Ads dicari. Gimana cara belajarnya? Ada sertifikasi gratis?" },
  ],
}
```

---

## Welcome Screen — Copy Baru

```tsx
// Sebelum pilih jurusan
const WELCOME_COPY = {
  headline: "Bingung mau kemana setelah lulus?",
  subheadline: "Kamu nggak sendirian. Kak Karir siap jawab semua yang kamu simpan sendiri — soal kerja, kuliah, beasiswa, atau wirausaha.",
  cta: "Pilih jurusanmu dulu →",
  trustNote: "Gratis · Privat · Khusus siswa SMK Negeri 6 Surakarta"
}

// Setelah pilih jurusan (contoh DKV)
const WELCOME_AFTER_MAJOR = {
  greeting: "Hai, sesama DKV! 🎨",
  message: "Kak Karir udah siap bantu kamu navigasi dunia karir desain. Mau tanya soal freelance, masuk agency, kuliah seni, atau beasiswa — tanya aja langsung.",
}
```

---

## Nama Produk — Rekomendasi Final

**Masalah saat ini:** "Deep Intel" tidak bicara ke siswa SMK.

| Pilihan | Pro | Kontra |
|---|---|---|
| **Kak Karir** | Warm, relatable, langsung jelas fungsinya | Kurang "tech" |
| **Deep Intel** | Terkesan canggih | Abstrak, tidak relevan untuk SMK |
| **KarirSMK** | Descriptive, SEO-friendly | Kurang personal |
| **Karir.id** | Bersih, profesional | Terlalu generic |

**Rekomendasi:** Ganti nama produk (app title, header, tagline) ke **"Kak Karir"** dan drop "Deep Intel" sepenuhnya. Alasan:
- Konsisten dengan persona AI yang sudah dibangun
- Siswa SMK lebih nyaman dengan sapaan "Kak" daripada brand corporate
- Ibu BK di transkrip sendiri bilang *"saya ingin bisa menjadi teman mereka"* — Kak Karir mencerminkan ini

---

## Tagline Alternatif

Pilih salah satu yang paling sesuai tone:

```
1. "Teman karir 24 jam untuk siswa SMK." (simple, warm)
2. "1 guru BK untuk 254 siswa — Kak Karir untuk kamu." (data-driven, impactful)
3. "Semua pertanyaan yang kamu takut tanya ke guru BK." (relatable, honest)
4. "Dari bingung jadi punya arah." (aspirational)
```

**Rekomendasi tagline untuk skripsi (academic framing):**
> "Layanan informasi karir mandiri berbasis AI untuk siswa SMK"

---

## Urutan Perubahan yang Disarankan

1. **Ganti nama "Deep Intel" → "Kak Karir"** di semua tempat (title, header, footer, meta)
2. **Buat welcome screen** dengan copy baru sebelum masuk chat
3. **Buat major selector wajib** — jadi gate sebelum bisa chat
4. **Ganti suggestion chips** dengan pertanyaan dari tabel di atas
5. **Setelah pilih jurusan**, greeting berubah personal sesuai jurusan
