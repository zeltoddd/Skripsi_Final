import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_KEY = process.env.NEXT_PUBLIC_NVIDIA_API_KEY;

if (!API_KEY) {
  console.error('❌ ERROR: NEXT_PUBLIC_NVIDIA_API_KEY tidak ditemukan di file .env.');
  process.exit(1);
}

const MASTER_DATASET_PATH = path.join(__dirname, '../data/rag/SMKN6_RAG_Dataset_Complete.json');
const SEGMENTS_DIR = path.join(__dirname, '../data/rag/segments');
const MODEL_NAME = 'nvidia/llama-nemotron-embed-1b-v2';

interface Chunk {
  id: string;
  content: string;
  metadata: {
    category: string;
    subcategory: string;
    jurusan: string;
    priority: string;
    source: string;
    chunk_type: string;
    tags?: string[];
  };
  vector?: number[];
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function getEmbeddingSingleWithRetry(text: string, retries = 5, delayMs = 1000): Promise<number[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch('https://integrate.api.nvidia.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          input: [text],
          model: MODEL_NAME,
          input_type: 'passage',
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`NVIDIA API Error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      if (data.data && data.data[0] && data.data[0].embedding) {
        return data.data[0].embedding;
      } else {
        throw new Error('Format response NVIDIA tidak valid (data.data[0].embedding tidak ditemukan)');
      }
    } catch (error: any) {
      console.warn(`      ⚠️ Attempt ${attempt}/${retries} failed for model ${MODEL_NAME}: ${error.message}`);
      if (attempt === retries) throw error;
      await sleep(delayMs * attempt);
    }
  }
  throw new Error('Semua attempt gagal');
}

async function syncAndEmbed() {
  console.log('🚀 MEMULAI INCREMENTAL SYNC & EMBEDDING RAG VOKARA 🚀');
  console.log(`💡 Model: ${MODEL_NAME}`);
  
  if (!fs.existsSync(MASTER_DATASET_PATH)) {
    console.error(`❌ MASTER FILE NOT FOUND: ${MASTER_DATASET_PATH}`);
    process.exit(1);
  }

  if (!fs.existsSync(SEGMENTS_DIR)) {
    fs.mkdirSync(SEGMENTS_DIR, { recursive: true });
    console.log(`📁 Membuat direktori segments di ${SEGMENTS_DIR}`);
  }

  // 1. Read Master Dataset
  const rawMaster = fs.readFileSync(MASTER_DATASET_PATH, 'utf-8');
  let masterChunks: Chunk[];
  try {
    masterChunks = JSON.parse(rawMaster);
  } catch (e: any) {
    console.error('❌ Failed parsing master dataset JSON:', e.message);
    process.exit(1);
  }

  console.log(`📋 Total chunks di dataset master: ${masterChunks.length}`);

  // 2. Group chunks by jurusan
  const groupedChunks: Record<string, Chunk[]> = {};
  masterChunks.forEach(chunk => {
    const jur = (chunk.metadata?.jurusan || 'General').toLowerCase();
    if (!groupedChunks[jur]) {
      groupedChunks[jur] = [];
    }
    groupedChunks[jur].push(chunk);
  });

  console.log(`🔍 Ditemukan ${Object.keys(groupedChunks).length} kelompok jurusan:`, Object.keys(groupedChunks));

  // 3. For each group, load existing embedded file (if any) to reuse vectors
  for (const [jurusan, chunks] of Object.entries(groupedChunks)) {
    console.log(`\n--------------------------------------------------`);
    console.log(`📂 Memproses jurusan: [${jurusan.toUpperCase()}] dengan ${chunks.length} chunks`);
    
    const segmentJsonPath = path.join(SEGMENTS_DIR, `${jurusan}.json`);
    const embeddedJsonPath = path.join(SEGMENTS_DIR, `${jurusan}.embedded.json`);
    
    // Save standard plain JSON segment
    fs.writeFileSync(segmentJsonPath, JSON.stringify(chunks, null, 2), 'utf-8');
    
    // Load existing embeddings to reuse vectors
    const existingEmbedMap = new Map<string, { content: string; vector: number[] }>();
    if (fs.existsSync(embeddedJsonPath)) {
      try {
        const rawExisting = fs.readFileSync(embeddedJsonPath, 'utf-8');
        const existingChunks: Chunk[] = JSON.parse(rawExisting);
        existingChunks.forEach(c => {
          if (c.id && c.vector) {
            existingEmbedMap.set(c.id, { content: c.content, vector: c.vector });
          }
        });
        console.log(`   💡 Berhasil memuat ${existingEmbedMap.size} existing embedded vectors dari cache.`);
      } catch (e: any) {
        console.warn(`   ⚠️ Gagal memuat file embedded sebelumnya (${e.message}). Re-embedding dari awal.`);
      }
    }

    const finalEmbeddedChunks: Chunk[] = [];
    let reusedCount = 0;
    let embeddedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const cache = existingEmbedMap.get(chunk.id);
      
      // Reuse vector if ID matches AND content matches perfectly
      if (cache && cache.content === chunk.content) {
        finalEmbeddedChunks.push({
          ...chunk,
          vector: cache.vector
        });
        reusedCount++;
      } else {
        // Need to embed
        console.log(`   ⚡ [${i + 1}/${chunks.length}] Embedding chunk baru/terupdate (ID: ${chunk.id.slice(0, 8)})...`);
        try {
          const vector = await getEmbeddingSingleWithRetry(chunk.content);
          finalEmbeddedChunks.push({
            ...chunk,
            vector
          });
          embeddedCount++;
          // Be gentle with the API rate limits
          await sleep(150);
        } catch (err: any) {
          console.error(`   ❌ Gagal total menggenerate embedding:`, err.message);
          finalEmbeddedChunks.push(chunk);
          failedCount++;
        }
      }
    }

    // Save standard embedded JSON segment
    fs.writeFileSync(embeddedJsonPath, JSON.stringify(finalEmbeddedChunks, null, 2), 'utf-8');
    console.log(`   ✅ Selesai! Reused: ${reusedCount} | Embedded: ${embeddedCount} | Failed: ${failedCount}`);
    console.log(`   💾 File disimpan ke ${embeddedJsonPath}`);
  }

  console.log('\n🎉 INCREMENTAL SYNC & EMBEDDING RAG VOKARA SUKSES BESAR! 🎉\n');
}

syncAndEmbed().catch(err => {
  console.error('❌ FATAL ERROR IN SYNC:', err);
});
