// ============================================================
// retriever.ts
// Core RAG retrieval engine for VEKORA (OPTIMIZED VERSION 3.0 - MULTI-MODEL EMBEDDINGS)
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

// Static segment imports - loaded with pre-embedded vectors for sub-1ms local similarity computation!
import generalSegment from '@/data/rag/segments/general.embedded.json';
import rplSegment from '@/data/rag/segments/rpl.embedded.json';
import dkvSegment from '@/data/rag/segments/dkv.embedded.json';
import broadcastingSegment from '@/data/rag/segments/broadcasting.embedded.json';
import pemasaranSegment from '@/data/rag/segments/pemasaran.embedded.json';
import aklSegment from '@/data/rag/segments/akl.embedded.json';
import mplbSegment from '@/data/rag/segments/mplb.embedded.json';
import ulpSegment from '@/data/rag/segments/ulp.embedded.json';

const SEGMENTS_MAP: Record<string, any[]> = {
  general: generalSegment,
  rpl: rplSegment,
  dkv: dkvSegment,
  broadcasting: broadcastingSegment,
  pemasaran: pemasaranSegment,
  akl: aklSegment,
  mplb: mplbSegment,
  ulp: ulpSegment,
  pplg: rplSegment // Fallback mapping in case PPLG is passed directly
};

/**
 * Retrieve dataset dynamically by loading ONLY general + specific major segment
 */
function getSegmentedData(jurusan?: string): any[] {
  const target = jurusan ? jurusan.toLowerCase() : 'general';
  
  // Always load general (school profiles, basic FAQ, general RAG)
  const combined = [...generalSegment];
  
  // Segment loader: Only append major-specific JSON if valid
  if (target !== 'general' && SEGMENTS_MAP[target]) {
    combined.push(...SEGMENTS_MAP[target]);
  }
  
  return combined;
}

/**
 * List of highly common Indonesian stopwords to filter out from keyword search terms.
 * This guarantees we score chunks based on actual high-intent vocational keywords.
 */
const INDONESIAN_STOPWORDS = new Set([
  'yang', 'dan', 'untuk', 'dari', 'ada', 'bisa', 'saya', 'kamu', 'akan', 'atau',
  'dengan', 'ini', 'itu', 'pada', 'juga', 'adalah', 'yaitu', 'yakni', 'oleh',
  'ke', 'dia', 'mereka', 'kami', 'kita', 'dalam', 'secara', 'karena', 'tentang',
  'sebagai', 'saja', 'tersebut', 'olehnya', 'hanya', 'ingin', 'tahu', 'mau',
  'bagaimana', 'gimana', 'kenapa', 'mengapa', 'apakah', 'kalau', 'jika', 'adapun'
]);

/**
 * High-value vocational keywords that should carry extra score weight when matched.
 */
const HIGH_VALUE_WEIGHTS: Record<string, number> = {
  // Jurusan & Kompetensi
  rpl: 3.5, pplg: 3.5, dkv: 3.5, akl: 3.5, pm: 3.5, bp: 3.5, ulp: 3.5, mplb: 3.5,
  software: 2.0, koding: 2.0, coding: 2.0, figma: 2.0, photoshop: 2.0,
  
  // Program & Skema
  pkl: 3.0, magang: 3.0, beasiswa: 3.0, kip: 3.5, kbi: 2.5,
  dicoding: 3.0, myskill: 2.5, sertifikasi: 2.5, portofolio: 2.5,
  
  // Dunia Industri / Kerja
  industri: 2.0, dudi: 3.0, kerja: 2.0, gaji: 2.5, loker: 3.0,
  karir: 2.0, roadmap: 2.0, kuliah: 2.0, snbt: 3.0, snbp: 3.0
};

/**
 * Intent to category mapping
 * Maps user intents (from smartRouter) to RAG categories for retrieval
 */
export const INTENT_CATEGORY_MAP: Record<string, string[]> = {
  greeting: ['school', 'majors', 'behavior'],
  career_advice: ['careers', 'roadmap', 'majors', 'learning_flow', 'alumni', 'behavior'],
  job_search: ['dudi', 'majors', 'pkl', 'alumni'],
  scholarship: ['scholarships', 'school', 'financial'],
  course_rec: ['majors', 'courses', 'tools', 'learning_flow'],
  cv_help: ['careers', 'majors'],
  trend_data: ['industry', 'majors'],
  roadmap: ['roadmap', 'careers', 'majors', 'learning_flow'],
  college_info: ['school', 'scholarships', 'financial', 'faq', 'alumni', 'behavior'],
  interview_tips: ['careers', 'faq'],
  out_of_scope: ['faq'],
};

