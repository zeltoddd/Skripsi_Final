// ============================================================
// RAG_SETUP.ts — Fixed
// Perubahan dari versi lama:
// 1. Data beasiswa dari transkrip wawancara (bukan dummy lama)
// 2. getScholarshipContext() return konteks KAYA, bukan 1 baris
// 3. Guard: jika data kosong → instruksi eksplisit jangan ngarang
// 4. Semua helper return string siap injeksi ke system prompt
// ============================================================

import { getMajorContext } from './RAG_MAJORS'

export interface Scholarship {
  id: string
  name: string
  provider: string
  type: 'prestasi' | 'ekonomi' | 'minat-bakat'
  eligibleClass: string[]
  eligibleMajors: string[]
  requirements: string[]
  benefit: string
  periodOpen: string
  registrationMethod: string
  contact: string
  link?: string
  isActive: boolean
}

export interface DUDIPartner {
  id: string
  companyName: string
  industry: string
  city: string
  eligibleMajors: string[]
  opensJobVacancy: boolean
  vacancyInfo?: string
  contact?: string
}

// ── Data Beasiswa ─────────────────────────────────────────────
// Sumber: transkrip wawancara langsung dengan Koordinator BK
// SMK Negeri 6 Surakarta

export const SCHOLARSHIPS: Scholarship[] = [
  {
    id: 'kip-smk',
    name: 'KIP (Kartu Indonesia Pintar)',
    provider: 'Kemendikbud Ristek',
    type: 'ekonomi',
    eligibleClass: ['X', 'XI', 'XII'],
    eligibleMajors: ['semua'],
    requirements: [
      'Terdaftar di DTKS atau pemegang KKS/PKH',
      'Aktif sebagai siswa SMK Negeri 6 Surakarta',
      'Penghasilan orang tua di bawah batas yang ditetapkan pemerintah',
    ],
    benefit: 'Bantuan biaya pendidikan — konfirmasi nominal ke kesiswaan',
    periodOpen: 'Saat PPDB atau awal tahun ajaran',
    registrationMethod: 'Melalui sekolah — hubungi bagian kesiswaan atau Guru BK',
    contact: 'Bagian Kesiswaan SMK Negeri 6 Surakarta',
    link: 'https://pip.kemdikbud.go.id',
    isActive: true,
  },
  {
    id: 'beasiswa-yatim-prestasi',
    name: 'Beasiswa Siswa Yatim/Piatu Berprestasi',
    provider: 'Dinas Pendidikan / Yayasan Mitra Sekolah',
    type: 'ekonomi',
    eligibleClass: ['X', 'XI', 'XII'],
    eligibleMajors: ['semua'],
    requirements: [
      'Berstatus yatim, piatu, atau yatim piatu',
      'Memiliki prestasi akademik yang baik',
      'Aktif sebagai siswa SMK Negeri 6 Surakarta',
    ],
    benefit: 'Konfirmasi nominal ke Guru BK',
    periodOpen: 'Konfirmasi periode ke Guru BK',
    registrationMethod: 'Melalui Guru BK dengan membawa dokumen pendukung',
    contact: 'Guru BK SMK Negeri 6 Surakarta',
    isActive: true,
  },
  {
    id: 'beasiswa-olahraga-seni',
    name: 'Beasiswa Prestasi Olahraga & Seni',
    provider: 'Dinas Pendidikan / Komite Sekolah',
    type: 'minat-bakat',
    eligibleClass: ['X', 'XI', 'XII'],
    eligibleMajors: ['semua'],
    requirements: [
      'Prestasi olahraga atau seni minimal tingkat kota',
      'Aktif sebagai siswa SMK Negeri 6 Surakarta',
      'Melampirkan sertifikat atau bukti prestasi',
    ],
    benefit: 'Konfirmasi nominal ke bagian kesiswaan',
    periodOpen: 'Diajukan setelah meraih prestasi',
    registrationMethod: 'Melalui Guru BK atau kesiswaan dengan lampiran sertifikat',
    contact: 'Bagian Kesiswaan SMK Negeri 6 Surakarta',
    isActive: true,
  },
  {
    id: 'beasiswa-hafidz',
    name: 'Beasiswa Hafidz Al-Quran',
    provider: 'Lembaga/Yayasan Islam Mitra Sekolah',
    type: 'minat-bakat',
    eligibleClass: ['X', 'XI', 'XII'],
    eligibleMajors: ['semua'],
    requirements: [
      'Hafal Al-Quran 30 juz',
      'Konfirmasi syarat tambahan ke Guru BK',
    ],
    benefit: 'Konfirmasi nominal ke Guru BK',
    periodOpen: 'Konfirmasi periode ke Guru BK',
    registrationMethod: 'Melalui Guru BK sekolah',
    contact: 'Guru BK SMK Negeri 6 Surakarta',
    isActive: true,
  },
  {
    id: 'beasiswa-pts-mitra',
    name: 'Beasiswa Masuk Perguruan Tinggi Swasta Mitra',
    provider: 'PTS mitra SMK Negeri 6 Surakarta',
    type: 'prestasi',
    eligibleClass: ['XII'],
    eligibleMajors: ['semua'],
    requirements: [
      'Siswa kelas XII yang ingin melanjutkan kuliah',
      'Syarat tiap PTS berbeda — konfirmasi saat sosialisasi di sekolah',
    ],
    benefit: 'Potongan uang pangkal hingga beasiswa penuh — tergantung PTS',
    periodOpen: 'Semester genap kelas XII (Januari–Mei) saat PTS berkunjung ke sekolah',
    registrationMethod: 'Melalui Guru BK atau langsung ke PTS saat sosialisasi',
    contact: 'Guru BK SMK Negeri 6 Surakarta',
    isActive: true,
  },
]

