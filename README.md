# ☕ VOKARA — Vocational Career Assistant 🌿

> **"Membantu Siswa SMK Menemukan Jalan Karir dengan Kekuatan AI."**

VOKARA adalah platform asisten karir cerdas berbasis AI yang dirancang khusus untuk siswa SMK di Indonesia. Proyek ini merupakan bagian dari penelitian skripsi mengenai **AI-based Career Guidance**, menggabungkan teknologi **RAG (Retrieval-Augmented Generation)** untuk pengetahuan spesifik kejuruan dan **Hybrid Neural TTS** untuk interaksi yang manusiawi.

---

## 🚀 Fitur Unggulan

### 1. 🧠 Intelligent RAG Chat
Interaksi cerdas yang memahami konteks jurusan SMK di Indonesia (DKV, TKJ, RPL, dll.) menggunakan data pengetahuan yang telah dikurasi.

### 2. 🎙️ Hybrid Neural TTS (Vokara Voice)
Sistem *Text-to-Speech* yang menggabungkan dua engine untuk performa terbaik:
- **Local Engine (Sherpa-ONNX):** Menggunakan model Supertonic v3 untuk latensi super rendah (Offline-ready).
- **Premium Engine (Azure Speech):** Memberikan kualitas suara *high-fidelity* untuk pengalaman premium.
- **Auto-Fallback:** Sistem otomatis beralih ke engine lokal jika koneksi internet terganggu.

### 3. 🎨 Premium Persona
Identitas suara "Kak Karir" (SID 1) yang didesain ramah, suportif, dan profesional untuk membangun kedekatan dengan siswa.

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi |
| --- | --- |
| **Frontend** | Next.js 15 (App Router), TailwindCSS, Shadcn UI |
| **Backend API** | Next.js API Routes & Python Flask |
| **AI Model** | Google Gemini 1.5 Pro / Flash |
| **TTS Engine** | Sherpa-ONNX (Local) & Azure Cognitive Services |
| **Database/RAG** | Vector Embeddings for Major-specific knowledge |

---

## 📦 Persiapan Instalasi

### 1. Clone Repositori
```bash
git clone https://github.com/zeltoddd/Skripsi_Final.git
cd Skripsi_Final
```

### 2. Setup Frontend (Next.js)
```bash
npm install
npm run dev
```

### 3. Setup TTS Server (Python)
```bash
# Pastikan Python 3.10+ sudah terinstall
cd Product
pip install -r requirements.txt # (Coming soon: Manual install via pip)
# Pastikan model Sherpa sudah ada di folder model
python sherpa_server.py
```

### 4. Konfigurasi Environment (`.env`)
Buat file `.env` di root dan isi dengan API Key kamu:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_key
AZURE_SPEECH_KEY=your_key
AZURE_REGION=eastasia
```

---

## 📸 Demo Tampilan
*(Tambahkan screenshot dashboard kamu di sini)*

---

## 📜 Lisensi & Hak Cipta
Dibuat dengan ❤️ oleh **Ziyad Robith Fuqoha** sebagai bagian dari Tugas Akhir/Skripsi di **Universitas Sebelas Maret (UNS)**.

---

**"AI for better vocational education."** 🇮🇩