/**
 * Retrieval options
 */
export interface RetrievalOptions {
  jurusan?: string;      // normalized: rpl, dkv, bp, pm, akl, mplb, ulp
  intents: string[];     // from intent detection (smartRouter)
  emotionDetected?: boolean;
  maxTokens?: number;    // token budget (default 800)
  query?: string;        // user raw message for keyword scoring
  kelas?: string;        // user grade/class: "X", "XI", "XII", "Alumni"
}

/**
 * Standard vector cosine similarity calculation
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0.0;
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0.0 || normB === 0.0) return 0.0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Request Query Embedding from NVIDIA NIM (llama-nemotron-embed-1b-v2) securely from either Server or Browser Client
 */
async function getQueryEmbedding(query: string): Promise<number[] | null> {
  const isBrowser = typeof window !== 'undefined';

  try {
    let response: Response;

    if (isBrowser) {
      // Browser Client Context: Call proxy route to bypass CORS block
      response = await fetch('/api/chat/nvidia/embed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: [query],
        }),
        signal: AbortSignal.timeout(3000),
      });
    } else {
      // Server-Side Edge Context: Call API directly using key to avoid internal HTTP hops
      const apiKey = process.env.NEXT_PUBLIC_NVIDIA_API_KEY || (process.env as any).VITE_NVIDIA_API_KEY || '';
      if (!apiKey || apiKey === 'dummy_key') {
        console.warn('[VOKARA RAG] NVIDIA API Key is missing. Falling back to keyword search.');
        return null;
      }

      response = await fetch('https://integrate.api.nvidia.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          input: [query],
          model: 'nvidia/llama-nemotron-embed-1b-v2',
          input_type: 'query',
        }),
        signal: AbortSignal.timeout(3000),
      });
    }

    if (!response.ok) {
      console.error(`[VOKARA RAG] Embed API returned code ${response.status}. Falling back to TF-IDF.`);
      return null;
    }

    const data = await response.json();
    if (data.data && data.data[0] && data.data[0].embedding) {
      return data.data[0].embedding;
    }
  } catch (error: any) {
    console.error(`[VOKARA RAG] Failed to get query embedding (${error.message}). Falling back to TF-IDF.`);
  }
  return null;
}



/**
 * Main retrieval function
 * Returns formatted context string ready for injection into system prompt
 */