// ── Data DUDI ─────────────────────────────────────────────────
// TODO: isi nama spesifik dari Hubin/BKK setelah kunjungan sekolah

export const DUDI_PARTNERS: DUDIPartner[] = [
  {
    id: 'dudi-rpl-1',
    companyName: 'Mitra Industri Teknologi Surakarta',
    industry: 'Teknologi Informasi & Software',
    city: 'Surakarta',
    eligibleMajors: ['rpl'],
    opensJobVacancy: true,
    vacancyInfo: 'Konfirmasi posisi dan syarat ke bagian Hubin',
    contact: 'Bagian Hubungan Industri SMK Negeri 6 Surakarta',
  },
  {
    id: 'dudi-dkv-1',
    companyName: 'Mitra Industri Kreatif Surakarta',
    industry: 'Desain Grafis & Media Kreatif',
    city: 'Surakarta',
    eligibleMajors: ['dkv'],
    opensJobVacancy: false,
    contact: 'Bagian Hubungan Industri SMK Negeri 6 Surakarta',
  },
  {
    id: 'dudi-akl-1',
    companyName: 'Mitra Industri Keuangan Surakarta',
    industry: 'Jasa Keuangan & Akuntansi',
    city: 'Surakarta',
    eligibleMajors: ['akl'],
    opensJobVacancy: false,
    contact: 'Bagian Hubungan Industri SMK Negeri 6 Surakarta',
  },
]

// ── Career Paths ──────────────────────────────────────────────

