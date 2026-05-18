# SMKN 6 Surakarta — RAG Dataset Structure & Documentation
## AI Career Assistant Knowledge Base

---

## 📊 DATASET OVERVIEW

| Metric | Value |
|--------|-------|
| Total Chunks | 94 |
| Total Characters | ~111,000+ |
| Categories | 13 |
| Jurusan Covered | 7 + General |
| Source Types | PDF, AI Research, Both |
| Priority Levels | High, Medium, Low |

---

## 🗂️ CATEGORY STRUCTURE

### 1. MAJORS (38 chunks) — Highest Volume
**Purpose**: Deep technical knowledge per jurusan

| Subcategory | Count | Description |
|-------------|-------|-------------|
| curriculum | 7 | Mata pelajaran, kurikulum per jurusan |
| tools | 7 | Software, platform, tools industri |
| ai_impact | 7 | Dampak AI, skill shift, future-proofing |
| trends | 7 | Tren industri 2025-2026 |
| career | 7 | Peluang kerja, gaji, jalur karier |
| certification | 3 | Sertifikasi, portofolio ideal |
| niche | 0 | Niche karier spesial (merged into career) |
| solutions | 0 | Solusi praktis (merged into concerns) |

**Jurusan Distribution:**
- RPL: 11 chunks
- DKV: 10 chunks
- Broadcasting: 8 chunks
- Pemasaran: 8 chunks
- AKL: 7 chunks
- MPLB: 7 chunks
- ULP: 6 chunks

---

### 2. CONCERNS (8 chunks) — Emotional Intelligence
**Purpose**: Anxiety, fear, insecurity siswa

| Subcategory | Count | Description |
|-------------|-------|-------------|
| psychology | 7 | Concern nyata per jurusan |
| digital_ethics | 1 | Etika digital, rekam jejak |

**Key Concerns Covered:**
- AI akan menggantikan pekerjaan (semua jurusan)
- Laptop kentang (DKV, RPL, Broadcasting)
- PKL toksik, senior galak (semua jurusan)
- Introvert di pemasaran
- Gaji kecil, karier stagnan
- Etika digital & background check HRD

---

### 3. SCHOOL (7 chunks) — Institutional Context
**Purpose**: Profil, identitas, dan kultur SMKN 6

| Subcategory | Count | Description |
|-------------|-------|-------------|
| profile | 1 | Demografi, target lulusan, PIP |
| vision_mission | 1 | Visi, misi, karakter |
| teaching_factory | 1 | Tefa, peta jalan PPLG 5 tahun |
| culture | 1 | Sekolah Sehat, kolaborasi industri |
| identity | 1 | Positioning, Center of Excellence |
| extracurricular | 1 | OSIS, klub, komunitas |
| competition | 1 | LKS, Teaching Factory Expo |

---

### 4. FAQ (7 chunks) — Intent Recognition Training
**Purpose**: Pertanyaan umum siswa untuk chatbot training

| Subcategory | Count | Description |
|-------------|-------|-------------|
| technology_crisis | 1 | 'AI ganti programmer?' |
| hardware | 1 | 'Laptop kentang, pindah jurusan?' |
| pkl_conflict | 1 | 'Senior galak, cuma fotocopy' |
| personality | 1 | 'Introvert cocok pemasaran?' |
| general | 1 | SMK vs SMA, kuliah, gaji |
| ai_technology | 1 | Prompt engineering, low-code |
| mental_health | 1 | Anxiety, pressure, depresi |

---

### 5. ROADMAP (7 chunks) — Learning Path
**Purpose**: Semester-by-semester guide per jurusan

| Subcategory | Count | Description |
|-------------|-------|-------------|
| learning | 7 | Roadmap belajar + peluang usaha |

**Jurusan:** RPL, DKV, Pemasaran, AKL, MPLB, ULP, Broadcasting

---

### 6. INDUSTRY (6 chunks) — Macro Trends
**Purpose**: Tren industri global dan lokal

| Subcategory | Count | Description |
|-------------|-------|-------------|
| macro | 1 | AI, remote, gig economy, sustainability |
| creator_economy | 1 | $250B industri, TikTok, Reels |
| automation | 1 | AI Automation Stack, CRM integration |
| education_corporate | 1 | Toploker.com x SMKN 6 |
| compensation | 1 | Kompensasi holistik, wellbeing |
| portfolio_validation | 1 | Skills-first hiring |

---

### 7. PKL (5 chunks) — Internship Intelligence
**Purpose**: Tempat PKL, psikologi, tips

| Subcategory | Count | Description |
|-------------|-------|-------------|
| placement | 1 | Tempat PKL per jurusan di Solo/Klaten |
| psychology | 1 | 3 fase psikologis PKL |
| problems | 1 | 10 masalah umum + solusi |
| tips | 1 | 10 tips kesiapan PKL |
| anxiety | 1 | Anxiety spesifik per jurusan |

---

### 8. PROMPTS (5 chunks) — AI Personality
**Purpose**: System prompt, tone, ethics

| Subcategory | Count | Description |
|-------------|-------|-------------|
| personality | 1 | Persona, tone, code-mixing |
| ethics | 1 | Trauma-informed, resource-conscious |
| methodology | 1 | Socratic Questioning Protocol |
| safety | 1 | Red-line parameters |
| strategy | 1 | Conversational flow, emotion detection |

