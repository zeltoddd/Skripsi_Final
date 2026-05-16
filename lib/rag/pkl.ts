// ============================================================
// pkl.ts
// PKL (Magang) information and tips per major
// ============================================================

import { MAJOR_KNOWLEDGE } from '@/services/RAG_MAJORS';

/**
 * Get PKL context for a specific major
 * Includes tips, common problems, and what to expect
 */
export function getPKLContext(jurusan: string): string {
  const knowledge = MAJOR_KNOWLEDGE[jurusan.toLowerCase()];
  if (!knowledge || !knowledge.pklTips || knowledge.pklTips.length === 0) {
    return 'PKL adalah kesempatan untuk belajar di lingkungan kerja. Fokus pada: (1) pilih tempat PKL yang relevan dengan jurusan, (2) bangun soft skills, (3) dokumentasi pengalaman, (4) Networks. Cek dengan Guru BK untuk rekomendasi tempat PKL di Surakarta.';
  }

  return `### Tips PKL untuk ${knowledge.name}
${knowledge.pklTips.map((tip, i) => `${i+1}. ${tip}`).join('\n')}

**Perlu diingat:** PKL adalah waktu untuk belajar, bukan harus jadi expert. Tanyakan pada supervisor jika ada tugas yang bisa menambah skill sesuai jurusan.`;
}