export const CAREER_PATHS: Record<string, {
  roles: string[]
  skills: string[]
  certifications: string[]
  avgSalaryEntry: string
  higherEdu: string[]
}> = {
  rpl: {
    roles: ['Junior Web Developer', 'Mobile Developer', 'IT Support', 'QA Tester', 'Data Entry'],
    skills: ['JavaScript', 'Python', 'SQL', 'Git', 'React/Vue'],
    certifications: ['Dicoding Certified', 'Google Associate Android Developer', 'AWS Cloud Practitioner'],
    avgSalaryEntry: 'Rp 3.000.000 – 5.000.000/bulan',
    higherEdu: ['D4 Teknik Informatika (Politeknik)', 'S1 Ilmu Komputer (PTN/PTS)', 'Bisa lewat SNBP/SNBT'],
  },
  dkv: {
    roles: ['Junior Graphic Designer', 'Content Creator', 'Social Media Designer', 'Video Editor', 'Fotografer'],
    skills: ['Adobe Illustrator', 'Photoshop', 'Figma', 'CapCut/Premiere', 'Canva'],
    certifications: ['Adobe Certified Professional', 'Google UX Design Certificate'],
    avgSalaryEntry: 'Rp 2.500.000 – 4.500.000/bulan',
    higherEdu: ['S1 DKV (ISI Surakarta/Yogyakarta)', 'S1 Seni Rupa (UNS)', 'Ujian portofolio untuk jalur seni'],
  },
  akl: {
    roles: ['Staff Akuntansi', 'Admin Keuangan', 'Kasir', 'Teller Bank', 'Staff Pajak'],
    skills: ['Accurate/Zahir Accounting', 'Excel Advanced', 'Perpajakan dasar', 'Laporan Keuangan'],
    certifications: ['Brevet Pajak A & B', 'Certified Accounting Technician (CAT)'],
    avgSalaryEntry: 'Rp 2.500.000 – 4.000.000/bulan',
    higherEdu: ['D3 Akuntansi (PKN STAN)', 'S1 Akuntansi (UNS/UNDIP)', 'Bisa lewat SNBT'],
  },
  mplb: {
    roles: ['Staff Administrasi', 'Resepsionis', 'Customer Service', 'Data Entry', 'Operator'],
    skills: ['Microsoft Office Suite', 'Korespondensi bisnis', 'Manajemen arsip', 'Komunikasi profesional'],
    certifications: ['MOS (Microsoft Office Specialist)', 'Certified Administrative Professional'],
    avgSalaryEntry: 'Rp 2.200.000 – 3.500.000/bulan',
    higherEdu: ['S1 Manajemen / Administrasi Bisnis', 'Bisa lewat SNBP/SNBT'],
  },
  pemasaran: {
    roles: ['Sales Representative', 'Social Media Admin', 'Staff Marketing', 'SPG/SPB', 'Content Creator'],
    skills: ['META Ads', 'Google Ads', 'Copywriting', 'Komunikasi persuasif', 'CRM dasar'],
    certifications: ['Meta Marketing Professional', 'Google Ads Certification'],
    avgSalaryEntry: 'Rp 2.500.000 – 4.000.000 + komisi',
    higherEdu: ['S1 Manajemen Pemasaran', 'S1 Bisnis Digital', 'Bisa lewat SNBT'],
  },
}

// ── Kursus Rekomendasi ────────────────────────────────────────

export const COURSE_RECOMMENDATIONS: Record<string, {
  name: string; platform: string; url: string; isFree: boolean
}[]> = {
  rpl: [
    { name: 'Belajar Dasar Pemrograman Web', platform: 'Dicoding', url: 'https://dicoding.com', isFree: true },
    { name: 'Fullstack JavaScript', platform: 'MySkill', url: 'https://myskill.id', isFree: true },
    { name: 'Google Data Analytics', platform: 'Coursera', url: 'https://coursera.org', isFree: false },
  ],
  dkv: [
    { name: 'Canva Design School', platform: 'Canva', url: 'https://canva.com/designschool', isFree: true },
    { name: 'UI/UX Design Fundamental', platform: 'MySkill', url: 'https://myskill.id', isFree: true },
    { name: 'Adobe Illustrator Essential', platform: 'Domestika', url: 'https://domestika.org', isFree: false },
  ],
  akl: [
    { name: 'Excel untuk Akuntansi', platform: 'MySkill', url: 'https://myskill.id', isFree: true },
    { name: 'Brevet Pajak A & B', platform: 'IAI', url: 'https://iaiglobal.or.id', isFree: false },
  ],
  mplb: [
    { name: 'Microsoft Office Specialist', platform: 'Microsoft Learn', url: 'https://learn.microsoft.com', isFree: true },
    { name: 'Komunikasi Bisnis Profesional', platform: 'MySkill', url: 'https://myskill.id', isFree: true },
  ],
  pemasaran: [
    { name: 'Digital Marketing Fundamental', platform: 'MySkill', url: 'https://myskill.id', isFree: true },
    { name: 'Google Digital Marketing', platform: 'Google Skillshop', url: 'https://skillshop.google.com', isFree: true },
    { name: 'Meta Social Media Marketing', platform: 'Coursera', url: 'https://coursera.org', isFree: false },
  ],
}

