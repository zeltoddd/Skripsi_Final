// constants/suggestions.ts

export const SUGGESTIONS_DEFAULT = [
  { icon: "🤔", label: "Kerja dulu atau kuliah dulu?", prompt: "Kak, aku bingung nih — lebih baik kerja dulu atau langsung kuliah setelah lulus SMK? Gimana cara mikirnya?" },
  { icon: "🎓", label: "Lulusan SMK bisa masuk PTN?", prompt: "Kak, bener nggak sih lulusan SMK bisa masuk universitas negeri? Gimana caranya lewat SNBP atau SNBT?" },
  { icon: "💼", label: "Kerja apa yang cocok buat aku?", prompt: "Kak, aku mau kerja setelah lulus tapi bingung cocoknya di bidang apa. Bisa bantu arahkan?" },
  { icon: "🎯", label: "Kerja sambil kuliah, bisa?", prompt: "Kak, bisa nggak ya kerja sambil kuliah? Ada tips atau program yang memungkinkan itu?" },
  { icon: "📋", label: "Beasiswa apa yang bisa aku daftar?", prompt: "Kak, beasiswa apa saja yang tersedia buat siswa SMK seperti aku? Gimana cara daftarnya?" },
  { icon: "🚀", label: "Mau wirausaha, mulai dari mana?", prompt: "Kak, aku pengen coba wirausaha setelah lulus. Dari mana mulainya dan apa yang perlu dipersiapkan?" },
];

export const SUGGESTIONS_BY_MAJOR: Record<string, any[]> = {
  rpl: [
    { icon: "💻", label: "Gaji programmer fresh graduate?", prompt: "Kak, berapa rata-rata gaji programmer atau developer fresh graduate lulusan SMK RPL? Dan kota mana yang paling banyak lowongannya?" },
    { icon: "📁", label: "Portofolio buat melamar kerja", prompt: "Kak, aku lulusan RPL. Portofolio seperti apa yang dibutuhkan untuk melamar kerja sebagai developer?" },
    { icon: "🎓", label: "Kuliah IT dari SMK RPL", prompt: "Kak, aku dari RPL mau kuliah jurusan IT atau Informatika. Bisa lewat SNBP nggak? Politeknik mana yang bagus?" },
    { icon: "🔐", label: "Jadi cybersecurity expert", prompt: "Kak, aku tertarik di bidang cybersecurity. Dari SMK RPL bisa nggak? Mulai dari mana?" },
  ],
  dkv: [
    { icon: "🎨", label: "Freelance desain, bisa sekarang?", prompt: "Kak, aku masih kelas XII DKV. Bisa mulai freelance desain dari sekarang? Gimana caranya dapat klien pertama?" },
    { icon: "📱", label: "UI/UX designer itu gimana?", prompt: "Kak, aku dari DKV tertarik jadi UI/UX designer. Bedanya sama desainer grafis apa? Skill apa yang perlu dipelajari?" },
    { icon: "💰", label: "Jurusan DKV gajinya berapa?", prompt: "Kak, lulusan DKV rata-rata kerja di mana dan gajinya berapa?" },
    { icon: "🏢", label: "Masuk agency kreatif", prompt: "Kak, aku pengen kerja di advertising agency atau creative studio. Persyaratannya apa aja buat fresh graduate DKV?" },
  ],
  akl: [
    { icon: "💳", label: "Kerja di bank, syaratnya apa?", prompt: "Kak, aku dari AKL pengen kerja di bank atau lembaga keuangan. Syaratnya apa? Harus sarjana dulu atau bisa langsung?" },
    { icon: "📊", label: "Brevet pajak itu perlu nggak?", prompt: "Kak, katanya lulusan AKL perlu ambil brevet pajak. Itu apa, perlu nggak, dan berapa biayanya?" },
    { icon: "🧾", label: "Akuntansi vs langsung kerja", prompt: "Kak, aku dari AKL. Lebih baik langsung kerja sebagai staff keuangan atau kuliah akuntansi dulu?" },
    { icon: "🏦", label: "Info lowongan BUMN untuk AKL", prompt: "Kak, ada info lowongan BUMN atau instansi pemerintah yang cocok untuk lulusan SMK AKL?" },
  ],
  mplb: [
    { icon: "🗂️", label: "Admin kantor kerja apa aja?", prompt: "Kak, kerja sebagai administrasi perkantoran itu sehari-harinya ngapain? Gajinya berapa untuk fresh graduate?" },
    { icon: "💼", label: "HRD bisa dari MPLB?", prompt: "Kak, aku dari MPLB tertarik jadi HRD. Bisa langsung dari SMK atau harus kuliah dulu?" },
    { icon: "📝", label: "Sertifikasi MOS itu penting?", prompt: "Kak, sertifikasi Microsoft Office Specialist (MOS) itu penting nggak buat cari kerja lulusan MPLB?" },
    { icon: "🌐", label: "Kerja di perusahaan asing", prompt: "Kak, lulusan MPLB bisa kerja di perusahaan multinasional nggak? Skill tambahan apa yang perlu disiapkan?" },
  ],
  pemasaran: [
    { icon: "📣", label: "Digital marketing dari nol", prompt: "Kak, aku mau terjun ke digital marketing setelah lulus. Mulai belajar dari mana?" },
    { icon: "🛒", label: "Jualan online sebagai karir", prompt: "Kak, bisa nggak jualan online di Shopee/TikTok dijadikan karir serius setelah lulus SMK Pemasaran?" },
    { icon: "💡", label: "Sales vs marketing, bedanya?", prompt: "Kak, aku bingung bedanya posisi Sales dengan Marketing. Mana yang lebih cocok buat fresh graduate?" },
    { icon: "📊", label: "Google Ads dan Meta Ads", prompt: "Kak, katanya skill Google Ads dan Meta Ads dicari. Gimana cara belajarnya?" },
  ],
};
