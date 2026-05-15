// ============================================================
// RAG_MAJORS.ts — Per-Major Knowledge Base
// Data komprehensif per jurusan untuk memperkuat konteks AI
// Sumber: kurikulum SMK, data industri Indonesia, BPS, Glints
// ============================================================

export interface MajorKnowledge {
  id: string
  name: string
  fullName: string
  emoji: string
  description: string                    // deskripsi jurusan untuk siswa
  coreSubjects: string[]                 // mapel produktif utama
  hardSkills: string[]                   // skill teknis yang dipelajari
  softSkills: string[]                   // skill non-teknis penting
  tools: string[]                        // software/alat yang dipakai
  careerTracks: CareerTrack[]
  salaryData: SalaryData
  certifications: Certification[]
  higherEducation: HigherEdOption[]
  pklTips: string[]                      // tips PKL spesifik jurusan
  commonMisconceptions: { myth: string; fact: string }[]
  commonStudentQuestions: { q: string; a: string }[]
  localCompanies: string[]               // perusahaan di Solo/Surakarta yang relevan
  nationalPlatforms: string[]            // platform karir/belajar yang relevan
  industryDemand: {
    level: 'sangat tinggi' | 'tinggi' | 'sedang'
    trend: string
    hotRoles: string[]
  }
  freelanceOpportunity: {
    possible: boolean
    description: string
    platforms: string[]
    estimatedIncome: string
  }
  entrepreneurshipPath: string           // peluang wirausaha dari jurusan ini
}

export interface CareerTrack {
  name: string
  entryLevel: { role: string; salary: string }[]
  midLevel: { role: string; salary: string; yearsExp: string }[]
  seniorLevel: { role: string; salary: string; yearsExp: string }[]
  requiredSkills: string[]
}

export interface SalaryData {
  freshGraduate: string
  oneToThreeYears: string
  fiveYearsPlus: string
  topEarner: string
  notes: string
}

export interface Certification {
  name: string
  provider: string
  cost: string
  difficulty: 'mudah' | 'sedang' | 'sulit'
  value: 'tinggi' | 'sedang'
  link?: string
}

export interface HigherEdOption {
  type: 'D3' | 'D4' | 'S1'
  major: string
  institutions: string[]
  entryPath: string[]
  notes: string
}

// ============================================================
// DATA PER JURUSAN
// ============================================================

