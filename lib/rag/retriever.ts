// ============================================================
// retriever.ts
// Core RAG retrieval engine for VEKORA
// ============================================================

import { getCareerPathContext, getScholarshipContext, getDUDIContext, getCourseContext } from '@/services/RAG_SETUP';
import { getMajorContext } from '@/services/RAG_MAJORS';
import { getConcernsContext } from './concerns';
import { getSchoolContext } from './school';
import { getRoadmapContext } from './roadmap';
import { getIndustryContext } from './industry';
import { getFAQContext } from './faq';
import { getToolsContext } from './tools';
import { getPKLContext } from './pkl';

/**
 * Intent to category mapping
 * Maps user intents to RAG categories for retrieval
 */
export const INTENT_CATEGORY_MAP: Record<string, string[]> = {
  career: ['careers', 'roadmap', 'majors'],
  scholarship: ['scholarships', 'school', 'financial'],
  jobs: ['dudi', 'majors'],
  courses: ['majors', 'courses'],
  pkl: ['pkl', 'dudi'],
  anxiety: ['concerns', 'faq'],
  tools: ['majors', 'tools'],
  trend: ['industry', 'majors'],
  roadmap: ['roadmap', 'careers', 'majors'],
  interview_tips: ['careers', 'faq'],
  cv_help: ['careers', 'majors'],
};

/**
 * Retrieval options
 */
export interface RetrievalOptions {
  jurusan?: string;      // normalized: rpl, dkv, bp, pm, akl, mplb, ulp
  intents: string[];     // from intent detection (smartRouter)
  emotionDetected?: boolean;
  maxTokens?: number;    // token budget (default 800)
}

/**
 * Main retrieval function
 * Returns formatted context string ready for injection into system prompt
 */
export function retrieveContext(opts: RetrievalOptions): string {
  const { jurusan, intents, emotionDetected = false, maxTokens = 800 } = opts;

  // 1. Determine target categories from intents
  const targetCategories = new Set<string>();
  intents.forEach(intent => {
    INTENT_CATEGORY_MAP[intent]?.forEach(cat => targetCategories.add(cat));
  });

  // 2. If emotion detected, always add concerns
  if (emotionDetected) {
    targetCategories.add('concerns');
  }

  // 3. Always include school context (differentiates SMKN 6)
  targetCategories.add('school');

  // 4. For any intent, if no specific categories matched, include majors as fallback
  if (targetCategories.size === 0) {
    targetCategories.add('majors');
  }

  // 5. Fetch context blocks for each category
  const contextBlocks: { category: string; content: string }[] = [];

  for (const category of targetCategories) {
    let content = '';
    
    switch (category) {
      case 'scholarships':
      case 'financial':
        content = getScholarshipContext(jurusan);
        break;
      case 'dudi':
        content = getDUDIContext(jurusan);
        break;
      case 'careers':
        content = getCareerPathContext(jurusan);
        break;
      case 'courses':
        content = getCourseContext(jurusan);
        break;
      case 'majors':
        content = getMajorContext(jurusan);
        break;
      case 'concerns':
        content = getConcernsContext(jurusan);
        break;
      case 'school':
        content = getSchoolContext();
        break;
      case 'roadmap':
        content = getRoadmapContext(jurusan);
        break;
      case 'industry':
        content = getIndustryContext();
        break;
      case 'faq':
        content = getFAQContext(jurusan);
        break;
       case 'tools':
         content = getToolsContext(jurusan);
         break;
       case 'pkl':
         content = getPKLContext(jurusan);
         break;
     }

    if (content && content.trim().length > 0) {
      contextBlocks.push({ category, content });
    }
  }

  // 6. If no blocks found, return empty string
  if (contextBlocks.length === 0) {
    return '';
  }

  // 7. Format context with category labels
  return formatContextBlocks(contextBlocks, jurusan);
}

/**
 * Format context blocks into a single string with headers
 */
function formatContextBlocks(blocks: { category: string; content: string }[], jurusan?: string): string {
  // Optionally apply token budget limiting (very coarse estimation)
  // For now, we return all blocks; can be enhanced later with token counting
  
  const header = jurusan
    ? `DATA REFERENSI — Konteks VEKORA untuk jurusan ${jurusan.toUpperCase()} di SMKN 6 Surakarta\nGunakan sebagai acuan utama. Jangan tambahkan data di luar ini.\n\n`
    : `DATA REFERENSI — Konteks VEKORA untuk SMKN 6 Surakarta\n\n`;

  const sections = blocks.map(block => {
    const label = CATEGORY_LABELS[block.category] || block.category.toUpperCase();
    return `## ${label}\n${block.content}`;
  });

  return header + sections.join('\n\n---\n\n');
}

const CATEGORY_LABELS: Record<string, string> = {
  school: 'Profil & Identitas SMKN 6 Surakarta',
  majors: 'Pengetahuan Jurusan',
  careers: 'Jalur Karir & Gaji',
  concerns: 'Kekhawatiran Umum Siswa',
  pkl: 'Informasi PKL',
  roadmap: 'Roadmap Belajar',
  financial: 'Beasiswa & Bantuan Keuangan',
  scholarships: 'Beasiswa & Bantuan Keuangan',
  industry: 'Tren Industri',
  faq: 'FAQ',
  dudi: 'Tempat PKL & Mitra Industri',
  courses: 'Rekomendasi Kursus & Sertifikasi',
  tools: 'Rekomendasi Tools & Software',
};