// ── Normalisasi Jurusan ───────────────────────────────────────

export const normalizeMajor = (major: string): string => {
  const m = major.toLowerCase()
  if (m.includes('rekayasa') || m.includes('rpl') || m.includes('perangkat lunak')) return 'rpl'
  if (m.includes('desain') || m.includes('dkv') || m.includes('komunikasi visual')) return 'dkv'
  if (m.includes('akuntansi') || m.includes('akl') || m.includes('keuangan')) return 'akl'
  if (m.includes('perkantoran') || m.includes('mplb') || m.includes('manajemen perkantoran')) return 'mplb'
  if (m.includes('pemasaran') || m.includes('marketing')) return 'pemasaran'
  if (m.includes('broadcasting') || m.includes('penyiaran')) return 'broadcasting'
  if (m.includes('pariwisata') || m.includes('ulp') || m.includes('usaha layanan pariwisata')) return 'ulp'
  return 'umum'
}

// ── Context Builders ──────────────────────────────────────────
// Dipanggil dari nvidiaService.ts SEBELUM setiap API call
// Return string langsung diinjeksi ke system prompt

export const getScholarshipContext = (majorId?: string): string => {
  const active = SCHOLARSHIPS.filter(s => s.isActive)

  if (!active.length) {
    return '⚠️ INSTRUKSI: Data beasiswa dari sekolah belum tersedia. ' +
      'JANGAN menyebutkan nama beasiswa apapun. ' +
      'Jawab: "Untuk info beasiswa terkini, langsung tanya ke Guru BK atau bagian kesiswaan ya."'
  }

  const filtered = majorId && majorId !== 'umum'
    ? active.filter(s =>
        s.eligibleMajors.includes('semua') ||
        s.eligibleMajors.includes(majorId)
      )
    : active

  return filtered.map(s => `
### ${s.name}
- Pemberi: ${s.provider}
- Untuk: Kelas ${s.eligibleClass.join('/')} | ${s.eligibleMajors.includes('semua') ? 'Semua jurusan' : s.eligibleMajors.join(', ')}
- Syarat: ${s.requirements.join('; ')}
- Manfaat: ${s.benefit}
- Buka: ${s.periodOpen}
- Cara daftar: ${s.registrationMethod}
- Kontak: ${s.contact}${s.link ? `\n- Link: ${s.link}` : ''}
`.trim()).join('\n\n')
}

export const getDUDIContext = (majorId?: string): string => {
  const norm = majorId ? normalizeMajor(majorId) : 'umum'
  const filtered = DUDI_PARTNERS.filter(d =>
    d.eligibleMajors.includes('semua') || d.eligibleMajors.includes(norm)
  )

  if (!filtered.length) {
    return '⚠️ INSTRUKSI: Data mitra kerja belum tersedia. ' +
      'Arahkan siswa ke bagian Hubin/BKK sekolah untuk info PKL dan lowongan.'
  }

  return filtered.map(d => `
### ${d.companyName}
- Bidang: ${d.industry} | Kota: ${d.city}
- Buka lowongan: ${d.opensJobVacancy ? `Ya — ${d.vacancyInfo ?? 'konfirmasi ke Hubin'}` : 'Belum ada info'}
- Kontak: ${d.contact ?? 'Bagian Hubin sekolah'}
`.trim()).join('\n\n')
}

