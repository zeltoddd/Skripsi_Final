// ============================================================
// tools.ts
// Software and tools recommendations per major
// ============================================================

import { MAJOR_KNOWLEDGE } from '@/services/RAG_MAJORS';

/**
 * Get tools context for a specific major
 */
export function getToolsContext(jurusan: string): string {
  const knowledge = MAJOR_KNOWLEDGE[jurusan.toLowerCase()];
  if (!knowledge || !knowledge.tools || knowledge.tools.length === 0) {
    return 'Tools yang diperlukan tergantung spesifikasi karir yang kamu inginkan. Konsultasikan dengan Guru BK atau tutor jurusan untuk rekomendasi software dan perangkat yang sesuai预算.';
  }

  return `**Tools utama untuk ${knowledge.name}:**
${knowledge.tools.slice(0, 8).map((tool, i) => `${i+1}. ${tool}`).join('\n')}

**Tips:** Banyak tools memiliki versi gratis atau trial yang bisa digunakan untuk belajar. Manfaatkan also software yang tersedia di lab Tefa SMKN 6.`;
}