export async function retrieveContext(opts: RetrievalOptions): Promise<string> {
  const { jurusan, intents, emotionDetected = false, maxTokens = 800, query, kelas } = opts;

  // 1. Determine target categories from intents
  const targetCategories = new Set<string>();
  intents.forEach(intent => {
    INTENT_CATEGORY_MAP[intent]?.forEach(cat => targetCategories.add(cat));
  });

  // 2. If emotion detected, always add concerns
  if (emotionDetected) {
    targetCategories.add('concerns');
  }

  // 3. For any intent, if no specific categories matched, include majors as fallback
  if (targetCategories.size === 0) {
    targetCategories.add('majors');
  }

  // 4. Always include school context (differentiates SMKN 6)
  targetCategories.add('school');

  // 5. Fetch context blocks for each category
  const contextBlocks: { category: string; content: string }[] = [];

  // Get only segmented data instead of searching the complete massive dataset!
  const datasetSegment = getSegmentedData(jurusan);

  // Fetch embedding for the user's query asynchronously
  const t_embed_start = performance.now();
  const queryVector = query ? await getQueryEmbedding(query) : null;
  const t_embed_end = performance.now();
  
  if (queryVector) {
    console.log(`[VOKARA RAG] Generated query vector in ${(t_embed_end - t_embed_start).toFixed(1)}ms using llama-nemotron-embed-1b-v2.`);
  }

  for (const category of targetCategories) {
    let content = '';
    
    // Fallbacks or specialized formatting from our TS constants
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

    // Fetch complementary chunks from the segmented dataset
    const matchedChunks = datasetSegment.filter((chunk: any) => {
      // Map intents to dataset categories appropriately
      let matchCat = chunk.metadata.category === category;
      if (category === 'scholarships') matchCat = matchCat || chunk.metadata.category === 'financial';
      if (category === 'dudi') matchCat = matchCat || chunk.metadata.category === 'industry' || chunk.metadata.category === 'pkl';
      if (category === 'careers') matchCat = matchCat || chunk.metadata.category === 'careers';
      
      if (!matchCat) return false;

      // Filter by jurusan
      const chunkMajor = chunk.metadata.jurusan.toLowerCase();
      const reqMajor = jurusan ? jurusan.toLowerCase() : 'general';
      
      return chunkMajor === 'general' || chunkMajor === reqMajor;
    });

    let finalChunks: string[] = [];

    // VECTOR SEARCH PIPELINE (Primary)
    if (queryVector && matchedChunks.length > 0 && matchedChunks.every(c => c.vector)) {
      finalChunks = matchedChunks
        .map((chunk: any) => {
          let score = cosineSimilarity(queryVector, chunk.vector);

          // GRADE-LEVEL BOOST logic applied to semantic score
          if (kelas) {
            const k = kelas.toUpperCase();
            const text = chunk.content.toLowerCase();
            let matchesGrade = false;

            if (k === 'X') {
              matchesGrade = !!text.match(/(kelas\s*x|kelas\s*10|semester\s*1|semester\s*2|dasar|pengenalan)/i);
            } else if (k === 'XI') {
              matchesGrade = !!text.match(/(kelas\s*xi|kelas\s*11|semester\s*3|semester\s*4|pkl|magang|sertifikasi)/i);
            } else if (k === 'XII') {
              matchesGrade = !!text.match(/(kelas\s*xii|kelas\s*12|semester\s*5|semester\s*6|kerja|kuliah|portofolio|cv|interview|loker|beasiswa|kip)/i);
            } else if (k === 'ALUMNI') {
              matchesGrade = !!text.match(/(alumni|lulus|kerja|kuliah|cv|interview|loker)/i);
            }

            if (matchesGrade) {
              score += 0.15; // Safe semantic additive boost for grade personalization
            }
          }

          return { content: chunk.content, score };
        })
        .sort((a: any, b: any) => b.score - a.score)
        .map((item: any) => item.content);
    }
    // TF-IDF KEYWORD SEARCH PIPELINE (Graceful Fallback)
    else if (query && matchedChunks.length > 0) {
      const searchTerms = query
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
        .split(/\s+/)
        .filter(word => word.length > 2 && !INDONESIAN_STOPWORDS.has(word));

      if (searchTerms.length > 0) {
        finalChunks = matchedChunks
          .map((chunk: any) => {
            let score = 0;
            const text = chunk.content.toLowerCase();
            
            searchTerms.forEach(term => {
              const regex = new RegExp(term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
              const matches = text.match(regex);
              
              if (matches) {
                const frequency = matches.length;
                const weight = HIGH_VALUE_WEIGHTS[term] || 1.0;
                score += frequency * weight;
              }
            });

            if (kelas) {
              const k = kelas.toUpperCase();
              if (k === 'X') {
                const matchX = text.match(/(kelas\s*x|kelas\s*10|semester\s*1|semester\s*2|dasar|pengenalan)/i);
                if (matchX) score += 2.0;
              } else if (k === 'XI') {
                const matchXI = text.match(/(kelas\s*xi|kelas\s*11|semester\s*3|semester\s*4|pkl|magang|sertifikasi)/i);
                if (matchXI) score += 2.0;
              } else if (k === 'XII') {
                const matchXII = text.match(/(kelas\s*xii|kelas\s*12|semester\s*5|semester\s*6|kerja|kuliah|portofolio|cv|interview|loker|beasiswa|kip)/i);
                if (matchXII) score += 2.0;
              } else if (k === 'ALUMNI') {
                const matchAlumni = text.match(/(alumni|lulus|kerja|kuliah|cv|interview|loker)/i);
                if (matchAlumni) score += 2.0;
              }
            }
            
            return { content: chunk.content, score };
          })
          .filter((item: any) => item.score > 0)
          .sort((a: any, b: any) => b.score - a.score)
          .map((item: any) => item.content);
      } else {
        finalChunks = matchedChunks.map((chunk: any) => chunk.content);
      }
    } else {
      finalChunks = matchedChunks.map((chunk: any) => chunk.content);
    }

    // Limit to top 2 chunks maximum per category to prevent token inflation
    const prunedChunks = finalChunks.slice(0, 2);

    if (prunedChunks.length > 0) {
      content += (content ? '\n\n' : '') + '### Data Referensi Tambahan:\n- ' + prunedChunks.join('\n- ');
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
  const header = jurusan
    ? `DATA REFERENSI — Konteks VOKARA untuk jurusan ${jurusan.toUpperCase()} di SMKN 6 Surakarta\nGunakan sebagai acuan utama. Jangan tambahkan data di luar ini.\n\n`
    : `DATA REFERENSI — Konteks VOKARA untuk SMKN 6 Surakarta\n\n`;

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
  learning_flow: 'Alur Belajar & Kurikulum',
  alumni: 'Kisah & Prospek Alumni',
  behavior: 'Gaya Hidup & Psikologi Siswa',
  system: 'Sistem Chatbot',
};