export const MAJOR_KNOWLEDGE: Record<string, MajorKnowledge> = {

  // ──────────────────────────────────────────────────────────
  // RPL — Rekayasa Perangkat Lunak
  // ──────────────────────────────────────────────────────────
  rpl: {
    id: 'rpl',
    name: 'RPL',
    fullName: 'Rekayasa Perangkat Lunak',
    emoji: '💻',
    description: 'Jurusan yang mempelajari cara membuat, mengembangkan, dan memelihara perangkat lunak (software). Kamu akan belajar coding, desain sistem, dan cara kerja teknologi digital.',
    coreSubjects: [
      'Pemrograman Dasar (Python, JavaScript)',
      'Basis Data (SQL)',
      'Pemrograman Web (HTML, CSS, JS)',
      'Pemrograman Berorientasi Objek (Java/PHP)',
      'Rekayasa Perangkat Lunak',
      'Jaringan Komputer Dasar',
    ],
    hardSkills: [
      'Pemrograman: Python, JavaScript, PHP, Java',
      'Web Development: HTML, CSS, React, Node.js',
      'Database: MySQL, PostgreSQL',
      'Version Control: Git & GitHub',
      'Mobile Development: Flutter/Android dasar',
      'API Integration',
      'Testing & Debugging',
    ],
    softSkills: [
      'Problem solving & logical thinking',
      'Kemampuan belajar mandiri (teknologi cepat berubah)',
      'Komunikasi teknis',
      'Kolaborasi tim (agile/scrum)',
      'Manajemen waktu & deadline',
    ],
    tools: [
      'VS Code, IntelliJ IDEA',
      'GitHub/GitLab',
      'Postman (API testing)',
      'MySQL Workbench',
      'Figma (kolaborasi dengan designer)',
      'Docker (basic)',
    ],
    careerTracks: [
      {
        name: 'Web & Mobile Development',
        entryLevel: [
          { role: 'Junior Frontend Developer', salary: 'Rp 3.000.000 – 5.000.000' },
          { role: 'Junior Backend Developer', salary: 'Rp 3.500.000 – 5.500.000' },
          { role: 'Junior Fullstack Developer', salary: 'Rp 4.000.000 – 6.000.000' },
        ],
        midLevel: [
          { role: 'Frontend Developer', salary: 'Rp 7.000.000 – 15.000.000', yearsExp: '2–4 tahun' },
          { role: 'Backend Developer', salary: 'Rp 8.000.000 – 18.000.000', yearsExp: '2–4 tahun' },
          { role: 'Mobile Developer (iOS/Android)', salary: 'Rp 8.000.000 – 20.000.000', yearsExp: '3–5 tahun' },
        ],
        seniorLevel: [
          { role: 'Senior Software Engineer', salary: 'Rp 20.000.000 – 50.000.000', yearsExp: '5+ tahun' },
          { role: 'Tech Lead / Engineering Manager', salary: 'Rp 30.000.000 – 70.000.000', yearsExp: '7+ tahun' },
        ],
        requiredSkills: ['JavaScript/TypeScript', 'React/Vue/Angular', 'Node.js/Laravel/Django', 'SQL & NoSQL'],
      },
      {
        name: 'Data & Analytics',
        entryLevel: [
          { role: 'Data Entry & Junior Analyst', salary: 'Rp 3.000.000 – 4.500.000' },
          { role: 'Business Intelligence Analyst', salary: 'Rp 4.000.000 – 6.000.000' },
        ],
        midLevel: [
          { role: 'Data Analyst', salary: 'Rp 8.000.000 – 18.000.000', yearsExp: '2–4 tahun' },
          { role: 'Data Engineer', salary: 'Rp 10.000.000 – 22.000.000', yearsExp: '3–5 tahun' },
        ],
        seniorLevel: [
          { role: 'Senior Data Scientist', salary: 'Rp 20.000.000 – 45.000.000', yearsExp: '5+ tahun' },
          { role: 'ML Engineer', salary: 'Rp 25.000.000 – 60.000.000', yearsExp: '5+ tahun' },
        ],
        requiredSkills: ['Python', 'SQL', 'Tableau/PowerBI', 'Statistics dasar', 'Machine Learning'],
      },
      {
        name: 'IT Support & System',
        entryLevel: [
          { role: 'IT Support Technician', salary: 'Rp 2.500.000 – 4.000.000' },
          { role: 'Junior System Administrator', salary: 'Rp 3.000.000 – 5.000.000' },
        ],
        midLevel: [
          { role: 'System Administrator', salary: 'Rp 5.000.000 – 12.000.000', yearsExp: '2–4 tahun' },
          { role: 'DevOps Engineer', salary: 'Rp 10.000.000 – 25.000.000', yearsExp: '3–5 tahun' },
        ],
        seniorLevel: [
          { role: 'Senior DevOps / Cloud Architect', salary: 'Rp 20.000.000 – 50.000.000', yearsExp: '5+ tahun' },
        ],
        requiredSkills: ['Linux', 'Networking', 'Cloud (AWS/GCP/Azure)', 'Docker/Kubernetes'],
      },
    ],
    salaryData: {
      freshGraduate: 'Rp 3.000.000 – 5.000.000/bulan (kota besar: hingga Rp 7.000.000)',
      oneToThreeYears: 'Rp 7.000.000 – 15.000.000/bulan',
      fiveYearsPlus: 'Rp 20.000.000 – 40.000.000/bulan',
      topEarner: 'Rp 50.000.000+/bulan (startup unicorn, perusahaan multinasional)',
      notes: 'RPL adalah jurusan dengan potensi gaji tertinggi di antara semua jurusan SMK. Remote work sangat umum sehingga lokasi bukan hambatan.',
    },
    certifications: [
      { name: 'Dicoding Certified (berbagai level)', provider: 'Dicoding Indonesia', cost: 'Gratis – Rp 500.000', difficulty: 'mudah', value: 'tinggi', link: 'https://dicoding.com' },
      { name: 'Google Associate Android Developer', provider: 'Google', cost: 'Gratis', difficulty: 'sedang', value: 'tinggi', link: 'https://developers.google.com/certification' },
      { name: 'AWS Cloud Practitioner', provider: 'Amazon Web Services', cost: 'Rp 1.200.000 (ujian)', difficulty: 'sedang', value: 'tinggi', link: 'https://aws.amazon.com/certification' },
      { name: 'Google Data Analytics Certificate', provider: 'Google via Coursera', cost: 'Rp 200.000/bulan', difficulty: 'sedang', value: 'tinggi', link: 'https://grow.google/certificates' },
      { name: 'Junior Web Developer (BNSP)', provider: 'LSP Telematika', cost: 'Rp 300.000 – 600.000', difficulty: 'sedang', value: 'tinggi' },
    ],
    higherEducation: [
      {
        type: 'D4',
        major: 'Teknik Informatika / Rekayasa Perangkat Lunak',
        institutions: ['Politeknik Elektronika Negeri Surabaya (PENS)', 'Politeknik Negeri Semarang', 'Politeknik Negeri Malang', 'Politeknik Negeri Bandung'],
        entryPath: ['SNBT (Politeknik)', 'Jalur Mandiri Politeknik', 'Beasiswa Politeknik'],
        notes: 'D4 setara S1, lebih praktis dan langsung ke dunia kerja. Banyak yang langsung diterima kerja sebelum wisuda.',
      },
      {
        type: 'S1',
        major: 'Ilmu Komputer / Teknik Informatika / Sistem Informasi',
        institutions: ['UNS Surakarta', 'UGM Yogyakarta', 'UNDIP Semarang', 'UNY', 'Universitas Dian Nuswantoro Semarang'],
        entryPath: ['SNBP (undangan rapor)', 'SNBT (tes)', 'Jalur Mandiri'],
        notes: 'Lulusan SMK RPL bisa masuk PTN lewat SNBP/SNBT. Pastikan nilai rapor konsisten dan ikuti kegiatan kompetisi IT untuk meningkatkan peluang SNBP.',
      },
    ],
    pklTips: [
      'Pilih perusahaan yang benar-benar menggunakan kamu untuk coding, bukan hanya admin/fotokopi',
      'Minta mentor yang bisa mengajarkan code review dan best practices',
      'Dokumentasikan semua project yang kamu kerjakan — ini jadi portofolio',
      'Pelajari Git sebelum PKL karena hampir semua perusahaan tech pakai Git',
      'Jangan malu bertanya, developer senior senang mengajari yang antusias',
      'Usahakan PKL di tech company, software house, atau startup — bukan kantor umum',
      'Catat stack teknologi yang dipakai: ini bahan cerita di CV dan wawancara kerja',
    ],
    commonMisconceptions: [
      {
        myth: 'Harus mahir matematika untuk bisa coding',
        fact: 'Coding lebih butuh logika dan kemampuan memecahkan masalah. Matematika yang dibutuhkan sebatas logika dasar, kecuali kamu masuk bidang data science atau AI.',
      },
      {
        myth: 'Lulusan SMK RPL tidak bisa bersaing dengan sarjana IT',
        fact: 'Di dunia kerja tech, portofolio dan skill lebih penting dari ijazah. Banyak developer sukses berlatar SMK/autodidak. Yang penting punya karya yang bisa ditunjukkan.',
      },
      {
        myth: 'Harus di Jakarta untuk kerja IT dengan gaji besar',
        fact: 'Remote work sangat umum di industri tech. Kamu bisa kerja untuk perusahaan Jakarta/Surabaya bahkan luar negeri dari Solo.',
      },
      {
        myth: 'RPL hanya bisa jadi programmer',
        fact: 'Lulusan RPL bisa jadi UI/UX designer, data analyst, IT project manager, cybersecurity, game developer, bahkan digital marketer yang paham data.',
      },
    ],
    commonStudentQuestions: [
      {
        q: 'Mulai belajar coding dari mana?',
        a: 'Mulai dari Dicoding.com — gratis dan berbahasa Indonesia. Pilih jalur "Belajar Dasar Pemrograman Web". Setelah itu coba buat project kecil sendiri: website portofolio, aplikasi to-do list, atau kalkulator. Project nyata jauh lebih berharga dari menonton tutorial.',
      },
      {
        q: 'Apakah perlu laptop mahal untuk belajar coding?',
        a: 'Tidak. Laptop dengan RAM 8GB dan processor Intel Core i5/AMD Ryzen 5 sudah cukup. Bahkan Chromebook bisa dipakai dengan cloud coding tools seperti CodeSandbox atau Replit. Yang lebih penting adalah koneksi internet dan ketekunan.',
      },
      {
        q: 'Bahasa pemrograman mana yang harus dipelajari pertama?',
        a: 'Untuk fresh starter: Python (paling mudah dipahami, berguna di data science & AI) atau JavaScript (langsung bisa bikin website). Pilih satu, kuasai dasarnya dulu, baru eksplorasi yang lain.',
      },
      {
        q: 'Berapa lama bisa siap kerja setelah lulus SMK RPL?',
        a: 'Kalau aktif belajar dan punya 2-3 project di GitHub, banyak fresh graduate SMK RPL yang langsung diterima kerja. Yang biasanya jadi hambatan bukan ijazah, tapi portofolio yang kosong.',
      },
    ],
    localCompanies: [
      'Solo Technopark (inkubator startup Kota Surakarta)',
      'PT Aksara Solopos (media digital)',
      'Perusahaan IT lokal di kawasan Solo Raya',
      'Startup-startup di ekosistem Solo Tech',
      'Biro jasa website dan digital marketing Solo',
    ],
    nationalPlatforms: [
      'Dicoding.com — kursus coding berbahasa Indonesia',
      'MySkill.id — berbagai kursus tech gratis',
      'GitHub — portofolio dan kolaborasi',
      'Glints.com — cari loker tech',
      'Kalibrr.com — cari loker tech',
      'LinkedIn — networking profesional',
      'Hackerrank.com — latihan coding untuk tes seleksi',
    ],
    industryDemand: {
      level: 'sangat tinggi',
      trend: '+24% pertumbuhan permintaan YoY. Transformasi digital semua sektor mendorong demand developer terus naik.',
      hotRoles: ['Frontend Developer', 'Mobile Developer (Flutter/React Native)', 'Data Analyst', 'Fullstack Developer', 'Cloud Engineer'],
    },
    freelanceOpportunity: {
      possible: true,
      description: 'Freelance sangat umum di RPL. Bisa mulai dari kelas XI dengan proyek kecil. Banyak UMKM butuh website dan aplikasi sederhana.',
      platforms: ['Fastwork.id', 'Projects.co.id', 'Sribulancer.com', 'Fiverr.com', 'Upwork.com'],
      estimatedIncome: 'Rp 500.000 – 5.000.000 per project (tergantung kompleksitas). Developer berpengalaman bisa Rp 10.000.000+ per project.',
    },
    entrepreneurshipPath: 'Bisa langsung buka jasa pembuatan website/aplikasi, digital agency, atau kembangkan produk SaaS sendiri. Banyak startup Indonesia dimulai dari developer SMK/mahasiswa.',
  },

  // ──────────────────────────────────────────────────────────
  // DKV — Desain Komunikasi Visual
  // ──────────────────────────────────────────────────────────
  dkv: {
    id: 'dkv',
    name: 'DKV',
    fullName: 'Desain Komunikasi Visual',
    emoji: '🎨',
    description: 'Jurusan yang mempelajari cara menyampaikan pesan melalui visual — logo, poster, packaging, konten media sosial, video, hingga UI/UX aplikasi. Ini adalah jurusan untuk kamu yang kreatif dan suka estetika.',
    coreSubjects: [
      'Nirmana (Dasar-dasar Visual)',
      'Tipografi',
      'Ilustrasi Digital',
      'Desain Grafis (Logo, Poster, Branding)',
      'Fotografi Dasar',
      'Videografi & Editing',
      'Desain Publikasi',
      'Animasi 2D Dasar',
    ],
    hardSkills: [
      'Adobe Illustrator (vector & logo)',
      'Adobe Photoshop (foto & manipulasi)',
      'Adobe InDesign (layout & publikasi)',
      'Figma (UI/UX design)',
      'CapCut / Adobe Premiere Pro (video editing)',
      'After Effects (motion graphics)',
      'Canva (konten cepat)',
      'Fotografi & lighting dasar',
    ],
    softSkills: [
      'Kreativitas dan estetika',
      'Kemampuan presentasi konsep',
      'Menerima dan memberikan feedback',
      'Manajemen brief klien',
      'Storytelling visual',
      'Adaptasi tren desain',
    ],
    tools: [
      'Adobe Creative Suite (Illustrator, Photoshop, InDesign, Premiere, After Effects)',
      'Figma (kolaborasi desain)',
      'Canva (konten cepat)',
      'Procreate (digital illustration, iPad)',
      'Blender (3D dasar)',
    ],
    careerTracks: [
      {
        name: 'Graphic Design & Branding',
        entryLevel: [
          { role: 'Junior Graphic Designer', salary: 'Rp 2.500.000 – 4.000.000' },
          { role: 'Social Media Designer', salary: 'Rp 2.500.000 – 4.500.000' },
          { role: 'Layout Artist', salary: 'Rp 2.500.000 – 3.500.000' },
        ],
        midLevel: [
          { role: 'Graphic Designer', salary: 'Rp 5.000.000 – 12.000.000', yearsExp: '2–4 tahun' },
          { role: 'Brand Designer', salary: 'Rp 6.000.000 – 15.000.000', yearsExp: '3–5 tahun' },
          { role: 'Art Director', salary: 'Rp 10.000.000 – 25.000.000', yearsExp: '4–6 tahun' },
        ],
        seniorLevel: [
          { role: 'Senior Art Director', salary: 'Rp 20.000.000 – 40.000.000', yearsExp: '6+ tahun' },
          { role: 'Creative Director', salary: 'Rp 25.000.000 – 60.000.000', yearsExp: '8+ tahun' },
        ],
        requiredSkills: ['Adobe Illustrator', 'Photoshop', 'Brand identity', 'Typography mastery'],
      },
      {
        name: 'UI/UX Design',
        entryLevel: [
          { role: 'Junior UI Designer', salary: 'Rp 3.000.000 – 5.000.000' },
          { role: 'Junior UX Researcher', salary: 'Rp 3.500.000 – 5.500.000' },
        ],
        midLevel: [
          { role: 'UI/UX Designer', salary: 'Rp 7.000.000 – 18.000.000', yearsExp: '2–4 tahun' },
          { role: 'Product Designer', salary: 'Rp 10.000.000 – 25.000.000', yearsExp: '3–5 tahun' },
        ],
        seniorLevel: [
          { role: 'Senior Product Designer', salary: 'Rp 20.000.000 – 45.000.000', yearsExp: '5+ tahun' },
          { role: 'Head of Design', salary: 'Rp 30.000.000 – 70.000.000', yearsExp: '7+ tahun' },
        ],
        requiredSkills: ['Figma', 'User research', 'Prototyping', 'Design system', 'Psychology dasar'],
      },
      {
        name: 'Content Creator & Digital Media',
        entryLevel: [
          { role: 'Content Creator', salary: 'Rp 2.500.000 – 4.000.000' },
          { role: 'Social Media Specialist', salary: 'Rp 2.500.000 – 4.500.000' },
          { role: 'Video Editor', salary: 'Rp 3.000.000 – 5.000.000' },
        ],
        midLevel: [
          { role: 'Content Strategist', salary: 'Rp 5.000.000 – 12.000.000', yearsExp: '2–3 tahun' },
          { role: 'Motion Designer', salary: 'Rp 6.000.000 – 15.000.000', yearsExp: '2–4 tahun' },
          { role: 'Digital Marketing Creative', salary: 'Rp 5.000.000 – 12.000.000', yearsExp: '2–4 tahun' },
        ],
        seniorLevel: [
          { role: 'Head of Creative', salary: 'Rp 15.000.000 – 35.000.000', yearsExp: '5+ tahun' },
        ],
        requiredSkills: ['Video editing', 'Copywriting', 'Platform analytics', 'Trend awareness'],
      },
    ],
    salaryData: {
      freshGraduate: 'Rp 2.500.000 – 4.500.000/bulan (freelance bisa lebih tinggi)',
      oneToThreeYears: 'Rp 5.000.000 – 12.000.000/bulan',
      fiveYearsPlus: 'Rp 12.000.000 – 30.000.000/bulan',
      topEarner: 'Rp 40.000.000+/bulan (Creative Director di perusahaan besar)',
      notes: 'Desainer dengan portofolio kuat dan keahlian UI/UX punya nilai jual sangat tinggi di era digital. Freelance bisa melampaui gaji karyawan.',
    },
    certifications: [
      { name: 'Adobe Certified Professional', provider: 'Adobe', cost: 'Rp 800.000 – 1.500.000 (ujian)', difficulty: 'sedang', value: 'tinggi', link: 'https://certifiedprofessional.adobe.com' },
      { name: 'Google UX Design Certificate', provider: 'Google via Coursera', cost: 'Rp 200.000/bulan', difficulty: 'sedang', value: 'tinggi', link: 'https://grow.google/certificates/ux-design' },
      { name: 'Figma Professional', provider: 'Figma Academy', cost: 'Gratis', difficulty: 'mudah', value: 'sedang', link: 'https://academy.figma.com' },
      { name: 'Meta Social Media Marketing', provider: 'Meta via Coursera', cost: 'Rp 200.000/bulan', difficulty: 'mudah', value: 'sedang' },
    ],
    higherEducation: [
      {
        type: 'S1',
        major: 'Desain Komunikasi Visual / Desain Grafis',
        institutions: ['ISI Surakarta', 'ISI Yogyakarta', 'UNS (Seni Rupa)', 'Universitas Dian Nuswantoro Semarang', 'Universitas Sebelas Maret'],
        entryPath: ['SNBP (nilai rapor + portofolio)', 'SNBT', 'Jalur Mandiri/Portofolio'],
        notes: 'Jurusan seni dan desain biasanya minta portofolio saat seleksi. Siapkan minimal 5-10 karya terbaik.',
      },
      {
        type: 'D4',
        major: 'Desain Grafis / Animasi',
        institutions: ['Politeknik Negeri Media Kreatif Jakarta', 'Politeknik Seni Yogyakarta'],
        entryPath: ['SNBT Politeknik', 'Jalur Mandiri'],
        notes: 'Politeknik lebih praktis dan langsung ke industri. Banyak yang langsung kerja atau freelance setelah lulus.',
      },
    ],
    pklTips: [
      'Prioritaskan PKL di creative agency, studio desain, atau perusahaan dengan tim desain aktif',
      'Buat akun Behance atau Instagram khusus portfolio SEBELUM PKL — tunjukkan ke perusahaan',
      'Minta brief nyata dan kerjakan — jangan hanya jadi penonton',
      'Pelajari workflow desainer profesional: brief → research → moodboard → sketch → digital → present',
      'Simpan semua file project PKL (minta izin) — ini materi portofolio terbaik',
      'Perhatikan bagaimana desainer senior berdiskusi dengan klien',
      'Coba tawarkan diri untuk mengerjakan konten media sosial perusahaan tempat PKL',
    ],
    commonMisconceptions: [
      {
        myth: 'DKV hanya cocok untuk yang bisa gambar tangan',
        fact: 'Desain digital lebih butuh penguasaan software dan konsep visual. Kemampuan gambar tangan membantu tapi bukan syarat utama. Yang lebih penting adalah sense estetika dan kemampuan berkomunikasi visual.',
      },
      {
        myth: 'Lulusan DKV hanya bisa jadi desainer grafis',
        fact: 'DKV membuka jalur ke UI/UX designer (gaji tinggi), motion designer, creative director, fotografer komersial, videografer, content creator, hingga art director di periklanan.',
      },
      {
        myth: 'Kreativitas itu bakat, tidak bisa dipelajari',
        fact: 'Kreativitas adalah skill yang bisa dilatih. Dengan rajin mengamati desain bagus, analisis karya profesional, dan banyak berlatih, kreativitas berkembang.',
      },
    ],
    commonStudentQuestions: [
      {
        q: 'Laptop/PC seperti apa yang dibutuhkan untuk DKV?',
        a: 'Minimal RAM 16GB, processor Intel i7/AMD Ryzen 7, dan GPU dedicated (NVIDIA GTX/RTX). Untuk editing video butuh storage SSD minimal 512GB. Budget: Rp 8.000.000 – 15.000.000. Alternatif: iPad dengan Apple Pencil untuk ilustrasi digital.',
      },
      {
        q: 'Apakah bisa freelance dari kelas XI?',
        a: 'Sangat bisa! Mulai dengan tawarkan jasa desain logo, konten IG, atau poster ke UMKM sekitar. Harga jasa boleh lebih murah dulu untuk membangun portofolio. Platform: Fastwork, Sribulancer, atau langsung approach via Instagram.',
      },
      {
        q: 'Bedanya desainer grafis dan UI/UX designer apa?',
        a: 'Desainer grafis membuat visual untuk media cetak/digital (logo, poster, brosur). UI/UX designer fokus pada tampilan dan pengalaman pengguna aplikasi/website. Gaji UI/UX umumnya lebih tinggi dan sangat dicari industri tech. Tapi keduanya butuh fondasi desain yang kuat.',
      },
    ],
    localCompanies: [
      'Percetakan dan advertising agency di Solo',
      'Media cetak dan digital Solopos Group',
      'Studio foto dan videografi Solo',
      'Agensi kreatif di Surakarta',
      'UMKM Solo yang butuh konten media sosial',
    ],
    nationalPlatforms: [
      'Behance.net — portofolio desainer profesional',
      'Dribbble.com — inspirasi dan portofolio UI/UX',
      'Domestika.org — kursus desain berkualitas',
      'MySkill.id — UI/UX gratis',
      'Fastwork.id — freelance desain',
      'Canva Design School — gratis',
    ],
    industryDemand: {
      level: 'sangat tinggi',
      trend: 'Era konten digital mendorong demand desainer terus naik. Semua brand butuh visual identity dan konten yang konsisten.',
      hotRoles: ['UI/UX Designer', 'Motion Designer', 'Content Creator', 'Brand Designer', 'Social Media Creative'],
    },
    freelanceOpportunity: {
      possible: true,
      description: 'DKV adalah jurusan dengan peluang freelance paling luas. Hampir semua bisnis butuh desainer.',
      platforms: ['Fastwork.id', 'Sribulancer.com', 'Fiverr.com', 'Instagram (personal branding)', 'Behance (portofolio)'],
      estimatedIncome: 'Rp 200.000 – 3.000.000 per project (pemula). Desainer berpengalaman: Rp 5.000.000 – 20.000.000 per project branding.',
    },
    entrepreneurshipPath: 'Bisa buka creative agency, jasa branding UMKM, studio foto/video, atau jual preset/template desain. Banyak desainer DKV SMK sukses jadi freelancer penuh waktu.',
  },

  // ──────────────────────────────────────────────────────────
  // AKL — Akuntansi dan Keuangan Lembaga
  // ──────────────────────────────────────────────────────────
  akl: {
    id: 'akl',
    name: 'AKL',
    fullName: 'Akuntansi dan Keuangan Lembaga',
    emoji: '📊',
    description: 'Jurusan yang mempelajari pencatatan, pengelolaan, dan pelaporan keuangan perusahaan atau lembaga. Kamu akan jago angka, laporan keuangan, perpajakan, dan menggunakan software akuntansi.',
    coreSubjects: [
      'Akuntansi Dasar',
      'Akuntansi Perusahaan Jasa & Dagang',
      'Akuntansi Perbankan',
      'Perpajakan',
      'Spreadsheet (Excel Lanjutan)',
      'Software Akuntansi (Accurate, Zahir, MYOB)',
      'Manajemen Keuangan Dasar',
    ],
    hardSkills: [
      'Pencatatan jurnal dan buku besar',
      'Penyusunan laporan keuangan (Neraca, L/R, Cash Flow)',
      'Perhitungan dan pelaporan pajak (PPh, PPN)',
      'Software akuntansi: Accurate Online, Zahir, MYOB',
      'Microsoft Excel lanjutan (pivot table, VLOOKUP, formula)',
      'Rekonsiliasi bank',
      'Payroll (penggajian)',
    ],
    softSkills: [
      'Ketelitian dan kehati-hatian',
      'Integritas tinggi (memegang data keuangan)',
      'Kemampuan analisis',
      'Komunikasi dengan manajemen',
      'Manajemen tenggat waktu (laporan bulanan/tahunan)',
    ],
    tools: [
      'Accurate Online',
      'Zahir Accounting',
      'Microsoft Excel / Google Sheets',
      'SAP (level dasar di perusahaan besar)',
      'e-Faktur & e-SPT (perpajakan)',
    ],
    careerTracks: [
      {
        name: 'Akuntansi & Keuangan',
        entryLevel: [
          { role: 'Staff Akuntansi', salary: 'Rp 2.500.000 – 4.000.000' },
          { role: 'Admin Keuangan', salary: 'Rp 2.500.000 – 3.800.000' },
          { role: 'Kasir / Teller', salary: 'Rp 2.500.000 – 3.500.000' },
          { role: 'Staff Pajak', salary: 'Rp 3.000.000 – 4.500.000' },
        ],
        midLevel: [
          { role: 'Akuntan', salary: 'Rp 5.000.000 – 12.000.000', yearsExp: '2–4 tahun' },
          { role: 'Finance Analyst', salary: 'Rp 6.000.000 – 15.000.000', yearsExp: '3–5 tahun' },
          { role: 'Tax Consultant', salary: 'Rp 7.000.000 – 18.000.000', yearsExp: '3–5 tahun' },
          { role: 'Internal Auditor', salary: 'Rp 6.000.000 – 14.000.000', yearsExp: '3–5 tahun' },
        ],
        seniorLevel: [
          { role: 'Chief Accountant', salary: 'Rp 15.000.000 – 30.000.000', yearsExp: '7+ tahun' },
          { role: 'Finance Manager', salary: 'Rp 20.000.000 – 40.000.000', yearsExp: '8+ tahun' },
          { role: 'CFO', salary: 'Rp 40.000.000 – 100.000.000+', yearsExp: '15+ tahun' },
        ],
        requiredSkills: ['Laporan keuangan', 'Perpajakan', 'Accurate/SAP', 'Excel lanjutan'],
      },
      {
        name: 'Perbankan & Lembaga Keuangan',
        entryLevel: [
          { role: 'Teller Bank', salary: 'Rp 3.000.000 – 4.500.000' },
          { role: 'Customer Service Bank', salary: 'Rp 3.000.000 – 4.500.000' },
          { role: 'Staff Administrasi Kredit', salary: 'Rp 2.800.000 – 4.000.000' },
        ],
        midLevel: [
          { role: 'Account Officer', salary: 'Rp 5.000.000 – 12.000.000', yearsExp: '2–4 tahun' },
          { role: 'Credit Analyst', salary: 'Rp 6.000.000 – 14.000.000', yearsExp: '3–5 tahun' },
        ],
        seniorLevel: [
          { role: 'Branch Manager', salary: 'Rp 20.000.000 – 45.000.000', yearsExp: '10+ tahun' },
        ],
        requiredSkills: ['Analisis kredit', 'Produk perbankan', 'Komunikasi', 'Compliance'],
      },
    ],
    salaryData: {
      freshGraduate: 'Rp 2.500.000 – 4.000.000/bulan (BUMN dan bank umumnya lebih tinggi)',
      oneToThreeYears: 'Rp 5.000.000 – 10.000.000/bulan',
      fiveYearsPlus: 'Rp 12.000.000 – 25.000.000/bulan',
      topEarner: 'Rp 40.000.000+/bulan (Finance Manager/CFO perusahaan besar)',
      notes: 'AKL adalah jurusan dengan permintaan kerja yang stabil karena SEMUA perusahaan butuh akuntansi. Jalur ke BUMN sangat terbuka.',
    },
    certifications: [
      { name: 'Brevet Pajak A & B', provider: 'IAI / Lembaga Perpajakan', cost: 'Rp 1.500.000 – 3.000.000', difficulty: 'sedang', value: 'tinggi', link: 'https://iaiglobal.or.id' },
      { name: 'Certified Accounting Technician (CAT)', provider: 'IAI', cost: 'Rp 500.000 – 1.500.000', difficulty: 'sedang', value: 'tinggi' },
      { name: 'Accurate Online Certified User', provider: 'Accurate', cost: 'Rp 300.000 – 600.000', difficulty: 'mudah', value: 'tinggi', link: 'https://accurate.id' },
      { name: 'Excel Specialist (MOS)', provider: 'Microsoft/Certiport', cost: 'Rp 400.000 – 600.000', difficulty: 'mudah', value: 'sedang' },
    ],
    higherEducation: [
      {
        type: 'D3',
        major: 'Akuntansi / Keuangan',
        institutions: ['PKN STAN Jakarta (gratis, ikatan dinas)', 'Politeknik Keuangan Negara', 'UNDIP', 'UNS'],
        entryPath: ['USMPKN STAN (tes khusus, sangat kompetitif)', 'SNBT Politeknik', 'Jalur Mandiri'],
        notes: 'PKN STAN adalah impian banyak lulusan AKL — gratis, langsung jadi CPNS. Tapi seleksinya sangat ketat. Persiapkan dari kelas X.',
      },
      {
        type: 'S1',
        major: 'Akuntansi / Manajemen Keuangan',
        institutions: ['UNS Surakarta', 'UGM', 'UNDIP', 'UNY', 'UMS Solo'],
        entryPath: ['SNBP (nilai rapor)', 'SNBT', 'Jalur Mandiri'],
        notes: 'Lulusan AKL sangat diterima di jurusan Akuntansi PTN. Nilai mapel produktif akuntansi yang tinggi jadi nilai tambah di SNBP.',
      },
    ],
    pklTips: [
      'Prioritaskan PKL di Kantor Akuntan Publik (KAP), perusahaan manufaktur, atau perbankan',
      'Minta akses ke software akuntansi nyata (Accurate, SAP) — ini skill yang langsung dicari',
      'Pelajari e-Faktur dan e-SPT sebelum PKL — perpajakan digital wajib dikuasai',
      'Dokumentasikan alur kerja akuntansi yang kamu pelajari untuk bahan skripsi',
      'Jangan malu mengerjakan tugas-tugas kecil seperti input data — akurasi itu dilatih dari sini',
      'Perhatikan bagaimana laporan keuangan disusun di perusahaan nyata',
      'Coba minta tugas yang lebih kompleks jika sudah selesai tugas utama',
    ],
    commonMisconceptions: [
      {
        myth: 'AKL hanya cocok untuk yang suka matematika',
        fact: 'Akuntansi lebih butuh ketelitian dan logika sistematis daripada matematika tinggi. Hitungannya dasar — penjumlahan, pengurangan, persentase. Yang sulit adalah memahami alur dan aturan.',
      },
      {
        myth: 'Lulusan AKL hanya bisa kerja di kantor akuntan',
        fact: 'Semua perusahaan di semua industri butuh staff akuntansi dan keuangan. Dari manufaktur, retail, perbankan, rumah sakit, pemerintahan, hingga startup — semua butuh AKL.',
      },
      {
        myth: 'Harus S1 Akuntansi dulu untuk bisa kerja bidang keuangan',
        fact: 'Banyak posisi entry-level akuntansi dan keuangan tidak mensyaratkan S1. Sertifikasi seperti Brevet Pajak dan penguasaan software akuntansi lebih menentukan dari ijazah.',
      },
    ],
    commonStudentQuestions: [
      {
        q: 'Perlu tidak ambil brevet pajak setelah lulus?',
        a: 'Sangat disarankan kalau mau serius di bidang perpajakan atau akuntansi. Brevet Pajak A & B adalah sertifikasi standar industri yang membedakan kamu dari kandidat lain. Bisa diambil setelah lulus, biaya sekitar Rp 1.500.000–3.000.000.',
      },
      {
        q: 'Apakah bisa daftar PKN STAN dari SMK AKL?',
        a: 'Bisa! PKN STAN menerima lulusan SMA/SMK/MA semua jurusan. Persyaratan: nilai UN/rapor rata-rata minimal tertentu, umur maksimal 21 tahun saat mendaftar. Seleksinya sangat ketat — persiapkan dari jauh-jauh hari dengan latihan soal SKD.',
      },
      {
        q: 'Software akuntansi mana yang paling penting dikuasai?',
        a: 'Untuk perusahaan kecil-menengah: Accurate Online atau Zahir. Untuk perusahaan besar/multinasional: SAP. Untuk startup: biasanya pakai spreadsheet atau Xero. Kuasai Accurate dan Excel lanjutan dulu — ini yang paling banyak dipakai di lapangan.',
      },
    ],
    localCompanies: [
      'Bank-bank pemerintah cabang Solo (BRI, BNI, Mandiri, BTN)',
      'Bank swasta cabang Solo (BCA, CIMB Niaga)',
      'Kantor Akuntan Publik (KAP) di Surakarta',
      'PT Sritex dan perusahaan manufaktur Surakarta',
      'Koperasi dan UMKM yang butuh pembukuan',
      'Kantor Pajak (PKL bisa di sini)',
    ],
    nationalPlatforms: [
      'MySkill.id — akuntansi dan keuangan gratis',
      'IAI.or.id — info sertifikasi dan brevet',
      'Accurate.id — learning Accurate Online',
      'Glints.com — loker keuangan & akuntansi',
      'Info BUMN — lowongan BUMN',
    ],
    industryDemand: {
      level: 'tinggi',
      trend: 'Stabil dan konsisten. Digitalisasi mendorong demand untuk akuntan yang bisa pakai software, bukan hanya manual.',
      hotRoles: ['Staff Akuntansi', 'Tax Consultant', 'Finance Analyst', 'Teller Bank', 'Internal Auditor'],
    },
    freelanceOpportunity: {
      possible: true,
      description: 'Banyak UMKM butuh jasa pembukuan dan pelaporan pajak freelance. Terutama saat lapor SPT tahunan.',
      platforms: ['Fastwork.id', 'Referral dari jaringan pribadi', 'Koperasi dan komunitas UMKM'],
      estimatedIncome: 'Rp 300.000 – 2.000.000 per klien per bulan untuk jasa pembukuan rutin',
    },
    entrepreneurshipPath: 'Bisa buka jasa konsultasi pajak, pembukuan UMKM, atau mendirikan firma akuntansi kecil setelah punya pengalaman dan sertifikasi.',
  },

  // ──────────────────────────────────────────────────────────
  // MPLB — Manajemen Perkantoran dan Layanan Bisnis
  // ──────────────────────────────────────────────────────────
  mplb: {
    id: 'mplb',
    name: 'MPLB',
    fullName: 'Manajemen Perkantoran dan Layanan Bisnis',
    emoji: '🗂️',
    description: 'Jurusan yang mempelajari pengelolaan operasional kantor, administrasi bisnis, korespondensi, dan layanan pelanggan. Lulusan MPLB adalah tulang punggung operasional setiap perusahaan.',
    coreSubjects: [
      'Otomatisasi Tata Kelola Humas dan Keprotokolan',
      'Korespondensi Bisnis (Indonesia & Inggris)',
      'Manajemen Dokumen dan Arsip',
      'Pengelolaan Pertemuan/Rapat',
      'Layanan Pelanggan (Customer Service)',
      'Microsoft Office Suite (Word, Excel, PowerPoint)',
      'Komunikasi Bisnis',
    ],
    hardSkills: [
      'Microsoft Office Suite (Word, Excel, PowerPoint, Outlook)',
      'Manajemen arsip digital dan fisik',
      'Korespondensi bisnis (surat resmi, email profesional)',
      'Pengelolaan jadwal dan agenda pimpinan',
      'Notulensi rapat',
      'Pengoperasian peralatan kantor',
      'Database pelanggan sederhana',
    ],
    softSkills: [
      'Komunikasi verbal dan tertulis yang profesional',
      'Kemampuan multitasking',
      'Proaktif dan inisiatif',
      'Penampilan dan attitude profesional',
      'Kerahasiaan informasi perusahaan',
      'Manajemen stres dan tekanan kerja',
    ],
    tools: [
      'Microsoft Office 365 (Word, Excel, PowerPoint, Outlook, Teams)',
      'Google Workspace (Docs, Sheets, Drive)',
      'Zoom/Google Meet (rapat virtual)',
      'Trello / Notion (manajemen tugas)',
      'Aplikasi HR/administrasi perusahaan',
    ],
    careerTracks: [
      {
        name: 'Administrasi & Perkantoran',
        entryLevel: [
          { role: 'Staff Administrasi', salary: 'Rp 2.200.000 – 3.500.000' },
          { role: 'Resepsionis', salary: 'Rp 2.200.000 – 3.000.000' },
          { role: 'Operator/Data Entry', salary: 'Rp 2.000.000 – 3.000.000' },
        ],
        midLevel: [
          { role: 'Sekretaris Eksekutif', salary: 'Rp 5.000.000 – 12.000.000', yearsExp: '3–5 tahun' },
          { role: 'Office Manager', salary: 'Rp 6.000.000 – 14.000.000', yearsExp: '4–6 tahun' },
          { role: 'Personal Assistant (PA)', salary: 'Rp 5.000.000 – 15.000.000', yearsExp: '3–5 tahun' },
        ],
        seniorLevel: [
          { role: 'Senior Executive Secretary', salary: 'Rp 15.000.000 – 30.000.000', yearsExp: '8+ tahun' },
          { role: 'Operations Manager', salary: 'Rp 18.000.000 – 35.000.000', yearsExp: '10+ tahun' },
        ],
        requiredSkills: ['Microsoft Office mahir', 'Korespondensi bisnis', 'Manajemen jadwal', 'Bahasa Inggris'],
      },
      {
        name: 'Human Resources & General Affairs',
        entryLevel: [
          { role: 'HR Admin', salary: 'Rp 2.500.000 – 4.000.000' },
          { role: 'Staf GA (General Affairs)', salary: 'Rp 2.500.000 – 3.800.000' },
          { role: 'Recruitment Admin', salary: 'Rp 2.800.000 – 4.200.000' },
        ],
        midLevel: [
          { role: 'HR Generalist', salary: 'Rp 5.000.000 – 12.000.000', yearsExp: '3–5 tahun' },
          { role: 'Payroll Officer', salary: 'Rp 5.000.000 – 10.000.000', yearsExp: '2–4 tahun' },
        ],
        seniorLevel: [
          { role: 'HR Manager', salary: 'Rp 15.000.000 – 35.000.000', yearsExp: '8+ tahun' },
        ],
        requiredSkills: ['Hukum ketenagakerjaan dasar', 'Payroll', 'Rekrutmen', 'People management'],
      },
    ],
    salaryData: {
      freshGraduate: 'Rp 2.200.000 – 3.500.000/bulan',
      oneToThreeYears: 'Rp 4.000.000 – 8.000.000/bulan',
      fiveYearsPlus: 'Rp 10.000.000 – 20.000.000/bulan (sekretaris eksekutif perusahaan besar)',
      topEarner: 'Rp 25.000.000+/bulan (PA Direktur perusahaan multinasional)',
      notes: 'Kemampuan bahasa Inggris yang baik dan skill Microsoft Office mahir bisa melipatgandakan nilai gaji. Sekretaris direktur perusahaan besar sangat bergaji tinggi.',
    },
    certifications: [
      { name: 'MOS (Microsoft Office Specialist)', provider: 'Microsoft/Certiport', cost: 'Rp 400.000 – 700.000 per modul', difficulty: 'mudah', value: 'tinggi', link: 'https://certiport.com' },
      { name: 'Certified Administrative Professional (CAP)', provider: 'IAAP', cost: 'Rp 1.500.000 – 3.000.000', difficulty: 'sedang', value: 'tinggi' },
      { name: 'TOEIC / TOEFL (bahasa Inggris)', provider: 'ETS', cost: 'Rp 600.000 – 1.500.000', difficulty: 'sedang', value: 'tinggi' },
    ],
    higherEducation: [
      {
        type: 'D3',
        major: 'Administrasi Bisnis / Sekretari',
        institutions: ['Politeknik Negeri Semarang', 'Politeknik UBAYA Surabaya', 'Politeknik LP3I'],
        entryPath: ['SNBT Politeknik', 'Jalur Mandiri'],
        notes: 'D3 Sekretari masih relevan and langsung mengarah ke industri.',
      },
      {
        type: 'S1',
        major: 'Administrasi Bisnis / Manajemen / Ilmu Komunikasi',
        institutions: ['UNS Surakarta', 'UNY', 'UNDIP', 'Universitas Sebelas Maret', 'UMS Solo'],
        entryPath: ['SNBP', 'SNBT', 'Jalur Mandiri'],
        notes: 'Lulusan MPLB bisa melanjutkan ke berbagai jurusan bisnis dan komunikasi. Nilai rapor yang baik di mapel produktif jadi nilai tambah.',
      },
    ],
    pklTips: [
      'Pilih perusahaan dengan departemen administrasi atau HRD yang aktif',
      'Perhatikan cara menulis email profesional dan surat resmi dari mentor',
      'Minta kesempatan untuk notulensi rapat — ini skill langka yang sangat dihargai',
      'Pelajari cara menggunakan sistem filing (digital dan fisik) perusahaan',
      'Attitude dan penampilan sangat dinilai di bidang perkantoran — jaga profesionalisme',
      'Catat semua prosedur kerja yang dipelajari — ini berguna untuk wawancara kerja',
    ],
    commonMisconceptions: [
      {
        myth: 'MPLB hanya cocok untuk perempuan',
        fact: 'Profesi administrasi, office manager, dan HRD terbuka untuk semua gender. Banyak pria sukses di bidang ini, terutama di posisi Operations Manager dan HR Manager.',
      },
      {
        myth: 'Lulusan MPLB hanya bisa jadi sekretaris',
        fact: 'MPLB membuka jalur ke HRD, General Affairs, Customer Service Manager, Operations Manager, bahkan wirausaha.',
      },
      {
        myth: 'Gaji MPLB selalu kecil',
        fact: 'Sekretaris eksekutif direktur perusahaan besar bisa bergaji Rp 15.000.000–30.000.000/bulan. Kunci: bahasa Inggris mahir, skill Office sangat baik, dan attitude profesional.',
      },
    ],
    commonStudentQuestions: [
      {
        q: 'Apakah perlu bisa bahasa Inggris untuk kerja di bidang MPLB?',
        a: 'Untuk perusahaan lokal kecil, Inggris dasar cukup. Tapi untuk perusahaan multinasional atau perusahaan besar, bahasa Inggris lisan dan tulisan yang baik adalah nilai jual utama dan bisa melipatgandakan gaji.',
      },
      {
        q: 'Bedanya sekretaris dan personal assistant (PA) apa?',
        a: 'Sekretaris biasanya mengelola administrasi departemen atau beberapa pimpinan. PA (Personal Assistant) adalah asisten khusus satu orang (biasanya direktur), mengelola jadwal pribadi, perjalanan dinas, dan urusan yang lebih personal. Gaji PA umumnya lebih tinggi.',
      },
    ],
    localCompanies: [
      'Kantor pemerintah dan BUMN di Surakarta',
      'Bank-bank di Solo (administrasi dan CS)',
      'Rumah Sakit (administrasi)',
      'Hotel dan hospitality Solo',
      'Perusahaan manufaktur di Surakarta (HR/GA)',
    ],
    nationalPlatforms: [
      'MySkill.id — administrasi dan komunikasi bisnis',
      'Microsoft Learn — sertifikasi Office gratis',
      'Glints.com — loker admin dan HR',
      'LinkedIn — networking profesional perkantoran',
    ],
    industryDemand: {
      level: 'tinggi',
      trend: 'Stabil. Setiap perusahaan butuh staff administrasi. Yang membedakan adalah skill digital dan bahasa Inggris.',
      hotRoles: ['HR Admin', 'Personal Assistant', 'Office Manager', 'Customer Service', 'General Affairs'],
    },
    freelanceOpportunity: {
      possible: true,
      description: 'Virtual assistant (VA) adalah tren baru — kerja remote mengelola administrasi, email, jadwal, dan media sosial pemilik bisnis.',
      platforms: ['Fastwork.id', 'OnlineJobs.ph', 'Upwork.com (untuk klien internasional)', 'Facebook Group VA Indonesia'],
      estimatedIncome: 'Rp 1.500.000 – 5.000.000/bulan sebagai VA part-time',
    },
    entrepreneurshipPath: 'Bisa buka jasa virtual assistant, outsourcing administrasi untuk UMKM, atau event organizer.',
  },

  // ──────────────────────────────────────────────────────────
  // PEMASARAN
  // ──────────────────────────────────────────────────────────
  pemasaran: {
    id: 'pemasaran',
    name: 'Pemasaran',
    fullName: 'Bisnis Daring dan Pemasaran / Pemasaran',
    emoji: '📣',
    description: 'Jurusan yang mempelajari strategi menjual produk dan jasa, baik secara langsung maupun digital. Di era sekarang, jurusan ini sangat relevan dengan digital marketing, e-commerce, dan media sosial.',
    coreSubjects: [
      'Pemasaran Online (Digital Marketing)',
      'Perdagangan Elektronik (E-Commerce)',
      'Pemasaran Konvensional (Salesmanship)',
      'Riset Pasar',
      'Manajemen Produk',
      'Strategi Harga dan Distribusi',
      'Komunikasi Bisnis',
    ],
    hardSkills: [
      'Digital Marketing: SEO, SEM, Social Media Marketing',
      'META Ads (Facebook & Instagram Ads)',
      'Google Ads (Search, Display, Shopping)',
      'Content Marketing & Copywriting',
      'E-Commerce: Shopee, Tokopedia, TikTok Shop',
      'Email Marketing',
      'Google Analytics & Meta Business Suite',
      'Riset pasar & analisis kompetitor',
    ],
    softSkills: [
      'Kemampuan komunikasi persuasif',
      'Kreativitas dalam storytelling',
      'Kepercayaan diri (terutama untuk sales)',
      'Kemampuan negosiasi',
      'Adaptasi tren pasar yang cepat',
      'Orientasi target dan hasil',
    ],
    tools: [
      'META Business Suite (kelola FB & IG Ads)',
      'Google Ads & Google Analytics',
      'Canva (buat konten cepat)',
      'CapCut (konten video)',
      'Mailchimp (email marketing)',
      'Shopee/Tokopedia Seller Center',
      'TikTok for Business',
    ],
    careerTracks: [
      {
        name: 'Digital Marketing',
        entryLevel: [
          { role: 'Social Media Specialist', salary: 'Rp 2.500.000 – 4.500.000' },
          { role: 'Content Creator', salary: 'Rp 2.500.000 – 5.000.000' },
          { role: 'Digital Marketing Staff', salary: 'Rp 3.000.000 – 5.000.000' },
        ],
        midLevel: [
          { role: 'Digital Marketing Specialist', salary: 'Rp 6.000.000 – 15.000.000', yearsExp: '2–4 tahun' },
          { role: 'SEO/SEM Specialist', salary: 'Rp 6.000.000 – 14.000.000', yearsExp: '2–4 tahun' },
          { role: 'Brand Manager', salary: 'Rp 8.000.000 – 20.000.000', yearsExp: '4–6 tahun' },
        ],
        seniorLevel: [
          { role: 'Digital Marketing Manager', salary: 'Rp 15.000.000 – 35.000.000', yearsExp: '6+ tahun' },
          { role: 'CMO', salary: 'Rp 30.000.000 – 80.000.000+', yearsExp: '10+ tahun' },
        ],
        requiredSkills: ['META Ads', 'Google Ads', 'Analytics', 'Content strategy', 'Copywriting'],
      },
      {
        name: 'Sales & Business Development',
        entryLevel: [
          { role: 'Sales Representative', salary: 'Rp 2.500.000 – 4.000.000 + komisi' },
          { role: 'Sales Promoter (SPG/SPB)', salary: 'Rp 2.500.000 – 4.000.000 + komisi' },
          { role: 'Account Executive Junior', salary: 'Rp 3.000.000 – 5.000.000 + komisi' },
        ],
        midLevel: [
          { role: 'Senior Sales Executive', salary: 'Rp 6.000.000 – 15.000.000 + komisi', yearsExp: '2–4 tahun' },
          { role: 'Area Sales Manager', salary: 'Rp 8.000.000 – 20.000.000', yearsExp: '4–6 tahun' },
        ],
        seniorLevel: [
          { role: 'Sales Director', salary: 'Rp 25.000.000 – 60.000.000+', yearsExp: '10+ tahun' },
        ],
        requiredSkills: ['Teknik penjualan', 'Negosiasi', 'CRM', 'Presentasi produk'],
      },
    ],
    salaryData: {
      freshGraduate: 'Rp 2.500.000 – 4.000.000/bulan + komisi (total bisa jauh lebih tinggi)',
      oneToThreeYears: 'Rp 5.000.000 – 12.000.000/bulan',
      fiveYearsPlus: 'Rp 12.000.000 – 30.000.000/bulan',
      topEarner: 'Rp 50.000.000+/bulan (Digital Marketing Manager perusahaan besar, atau sales dengan komisi tinggi)',
      notes: 'Pemasaran adalah salah satu bidang dengan potensi penghasilan tidak terbatas karena adanya sistem komisi. Digital marketing sangat dicari di era e-commerce.',
    },
    certifications: [
      { name: 'Meta Marketing Professional Certificate', provider: 'Meta via Coursera', cost: 'Rp 200.000/bulan', difficulty: 'mudah', value: 'tinggi', link: 'https://coursera.org' },
      { name: 'Google Digital Marketing Certificate', provider: 'Google Skillshop', cost: 'Gratis', difficulty: 'mudah', value: 'tinggi', link: 'https://skillshop.google.com' },
      { name: 'Google Ads Certification', provider: 'Google Skillshop', cost: 'Gratis', difficulty: 'sedang', value: 'tinggi', link: 'https://skillshop.google.com' },
      { name: 'HubSpot Marketing Certificate', provider: 'HubSpot Academy', cost: 'Gratis', difficulty: 'mudah', value: 'tinggi', link: 'https://academy.hubspot.com' },
    ],
    higherEducation: [
      {
        type: 'S1',
        major: 'Manajemen Pemasaran / Bisnis Digital / Komunikasi',
        institutions: ['UNS Surakarta', 'UGM', 'UNDIP', 'UNY', 'Universitas Atma Jaya', 'UMS Solo'],
        entryPath: ['SNBP', 'SNBT', 'Jalur Mandiri'],
        notes: 'Jurusan bisnis dan komunikasi sangat luas. Lulusan Pemasaran SMK punya nilai lebih karena sudah terbiasa dengan praktik penjualan nyata.',
      },
    ],
    pklTips: [
      'Pilih PKL di perusahaan yang punya tim marketing aktif — bukan hanya toko retail biasa',
      'Minta kesempatan kelola media sosial atau iklan digital perusahaan — ini sangat berharga',
      'Dokumentasikan campaign yang kamu jalankan: konten apa, berapa reach, berapa konversi',
      'Pelajari cara membaca analytics: Facebook Insights, Google Analytics, Tokopedia Seller Insight',
      'Coba ajukan ide campaign kecil ke supervisor PKL — inisiatif sangat dihargai',
      'Perhatikan cara sales senior melakukan presentasi dan closing ke klien',
    ],
    commonMisconceptions: [
      {
        myth: 'Pemasaran hanya untuk yang ekstrovert and suka bergaul',
        fact: 'Digital marketing justru lebih cocok untuk yang analitis dan kreatif. Kamu bisa berkarir sebagai SEO specialist atau data-driven marketer tanpa banyak interaksi langsung.',
      },
      {
        myth: 'Sales itu pekerjaan rendahan',
        fact: 'Sales adalah backbone setiap perusahaan. Sales director perusahaan FMCG besar bisa bergaji puluhan juta. Dan pengalaman sales mengajarkan skill komunikasi dan negosiasi yang tidak ternilai.',
      },
    ],
    commonStudentQuestions: [
      {
        q: 'Bagaimana cara mulai jualan online dari nol?',
        a: 'Mulai dengan platform yang paling familiar: TikTok Shop (potensi viral tinggi) atau Shopee (traffic besar). Pilih produk yang kamu tahu atau yang ada di sekitar kamu. Modal tidak harus besar — bisa mulai dengan sistem reseller atau dropship. Yang penting konsisten buat konten.',
      },
      {
        q: 'Digital marketing dan sales, mana yang lebih baik untuk fresh graduate?',
        a: 'Tergantung kepribadianmu. Sales: penghasilan bisa lebih cepat tinggi (komisi), tapi butuh mental kuat menghadapi penolakan. Digital marketing: lebih terstruktur, skill berkembang ke arah yang jelas, demand terus naik. Keduanya bagus — pilih sesuai minat.',
      },
    ],
    localCompanies: [
      'Perusahaan FMCG dengan area penjualan Solo Raya',
      'E-commerce seller dan reseller besar di Surakarta',
      'Agensi digital marketing Solo',
      'Hotel dan restoran (marketing hospitality)',
      'Toko/brand lokal yang aktif di media sosial',
    ],
    nationalPlatforms: [
      'MySkill.id — digital marketing gratis',
      'Google Skillshop — sertifikasi Google gratis',
      'HubSpot Academy — marketing gratis',
      'TikTok for Business — belajar TikTok Ads',
      'Glints.com — loker marketing',
    ],
    industryDemand: {
      level: 'sangat tinggi',
      trend: 'Ledakan e-commerce dan media sosial membuat digital marketer adalah salah satu profesi paling dicari 2024-2025.',
      hotRoles: ['Digital Marketing Specialist', 'Content Creator', 'Social Media Manager', 'Performance Marketing', 'E-Commerce Specialist'],
    },
    freelanceOpportunity: {
      possible: true,
      description: 'Sangat mudah mulai freelance di bidang ini. Banyak UMKM butuh jasa kelola media sosial dan iklan digital.',
      platforms: ['Fastwork.id', 'Instagram (personal branding)', 'LinkedIn', 'Referral dari klien'],
      estimatedIncome: 'Rp 500.000 – 5.000.000/bulan per klien untuk jasa social media management',
    },
    entrepreneurshipPath: 'Bisa buka digital marketing agency, jual produk sendiri via e-commerce, atau jadi affiliate marketer.',
  },
}

