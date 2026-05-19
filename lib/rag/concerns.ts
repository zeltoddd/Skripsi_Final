// ============================================================
// concerns.ts
// Student concerns and emotional support per major
// ============================================================

import { MAJOR_KNOWLEDGE } from '@/services/RAG_MAJORS';

/**
 * Get concerns context for a specific major
 * Includes common misconceptions, student FAQs, and anxiety topics
 */
export function getConcernsContext(jurusan: string): string {
  const knowledge = MAJOR_KNOWLEDGE[jurusan.toLowerCase()];
  if (!knowledge) {
    return `Kamu punya kekhawatiran tentang karir dan masa depan? It's normal. Banyak siswa SMK merasa bingung dan cemas soal yang akan datang. K points to consider: (1) Skill yang kamu pelajari sekarang masih relevan, (2) industri terus berubah, tapi fondasi tetap penting, (3) SMK memberikan keunggulan kompetitif karena sudah punya pengalaman praktis.`;
  }

  const parts: string[] = [];

  // Common misconceptions (myth vs fact)
  if (knowledge.commonMisconceptions && knowledge.commonMisconceptions.length > 0) {
    parts.push('**Mitos umum di jurusan ini:**');
    knowledge.commonMisconceptions.forEach(m => {
      parts.push(`- ❌ ${m.myth}\n  ✅ ${m.fact}`);
    });
    parts.push('');
  }

  // Common student questions (concerns)
  if (knowledge.commonStudentQuestions && knowledge.commonStudentQuestions.length > 0) {
    parts.push('**Pertanyaan umum siswa:**');
    knowledge.commonStudentQuestions.slice(0, 5).forEach(qa => {
      parts.push(`- Q: ${qa.q}\n  A: ${qa.a}`);
    });
    parts.push('');
  }

  // Add generic anxiety validation based on major
  parts.push(`**Kamu tidak sendiri:** Banyak siswa ${knowledge.name} merasa ${getCommonAnxiety(jurusan)}. Itu wajar. Yang penting terus belajar, bangun portofolio, dan mencari bantuan dari guru BK jika perlu.`);

  return parts.join('\n');
}

function getCommonAnxiety(jurusan: string): string {
  const anxieties: Record<string, string> = {
    rpl: 'khawatir AI akan menggantikan programmer',
    dkv: 'khawatir AI akan menggantikan desainer danCreative',
    bp: 'khawatir harus punya kamera mahal dan subscriber banyak',
    pm: 'khawatir harus extrovert dan berinteraksi',
    akl: 'khawatir kerja membosankan dan gaji kecil',
    mplb: 'khawatir pekerjaan akan otomatis digantikan AI',
    ulp: 'khawatir industri pariwisata tidak stabil',
  };
  return anxieties[jurusan.toLowerCase()] || 'cemas tentang masa depan karir';
}