export const getCareerPathContext = (majorId: string): string => {
  // Ambil dari RAG_MAJORS (lebih kaya)
  const rich = getMajorContext(majorId)
  if (rich) return rich

  // Fallback ke data ringkas jika data kaya tidak ditemukan
  const norm = normalizeMajor(majorId)
  const path = CAREER_PATHS[norm]
  if (!path) return ''
  return `
### Jalur Karir — ${norm.toUpperCase()}
- Posisi entry level: ${path.roles.join(', ')}
- Skill kunci: ${path.skills.join(', ')}
- Sertifikasi: ${path.certifications.join(', ')}
- Estimasi gaji awal: ${path.avgSalaryEntry}
- Opsi kuliah: ${path.higherEdu.join(' | ')}
`.trim()
}


export const getCourseContext = (majorId: string): string => {
  const norm = normalizeMajor(majorId)
  const courses = COURSE_RECOMMENDATIONS[norm]
  if (!courses?.length) return 'Rekomendasi: Cek MySkill.id dan Dicoding untuk kursus gratis.'

  return courses.map(c =>
    `- ${c.name} — ${c.platform} (${c.isFree ? 'GRATIS' : 'Berbayar'}) | ${c.url}`
  ).join('\n')
}

export const getHumanizerContext = (): string => {
  return `
<FORMAT_RULES>
- STRUKTUR PENDEK (WAJIB): Jangan pernah memberikan lebih dari 3 Heading (###) dalam satu respon.
- BATAS TABEL: MAKSIMAL HANYA 1 TABEL dalam satu pesan.
- BATAS LIST: Jika menggunakan bullet points, MAKSIMAL HANYA 3 POIN.
- HIERARKI VISUAL: Gunakan Heading (###) dan Blockquote (>) agar mudah dibaca.
- PING-PONG: Tutup obrolan dengan 1 pertanyaan pendek.
</FORMAT_RULES>

<TONE_RULES>
- BAHASA: WAJIB 100% Bahasa Indonesia santai ala chat WA Gen-Z (gunakan "kalo", "udah", "aja", "emang", "sih", "tuh"). NO CHINESE/HANZI.
- LANGSUNG KE INTI (KRITIKAL): DILARANG KERAS merespon dengan basa-basi. JANGAN menggunakan awalan seperti "Wah, bagus sekali", "Pertanyaan menarik", "Tentu,", "Baik," atau memvalidasi perasaan user. Langsung berikan jawaban di kalimat pertama!
- HEADING SANTAI: Jangan pakai judul kaku seperti "Opsi Beasiswa yang Tersedia". Ganti jadi "Pilihan Beasiswa nih" atau "Info Beasiswa SMKN 6".
- Berperan sebagai kating/alumni gaul. Jangan menggurui. 
- JANGAN memakai kalimat pembuka/penutup yang template.
</TONE_RULES>
`.trim();
}


export const JOBS = [
  {
    id: 'job-1',
    title: 'Junior Web Developer',
    company: 'Mitra Industri Teknologi Surakarta',
    location: 'Surakarta',
    type: 'Full-time / Magang',
    salary: 'Rp 3jt - 5jt',
    major: 'rpl'
  },
  {
    id: 'job-2',
    title: 'Graphic Designer Trainee',
    company: 'Mitra Industri Kreatif Surakarta',
    location: 'Surakarta',
    type: 'Internship',
    salary: 'Rp 2jt - 3.5jt',
    major: 'dkv'
  },
  {
    id: 'job-3',
    title: 'Staff Admin Keuangan',
    company: 'Mitra Industri Keuangan Surakarta',
    location: 'Surakarta',
    type: 'Full-time',
    salary: 'Rp 2.5jt - 4jt',
    major: 'akl'
  }
];