---

### 9. CAREERS (5 chunks) — Career Intelligence
**Purpose**: Jalur karier, gaji, freelance

| Subcategory | Count | Description |
|-------------|-------|-------------|
| niche | 3 | Niche karier spesial per jurusan |
| remote_freelance | 1 | Platform, tips freelance |
| salary | 1 | Tabel kompensasi realistis |

---

### 10. ALUMNI (2 chunks)
**Purpose**: Success stories, pathfinding

| Subcategory | Count | Description |
|-------------|-------|-------------|
| pathfinding | 1 | Alumni sebagai algoritma pemecahan jalan |
| stories | 1 | 5 template cerita sukses |

---

### 11. BEHAVIOR (2 chunks)
**Purpose**: Psikologi Gen Z, pola perilaku

| Subcategory | Count | Description |
|-------------|-------|-------------|
| gen_z | 1 | Digital natives, anxiety, entrepreneurial |
| psychology | 1 | 6 pola psikologis siswa SMK |

---

### 12. FINANCIAL (1 chunk)
**Purpose**: Beasiswa, pendanaan

| Subcategory | Count | Description |
|-------------|-------|-------------|
| scholarship | 1 | PIP, Pegadaian, Bidikmisi, BOS, BOP |

---

### 13. TRENDS (1 chunk)
**Purpose**: Poli-karier, lifelong employment

| Subcategory | Count | Description |
|-------------|-------|-------------|
| poly_career | 1 | Karier terdistribusi, multiple income |

---

## 🏷️ METADATA SCHEMA

Each chunk contains:

```json
{
  "id": "uuid-v4",
  "content": "text content",
  "metadata": {
    "category": "majors|concerns|school|faq|...",
    "subcategory": "curriculum|tools|psychology|...",
    "jurusan": "RPL|DKV|Broadcasting|Pemasaran|AKL|MPLB|ULP|General",
    "tags": ["array", "of", "keywords"],
    "priority": "high|medium|low",
    "source": "pdf|ai_research|both",
    "chunk_type": "factual|trend|emotional|actionable"
  }
}
```

### Chunk Types:
- **factual**: Data objektif (kurikulum, tools, profil sekolah)
- **trend**: Analisis tren industri dan teknologi
- **emotional**: Anxiety, fear, psychological support
- **actionable**: Langkah konkret, tips, roadmap

### Priority Levels:
- **high**: Core knowledge, sering di-query
- **medium**: Supporting knowledge
- **low**: Contextual knowledge

### Source Attribution:
- **pdf**: Data dari dokumen riset internal
- **ai_research**: Data dari web scraping/industry analysis
- **both**: Gabungan kedua sumber

---

## 🔍 RETRIEVAL STRATEGY

### Primary Retrieval Paths:

1. **Jurusan + Intent**: `jurusan:RPL AND category:majors`
   → Returns curriculum, tools, AI impact, trends, career untuk RPL

2. **Emotional Support**: `category:concerns AND jurusan:DKV`
   → Returns anxiety spesifik DKV + solusi

3. **PKL Guidance**: `category:pkl`
   → Returns tempat, psikologi, tips, anxiety

4. **FAQ Direct Match**: `category:faq`
   → Returns pertanyaan umum dengan jawaban terstruktur

5. **AI Personality**: `category:prompts`
   → Returns system prompt, tone, ethics, safety

6. **Career Planning**: `category:careers OR category:roadmap`
   → Returns jalur karier dan roadmap belajar

7. **Financial Support**: `category:financial`
   → Returns beasiswa, pendanaan

8. **Trend Awareness**: `category:industry`
   → Returns tren makro industri

### Hybrid Retrieval:
Combine jurusan filter with emotional state detection:
- If user expresses anxiety → boost `chunk_type:emotional`
- If user asks for steps → boost `chunk_type:actionable`
- If user asks "what is" → boost `chunk_type:factual`
- If user asks "trend" → boost `chunk_type:trend`

---

## 📁 OUTPUT FILES

| File | Format | Purpose |
|------|--------|---------|
| SMKN6_RAG_Dataset.json | JSON | Full dataset for vector DB ingestion |
| SMKN6_RAG_Dataset.csv | CSV | Human-readable preview |
| RAG_Dataset_Structure.md | Markdown | This documentation |

---

## 🚀 INGESTION RECOMMENDATION

### For Vector Database (e.g., Pinecone, Weaviate, Chroma):
```python
# Embed content field
# Use metadata for filtering
# Index tags for keyword search
# Use priority for ranking
```

### Chunk Size Strategy:
- Average chunk: ~1,000-1,500 characters
- Optimal for semantic similarity
- Metadata enables precise filtering

### Re-ranking Strategy:
1. Semantic search on content
2. Filter by jurusan (if specified)
3. Filter by category (based on intent)
4. Boost by priority
5. Boost by source=both (highest confidence)

---

*Generated: 2026-05-16*
*Sources: Riset PDF SMKN 6 + AI Web Scraping Research*
*Purpose: RAG Knowledge Base for AI Career Assistant*