// ============================================================
// CONTEXT BUILDER PER JURUSAN
// Dipanggil untuk inject konteks komprehensif ke system prompt
// ============================================================

export function getMajorContext(majorId: string): string {
  const knowledge = MAJOR_KNOWLEDGE[majorId]
  if (!knowledge) return ''

  return `
## Konteks Jurusan ${knowledge.emoji} ${knowledge.fullName} (${knowledge.name})

**Deskripsi:** ${knowledge.description}

**Skill teknis yang dipelajari:** ${knowledge.hardSkills.slice(0, 5).join(', ')}

**Tools utama:** ${knowledge.tools.slice(0, 4).join(', ')}

**Jalur karir:**
${knowledge.careerTracks.map(t => `- **${t.name}**: Entry → ${t.entryLevel.map(e => e.role).join(' / ')} (${t.entryLevel[0].salary})`).join('\n')}

**Data gaji:**
- Fresh graduate: ${knowledge.salaryData.freshGraduate}
- 1–3 tahun: ${knowledge.salaryData.oneToThreeYears}
- ${knowledge.salaryData.notes}

**Demand industri:** ${knowledge.industryDemand.level.toUpperCase()} — ${knowledge.industryDemand.trend}
Hot roles: ${knowledge.industryDemand.hotRoles.slice(0, 3).join(', ')}

**Sertifikasi yang disarankan:** ${knowledge.certifications.slice(0, 3).map(c => `${c.name} (${c.cost})`).join(', ')}

**Peluang freelance:** ${knowledge.freelanceOpportunity.possible ? `Ada — ${knowledge.freelanceOpportunity.description} | ${knowledge.freelanceOpportunity.estimatedIncome}` : 'Terbatas'}

**Wirausaha:** ${knowledge.entrepreneurshipPath}
`.trim()
}

export function getMajorMisconceptions(majorId: string): string {
  const knowledge = MAJOR_KNOWLEDGE[majorId]
  if (!knowledge) return ''
  return knowledge.commonMisconceptions
    .map(m => `❌ MITOS: "${m.myth}" → ✅ FAKTA: ${m.fact}`)
    .join('\n')
}

export function getMajorPKLTips(majorId: string): string {
  const knowledge = MAJOR_KNOWLEDGE[majorId]
  if (!knowledge) return ''
  return `Tips PKL untuk ${knowledge.name}:\n` +
    knowledge.pklTips.map((t, i) => `${i + 1}. ${t}`).join('\n')
}

export function getMajorQA(majorId: string): string {
  const knowledge = MAJOR_KNOWLEDGE[majorId]
  if (!knowledge) return ''
  return knowledge.commonStudentQuestions
    .map(qa => `Q: ${qa.q}\nA: ${qa.a}`)
    .join('\n\n')
}
