// ============================================================
// faq.ts
// Frequently Asked Questions (general and per major)
// ============================================================

/**
 * FAQ context per major (general + some major-specific)
 */
const FAQ_DATA: Record<string, Array<{ q: string; a: string }>> = {
  general: [
    {
      q: 'SMK vs SMA mana lebih baik?',
      a: 'Tergantung goal. SMK untuk karier teknis langsung, SMA untuk jalur akademik. Lulusan SMK bisa kerja langsung atau lanjut kuliah.'
    },
    {
      q: 'Lulus SMK bisa kuliah gak?',
      a: 'Bisa, melalui SNBP, SNBT, atau jalur mandiri. Banyak PTN yang menerima lulusan SMK.'
    },
    {
      q: 'AI bakal ganti kerjaan aku?',
      a: 'AI menggantikan task, bukan role. Role yang evolve dengan AI akan survive. Yang penting adalahskill yang mampu mengarahkan AI.'
    },
    {
      q: 'Gaji lulusan SMK berapa?',
      a: 'Entry level umumnya Rp 2-4 juta, tergantung jurusan dan lokasi. Skill tinggi seperti programming dan design bisa lebih tinggi.'
    },
    {
      q: 'PKL itu wajib?',
      a: 'Wajib sesuai kurikulum, biasanya 3-6 bulan. PKL memberi pengalaman kerja nyata yang penting untuk CV dan wawancara.'
    },
  ],
  rpl: [
    {
      q: 'Harus jago matematika buat coding?',
      a: 'Coding lebih butuh logika. Matematika tinggi hanya diperlukan untuk AI/Data Science. Logika dasar dan problem solving lebih penting.'
    },
    {
      q: 'Laptop mahal harus?',
      a: 'Tidak. Laptop RAM 8GB dan SSD sudah cukup. Bisa pakai cloud tools seperti Replit, GitHub Codespaces, atau lab Tefa SMKN 6.'
    },
  ],
  dkv: [
    {
      q: 'DKV masih worth it 2026?',
      a: 'Sangat worth. Era digital membuat semua butuh desainer. UI/UX, motion graphics, dan brand designer sangat dicari.'
    },
    {
      q: 'Adobe mahal, ada alternatif?',
      a: 'Ya: Canva (cloud-based), Figma (UI/UX), GIMP (free Photoshop), Krita (free painting), Photopea (browser-based).'
    },
  ],
  // other majors can fallback to general
};

/**
 * Get FAQ context for a specific major
 */
export function getFAQContext(jurusan: string): string {
  const key = jurusan.toLowerCase();
  const faqs = FAQ_DATA[key] || FAQ_DATA['general'];
  
  return faqs.map(f => `**Q:** ${f.q}\n**A:** ${f.a}`).join('\n\n');
}
