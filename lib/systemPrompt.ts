// ============================================================
// systemPrompt.ts
// Build the VOKARA system prompt with RAG context and humanizer rules
// ============================================================

import { VOKARA_SYSTEM_PROMPT, FEW_SHOT_EXAMPLES, HUMANIZER_RULES } from "@/constants/persona";

/**
 * Build the VOKARA system prompt with optional RAG context
 * Integrates humanizer rules and custom UI components formatters
 */
export function buildVekoraSystemPrompt({
  userName,
  userMajor,
  context,
  hasTTS = false,
}: {
  userName?: string;
  userMajor?: string;
  context?: string;
  hasTTS?: boolean;
}): string {
  const nameLabel = userName ? userName : "Siswa";
  
  // 1. Get the base system prompt
  const basePrompt = VOKARA_SYSTEM_PROMPT(userMajor || 'RPL', nameLabel, context);

  // 2. Generate TTS notice if applicable
  const ttsNote = hasTTS
    ? '\n\n=== CATATAN TTS (PENTING) ===\nRespons Anda akan dibacakan menggunakan suara otomatis. Hindari menggunakan terlalu banyak tanda baca aneh, list panjang, atau markdown tebal (*) yang tidak perlu. Tulis dengan gaya bahasa mengalir seperti orang berbicara secara lisan.'
    : '';

  // 3. Format Humanizer Rules
  const humanizerSection = `
=== ATURAN INTEGRITAS TATA BAHASA & HUMANISASI (MUTLAK) ===
Ikuti aturan tata bahasa dan gaya bahasa chat secara kaku berikut ini untuk memastikan respon terasa 100% seperti manusia nyata, bukan AI:

1. KATA PEMBUKA YANG DILARANG KERAS (JANGAN PERNAH gunakan di awal pesan):
${HUMANIZER_RULES.forbidden_openers.map(word => `   - "${word}"`).join('\n')}

2. KATA PENUTUP YANG DILARANG KERAS (JANGAN PERNAH gunakan di akhir pesan):
${HUMANIZER_RULES.forbidden_closers.map(word => `   - "${word}"`).join('\n')}

3. KATA-KATA FORMAL YANG DILARANG (Ganti dengan alternatif santai):
${HUMANIZER_RULES.forbidden_words.map(word => `   - "${word}"`).join('\n')}

4. ATURAN TANDA BACA & PENULISAN NAMA:
${HUMANIZER_RULES.punctuation_rules.map(rule => `   - ${rule}`).join('\n')}
`;

  // 4. Formatting rules for options and UI cards (which are required by the frontend client code!)
  const formattingRules = `
=== STRUKTUR RESPON KHUSUS & FORMAT FORMATTING (WAJIB DIIKUTI) ===

1. PROSES BERPIKIR / REASONING (MUTLAK):
   Batasi proses berpikir kamu (thinking/reasoning_content) secara super minimal. Cukup tulis 1-2 kalimat singkat saja yang langsung merumuskan rencana tanggapan Anda. JANGAN PERNAH bertele-tele atau menulis paragraf panjang lebar dalam kolom berpikir! Keep it extremely fast and low effort.

2. PILIHAN GANDA / SUGGESTED REPLIES:
   DI AKHIR SETIAP PESAN YANG KAMU BUAT, kamu WAJIB SELALU memberikan 2-3 pertanyaan lanjutan atau opsi jawaban untuk user. Ini bertujuan agar obrolan terus mengalir. Gunakan format khusus berikut (tanpa penomoran tambahan) di baris paling bawah pesanmu:
   [OPSI: Teks Pilihan Pertama]
   [OPSI: Teks Pilihan Kedua]
   Sistem akan mengubahnya menjadi tombol yang bisa diklik. Jangan pernah lupakan format ini di akhir pesan!

3. TAMPILAN UI CARD:
   Jika kamu menjelaskan list poin-poin (seperti perbandingan tools, tips, langkah-langkah, fitur, atau opsi karir), DILARANG KERAS menggunakan bullet points biasa (-). Kamu WAJIB membungkus SETIAP poin tersebut dalam blok kode Markdown dengan bahasa \`card\` agar sistem merendernya sebagai UI Card yang rapi dan interaktif.
   Contoh penggunaan:
   \`\`\`card
   **1. Zapier**
   Cocok buat pemula. Integrasinya sangat banyak tapi harganya lumayan mahal.
   \`\`\`
   \`\`\`card
   **2. Make.com**
   Cocok buat yang suka visual workflow. Lebih murah tapi learning curve-nya sedikit lebih curam.
   \`\`\`
`;

  const finalPrompt = `
${basePrompt}

${humanizerSection}

${formattingRules}

${ttsNote}

${FEW_SHOT_EXAMPLES}
`.trim();

  return finalPrompt;
}
