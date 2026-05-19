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

const SEGMENTS_DIR = path.join(__dirname, '../data/rag/segments');

// We use NVIDIA's flagship "nvidia/llama-nemotron-embed-1b-v2" model, which is ultra-stable,
// has superb multilingual (Indonesian) support, and outputs standard 1024-dimensional vectors.
const MODEL_NAME = 'nvidia/llama-nemotron-embed-1b-v2';

interface Chunk {
  id: string;
  content: string;
  metadata: any;
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

async function embedFile(filename: string) {
  const filePath = path.join(SEGMENTS_DIR, filename);
  const outputFilename = filename.replace('.json', '.embedded.json');
  const outputPath = path.join(SEGMENTS_DIR, outputFilename);

  console.log(`\n📂 Memproses file: ${filename} -> ${outputFilename}...`);

  const rawData = fs.readFileSync(filePath, 'utf-8');
  let chunks: Chunk[];
  try {
    chunks = JSON.parse(rawData);
  } catch (e) {
    console.error(`❌ Error parsing JSON di ${filename}:`, e);
    return;
  }

  console.log(`   Ditemukan ${chunks.length} chunks.`);
  const embeddedChunks: Chunk[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`   ⚡ [${i + 1}/${chunks.length}] Menggenerate embedding untuk chunk ID: ${chunk.id.slice(0, 8)}...`);

    try {
      const vector = await getEmbeddingSingleWithRetry(chunk.content);
      embeddedChunks.push({
        ...chunk,
        vector
      });
    } catch (err: any) {
      console.error(`   ❌ Gagal total menggenerate embedding setelah beberapa kali mencoba:`, err.message);
      embeddedChunks.push(chunk);
    }

    await sleep(100);
  }

  fs.writeFileSync(outputPath, JSON.stringify(embeddedChunks, null, 2), 'utf-8');
  console.log(`   ✅ Selesai! File disimpan ke ${outputPath}`);
}

async function main() {
  console.log('🚀 MEMULAI GENERASI VECTOR EMBEDDING DENGAN NVIDIA NIM 🚀');
  console.log(`💡 Model Pilihan: ${MODEL_NAME} (Flagship, Ultra-Stabil, Multi-Lingual)`);
  console.log('💡 Mode: Pemrosesan Single Chunk dengan Auto-Retry & Backoff (Ultra Stabil)\n');
  
  if (!fs.existsSync(SEGMENTS_DIR)) {
    console.error(`❌ ERROR: Direktori segments tidak ditemukan di ${SEGMENTS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(SEGMENTS_DIR).filter(file => file.endsWith('.json') && !file.includes('.embedded.json'));

  console.log(`Ditemukan ${files.length} file segment untuk diproses.`);

  for (const file of files) {
    await embedFile(file);
  }

  console.log('\n🎉 SEMUA FILE SELESAI DIPROSES DENGAN BERHASIL! 🎉');
}

main().catch(err => {
  console.error('❌ FATAL ERROR:', err);
});
