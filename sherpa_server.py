"""
sherpa_server_v3.py — VOKARA TTS Server (Rewrite Total)

Perbaikan dari v2 berdasarkan analisis audio debug_1778782836.wav:

BUGS v2 yang diperbaiki:
  ❌ Hyphenation (Vo-ka-ra, Gra-fik, De-sai-ner) → suara terpatah
  ❌ Slash tidak dihandle (Yu Ai/Yu Eks masuk TTS mentah)
  ❌ Prosody logic buggy → "jalan hidup , setelah, sekolah"
  ❌ "didiskusikan, ?" double punct setelah tanda tanya
  ❌ Silence gap antar chunk tidak smooth

Filosofi v3:
  ✅ TIDAK ADA hyphen dalam output teks — model TTS handle sendiri
  ✅ Singkatan → kata fonetik dengan SPASI, bukan tanda hubung
  ✅ Slash → " atau " / " dan " tergantung konteks
  ✅ Prosody = hanya tambah koma di titik alami, bukan brute-force replace
  ✅ Chunking per KALIMAT penuh, bukan per char count
  ✅ Crossfade 40ms antar chunk untuk transisi mulus
"""

from flask import Flask, request, send_file, jsonify
import sherpa_onnx
import io
import re
import numpy as np
import soundfile as sf
import os
import time
import azure.cognitiveservices.speech as speechsdk
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

app = Flask(__name__)

# --- CONFIG AZURE ---
# Gunakan .strip() buat jaga-jaga kalau di .env ada spasi atau tanda kutip nyelip
AZURE_SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY", "MASUKKAN_KEY_AZURE_DISINI").strip().strip('"').strip("'")
AZURE_REGION     = os.getenv("AZURE_REGION", "eastasia").strip().strip('"').strip("'")

# Folder debug
DEBUG_DIR = "debug_audio"
if not os.path.exists(DEBUG_DIR):
    os.makedirs(DEBUG_DIR)

# ──────────────────────────────────────────────────────────
# 1. KAMUS FONETIK — SPASI, BUKAN TANDA HUBUNG
# ──────────────────────────────────────────────────────────

# Singkatan pendidikan/instansi → baca huruf demi huruf
SPELL_OUT = {
    "SMK":   "Es Em Ka",
    "SMA":   "Es Em A",
    "SMP":   "Es Em Pe",
    "SD":    "Es De",
    "DKV":   "De Ka Fe",
    "BK":    "Be Ka",
    "PKL":   "Pe Ka El",
    "LSP":   "El Es Pe",
    "KIP":   "Ka I Pe",
    "SNBP":  "Es En Be Pe",
    "SNBT":  "Es En Be Te",
    "PTS":   "Pe Te Es",
    "UKM":   "U Ka Em",
    "BKK":   "Be Ka Ka",
    "UMKM":  "U Em Ka Em",
    "DUDI":  "Du Di",
    "S1":    "Es Satu",
    "D3":    "De Tiga",
    "D4":    "De Empat",
    "AI":    "Ey Ai",
    "UI":    "Yu Ai",
    "UX":    "Yu Eks",
    "CV":    "Se Vi",
    "HR":    "Ech Er",
    "IT":    "Ai Ti",
    "LLM":   "El El Em",
    "GIS":   "Ji Ai Es",
    "VFX":   "Vi Ef Eks",
    "FB":    "Ef Bi",
    "IG":    "Ai Ji",
    "YT":    "Wai Ti",
    "PDF":   "Pe De Ef",
    "SEO":   "Es E O",
    "API":   "Ey Pi Ai",
    "KKS":   "Ka Ka Es",
    "PKH":   "Pe Ka Ach",
    "SOP":   "Es O Pe",
    "SDM":   "Es De Em",
    "XII":   "dua belas",
    "XI":    "sebelas",
    "X":     "sepuluh",      # hati-hati: hanya di konteks kelas
}

# Kata/frasa Inggris → fonetik Indonesia tanpa tanda hubung
WORD_MAP = {
    # Format: "english": "fonetik indonesia"
    # Kata kerja / kata benda teknis
    r"\bskill\b":           "skil",
    r"\bskills\b":          "skils",
    r"\bSkill\b":           "Skil",
    r"\bSkills\b":          "Skils",
    r"\bcareer\b":          "karir",
    r"\bCareer\b":          "Karir",
    r"\bproject\b":         "projek",
    r"\bProject\b":         "Projek",
    r"\bprojects\b":        "projek-projek",
    r"\bcontent\b":         "konten",
    r"\bContent\b":         "Konten",
    r"\bbranding\b":        "brending",
    r"\bBranding\b":        "Brending",
    r"\bcreator\b":         "kreator",
    r"\bCreator\b":         "Kreator",
    r"\bfreelance\b":       "frilans",
    r"\bFreelance\b":       "Frilans",
    r"\bfreelancer\b":      "frilenser",
    r"\bFreelancer\b":      "Frilenser",
    r"\bstartup\b":         "startap",
    r"\bStartup\b":         "Startap",
    r"\bagency\b":          "agensi",
    r"\bAgency\b":          "Agensi",
    r"\bdigital\b":         "dijital",
    r"\bDigital\b":         "Dijital",
    r"\bportfolio\b":       "portofolio",
    r"\bPortfolio\b":       "Portofolio",
    r"\bdesigner\b":        "desainer",
    r"\bDesigner\b":        "Desainer",
    r"\bgraphic\b":         "grafik",
    r"\bGraphic\b":         "Grafik",
    r"\bvisual\b":          "visual",
    r"\bVisual\b":          "Visual",
    r"\bmotion\b":          "mosyen",
    r"\bMotion\b":          "Mosyen",
    r"\bediting\b":         "editing",
    r"\bEditing\b":         "Editing",
    r"\brendering\b":       "rendering",
    r"\bRendering\b":       "Rendering",
    r"\bimaging\b":         "aimeijing",
    r"\bImaging\b":         "Aimeijing",
    r"\bcompositing\b":     "kompositing",
    r"\bCompositing\b":     "Kompositing",
    r"\bsocial\b":          "sosial",
    r"\bSocial\b":          "Sosial",
    r"\blink\b":            "ling",
    r"\bLink\b":            "Ling",
    r"\bupload\b":          "aplod",
    r"\bUpload\b":          "Aplod",
    r"\bdownload\b":        "daonlod",
    r"\bDownload\b":        "Daonlod",
    r"\bwebsite\b":         "websait",
    r"\bWebsite\b":         "Websait",
    r"\bonline\b":          "onlain",
    r"\bOnline\b":          "Onlain",
    r"\boffline\b":         "oflain",
    r"\bOffline\b":         "Oflain",
    r"\bvideo\b":           "video",
    r"\bVideo\b":           "Video",
    # Aplikasi / tools
    r"\bFiverr\b":          "Faiver",
    r"\bUpwork\b":          "Apwork",
    r"\bFigma\b":           "Figma",
    r"\bBlender\b":         "Blender",
    r"\bCanva\b":           "Kanfa",
    r"\bAdobe\b":           "Adob",
    r"\bIllustrator\b":     "Ilustreitor",
    r"\bPhotoshop\b":       "Fotosop",
    r"\bPremiere\b":        "Premier",
    r"\bAfterEffects\b":    "After Efeks",
    r"\bAfter Effects\b":   "After Efeks",
    r"\bNext\.js\b":        "Neks Jei Es",
    r"\bNode\.js\b":        "Nod Jei Es",
    r"\bReact\b":           "Riekt",
    r"\bFlutter\b":         "Flater",
    r"\bPython\b":          "Paithon",
    # Kombinasi umum
    r"\bUI/UX\b":           "Yu Ai dan Yu Eks",
    r"\bui/ux\b":           "Yu Ai dan Yu Eks",
    r"\bUX/UI\b":           "Yu Eks dan Yu Ai",
    r"\bSocial Media\b":    "Sosial Media",
    r"\bsocial media\b":    "sosial media",
    r"\bMotion Graphic\b":  "Mosyen Grafik",
    r"\bmotion graphic\b":  "mosyen grafik",
    r"\bGraphic Designer\b": "Grafik Desainer",
    r"\bgraphic designer\b": "grafik desainer",
    r"\bContent Creator\b": "Konten Kreator",
    r"\bcontent creator\b": "konten kreator",
    r"\bVideo Editor\b":    "Video Editor",
    r"\bvideo editor\b":    "video editor",
    r"\bWeb Developer\b":   "Web Developer",
    r"\bweb developer\b":   "web developer",
}


# ──────────────────────────────────────────────────────────
# 2. NUMBER → KATA INDONESIA
# ──────────────────────────────────────────────────────────
_ONES  = ["", "satu", "dua", "tiga", "empat", "lima",
          "enam", "tujuh", "delapan", "sembilan"]
_TEENS = ["sepuluh", "sebelas", "dua belas", "tiga belas", "empat belas",
          "lima belas", "enam belas", "tujuh belas", "delapan belas", "sembilan belas"]
_TENS  = ["", "sepuluh", "dua puluh", "tiga puluh", "empat puluh", "lima puluh",
          "enam puluh", "tujuh puluh", "delapan puluh", "sembilan puluh"]

def _n2id(n: int) -> str:
    if n < 0:    return "minus " + _n2id(-n)
    if n == 0:   return "nol"
    if n < 10:   return _ONES[n]
    if n < 20:   return _TEENS[n - 10]
    if n < 100:  return _TENS[n // 10] + (" " + _ONES[n % 10] if n % 10 else "")
    if n < 200:  return "seratus" + (" " + _n2id(n - 100) if n > 100 else "")
    if n < 1000:
        return _ONES[n // 100] + " ratus" + (" " + _n2id(n % 100) if n % 100 else "")
    if n < 2000: return "seribu" + (" " + _n2id(n - 1000) if n > 1000 else "")
    if n < 1_000_000:
        return _n2id(n // 1000) + " ribu" + (" " + _n2id(n % 1000) if n % 1000 else "")
    if n < 1_000_000_000:
        return _n2id(n // 1_000_000) + " juta" + (" " + _n2id(n % 1_000_000) if n % 1_000_000 else "")
    return str(n)

def expand_numbers(text: str) -> str:
    # Rupiah: Rp 5.000.000
    def _rp(m):
        try: return _n2id(int(m.group(1).replace(".", "").replace(",", ""))) + " rupiah"
        except: return m.group(0)
    text = re.sub(r'Rp\.?\s*([\d.,]+)', _rp, text, flags=re.IGNORECASE)

    # ke-3, ke-12
    def _ord(m):
        try: return "ke" + _n2id(int(m.group(1)))
        except: return m.group(0)
    text = re.sub(r'\bke-(\d+)\b', _ord, text)

    # Angka biasa — jangan expand tahun atau kode (e.g. "2024", "SMK 6")
    def _num(m):
        raw = m.group(0).replace(".", "").replace(",", "")
        try:
            n = int(raw)
            # Jangan expand tahun 1900–2099
            if 1900 <= n <= 2099: return m.group(0)
            return _n2id(n)
        except: return m.group(0)
    text = re.sub(r'\b\d[\d.,]*\b', _num, text)
    return text


# ──────────────────────────────────────────────────────────
# 3. STRIP NOISE
# ──────────────────────────────────────────────────────────
_EMOJI_RE = re.compile(
    "["
    "\U0001F600-\U0001F64F"   # emoticons
    "\U0001F300-\U0001F5FF"   # symbols & pictographs
    "\U0001F680-\U0001F6FF"   # transport & map
    "\U0001F1E0-\U0001F1FF"   # flags
    "\U00002702-\U000027B0"
    "\U000024C2-\U0001F251"
    "\U0001F900-\U0001F9FF"
    "\U0001FA00-\U0001FA6F"
    "\U0001FA70-\U0001FAFF"
    "]+", flags=re.UNICODE
)

def strip_noise(text: str) -> str:
    # Emoji → spasi
    text = _EMOJI_RE.sub(' ', text)
    # Markdown heading
    text = re.sub(r'^\s*#{1,6}\s+', '', text, flags=re.MULTILINE)
    # Bold/italic → teks biasa
    text = re.sub(r'\*{1,3}([^*\n]+)\*{1,3}', r'\1', text)
    text = re.sub(r'_{1,2}([^_\n]+)_{1,2}', r'\1', text)
    # Code
    text = re.sub(r'```[\s\S]*?```', '', text)
    text = re.sub(r'`([^`]+)`', r'\1', text)
    # Tabel markdown
    text = re.sub(r'^\|.*\|$', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*\|[-:| ]+\|\s*$', '', text, flags=re.MULTILINE)
    # HR / divider
    text = re.sub(r'^\s*[-*_]{3,}\s*$', '.', text, flags=re.MULTILINE)
    # URL
    text = re.sub(r'https?://\S+', '', text)
    # Bullet/numbered list marker
    text = re.sub(r'^\s*[-•*▪▸►]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*\d+[.)]\s+', '', text, flags=re.MULTILINE)
    # Tanda kurung kosong
    text = re.sub(r'\(\s*\)', '', text)
    text = re.sub(r'\[\s*\]', '', text)
    return text


# ──────────────────────────────────────────────────────────
# 4. PROSODY — HANYA KOMA KONTEKSTUAL, BUKAN BRUTE FORCE
# ──────────────────────────────────────────────────────────

# Konjungsi yang butuh jeda SEBELUMNYA — tapi hanya jika sudah ada konteks kata
# Format: (pattern, replacement)
_PROSODY_RULES = [
    # Klausa adversatif → jeda sebelum
    (r'(?<=[a-zA-Z\u00C0-\u024F])\s+(namun|tetapi|tapi|melainkan)\s+',
     lambda m: f', {m.group(1)} '),
    # Klausa sebab-akibat panjang
    (r'(?<=[a-zA-Z\u00C0-\u024F])\s+(sehingga|karena|oleh karena itu)\s+',
     lambda m: f', {m.group(1)} '),
    # Contoh / penjelasan
    (r'(?<=[a-zA-Z\u00C0-\u024F])\s+(misalnya|contohnya|yaitu|yakni|artinya)\s+',
     lambda m: f', {m.group(1)}, '),
    # Penambahan info
    (r'(?<=[a-zA-Z\u00C0-\u024F])\s+(bahkan|apalagi|terlebih)\s+',
     lambda m: f', {m.group(1)} '),
]

def inject_prosody(text: str) -> str:
    for pattern, repl in _PROSODY_RULES:
        text = re.sub(pattern, repl, text, flags=re.IGNORECASE)
    # Ellipsis → jeda sedang
    text = text.replace("...", ", ")
    text = text.replace("…", ", ")
    # Tanda pisah em-dash → koma
    text = re.sub(r'\s*[—–]\s*', ', ', text)
    # Titik dua di tengah kalimat → koma (untuk list pendek)
    text = re.sub(r':\s+(?=[a-z])', ', ', text)
    return text


# ──────────────────────────────────────────────────────────
# 5. SENTENCE SPLITTER (per kalimat penuh, bukan per char)
# ──────────────────────────────────────────────────────────

def split_to_sentences(text: str) -> list[str]:
    """
    Pecah teks jadi kalimat-kalimat pendek.
    Prioritas: pisah di titik/seru/tanya, lalu di koma jika kalimat >250 char.
    """
    # Normalisasi newline → period
    text = re.sub(r'\n{2,}', '. ', text)
    text = re.sub(r'\n', ' ', text)

    # Split di akhir kalimat
    parts = re.split(r'(?<=[.!?])\s+', text)
    sentences = []

    for part in parts:
        part = part.strip()
        if not part:
            continue
        if len(part) <= 250:
            sentences.append(part)
        else:
            # Terlalu panjang: pecah di koma
            subparts = re.split(r',\s+', part)
            buf = ""
            for sub in subparts:
                if len(buf) + len(sub) < 220:
                    buf += (", " if buf else "") + sub
                else:
                    if buf:
                        sentences.append(buf.strip())
                    buf = sub
            if buf.strip():
                sentences.append(buf.strip())

    return [s for s in sentences if s]


# ──────────────────────────────────────────────────────────
# 6. SPELL-OUT ABBREVIATIONS
# ──────────────────────────────────────────────────────────
def apply_spell_out(text: str) -> str:
    """Ganti singkatan dengan ejaan huruf."""
    for abbr, spoken in SPELL_OUT.items():
        # Word-boundary safe
        text = re.sub(r'\b' + re.escape(abbr) + r'\b', spoken, text)
    return text

def apply_word_map(text: str) -> str:
    """Ganti kata Inggris dengan fonetik Indonesia."""
    for pattern, replacement in WORD_MAP.items():
        text = re.sub(pattern, replacement, text)
    return text


# ──────────────────────────────────────────────────────────
# 7. PIPELINE UTAMA
# ──────────────────────────────────────────────────────────
def clean_for_tts(raw_text: str) -> str:
    text = raw_text

    # Step 1 — Bersihkan noise visual
    text = strip_noise(text)

    # Step 2 — Ganti slash jadi "dan/atau" sebelum expand singkatan
    # UI/UX, iOS/Android, dll
    text = re.sub(r'([A-Za-z]+)/([A-Za-z]+)',
                  lambda m: m.group(1) + ' dan ' + m.group(2), text)

    # Step 3 — Ganti pasangan kata dulu (sebelum single-word map)
    text = apply_word_map(text)

    # Step 4 — Ganti singkatan
    text = apply_spell_out(text)

    # Step 5 — Expand angka
    text = expand_numbers(text)

    # Step 6 — Inject prosodi kontekstual
    text = inject_prosody(text)

    # Step 7 — Normalisasi whitespace & punctuation
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r',\s*,+', ',', text)          # double comma
    text = re.sub(r'\.\s*\.+', '.', text)         # double period
    text = re.sub(r',\s*([.!?])', r'\1', text)    # koma sebelum akhir kalimat
    text = re.sub(r'([!?])\s*([!?])+', r'\1', text)
    text = text.strip()

    return text


# ──────────────────────────────────────────────────────────
# 8. AUDIO CROSSFADE (30ms) — transisi mulus antar chunk
# ──────────────────────────────────────────────────────────
def crossfade_concat(audio_chunks: list[np.ndarray], sample_rate: int,
                     fade_ms: int = 30) -> np.ndarray:
    """Gabungkan chunks dengan crossfade pendek untuk menghindari silence gap."""
    if len(audio_chunks) == 1:
        return audio_chunks[0]

    fade_samples = int(sample_rate * fade_ms / 1000)
    result = audio_chunks[0]

    for chunk in audio_chunks[1:]:
        if len(result) < fade_samples or len(chunk) < fade_samples:
            result = np.concatenate([result, chunk])
            continue

        fade_out = np.linspace(1.0, 0.0, fade_samples)
        fade_in  = np.linspace(0.0, 1.0, fade_samples)

        overlap = result[-fade_samples:] * fade_out + chunk[:fade_samples] * fade_in

        result = np.concatenate([
            result[:-fade_samples],
            overlap,
            chunk[fade_samples:]
        ])

    return result


# ──────────────────────────────────────────────────────────
# 9. MODEL SETUP
# ──────────────────────────────────────────────────────────
MODEL_DIR = "sherpa-onnx-supertonic-3-tts-int8-2026-05-11"

tts_config = sherpa_onnx.OfflineTtsConfig(
    model=sherpa_onnx.OfflineTtsModelConfig(
        supertonic=sherpa_onnx.OfflineTtsSupertonicModelConfig(
            duration_predictor = f"{MODEL_DIR}/duration_predictor.int8.onnx",
            text_encoder       = f"{MODEL_DIR}/text_encoder.int8.onnx",
            vector_estimator   = f"{MODEL_DIR}/vector_estimator.int8.onnx",
            vocoder            = f"{MODEL_DIR}/vocoder.int8.onnx",
            tts_json           = f"{MODEL_DIR}/tts.json",
            unicode_indexer    = f"{MODEL_DIR}/unicode_indexer.bin",
            voice_style        = f"{MODEL_DIR}/voice.bin",
        ),
        num_threads=4,
    ),
)

tts = sherpa_onnx.OfflineTts(tts_config)

# Default config — identitas resmi Vokara
DEFAULT_SID   = 1       # Sesuai pilihan user: Suara Mentor
DEFAULT_SPEED = 1.15    # Disesuaikan biar lebih gercep tapi natural


# ──────────────────────────────────────────────────────────
# 10. ROUTES
# ──────────────────────────────────────────────────────────
@app.route('/synthesize', methods=['POST'])
def synthesize():
    try:
        data     = request.json or {}
        raw_text = data.get('text', '').strip()
        sid      = int(data.get('sid',   DEFAULT_SID))
        speed    = float(data.get('speed', DEFAULT_SPEED))

        if not raw_text:
            return "Empty text", 400

        # ── Preprocess ────────────────────────────────
        processed = clean_for_tts(raw_text)
        sentences = split_to_sentences(processed)

        print("\n" + "═"*60)
        print(f"📥 RAW  [{len(raw_text)}ch]: {raw_text[:100]}")
        print(f"📤 PROC [{len(processed)}ch]: {processed[:100]}")
        print(f"🔖 Chunks: {len(sentences)}")
        for i, s in enumerate(sentences):
            print(f"   [{i}] ({len(s)}ch) {s}")
        print("═"*60)

        # ── PILIH ENGINE ──
        engine = data.get('engine', 'sherpa')

        # Logika Azure (Hanya jalan kalau Key sudah diganti)
        if engine == 'azure' and AZURE_SPEECH_KEY != "MASUKKAN_KEY_AZURE_DISINI":
            print("☁️ Calling Azure Speech Engine...")
            speech_config = speechsdk.SpeechConfig(subscription=AZURE_SPEECH_KEY, region=AZURE_REGION)
            speech_config.speech_synthesis_voice_name = 'id-ID-GadisNeural' # Kita ganti ke Gadis ya cing!
            
            # Azure nggak kenal tag <sigh> atau <breath>, jadi kita bersihin dulu teksnya
            azure_text = re.sub(r'<[^>]*>', '', processed)
            
            # SSML Custom biar Gadis suaranya lebih ceria & punya karakter (Youthful Mentor)
            ssml = f"""
            <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='id-ID'>
                <voice name='id-ID-GadisNeural'>
                    <prosody pitch='+8%' rate='{speed}'>
                        {azure_text}
                    </prosody>
                </voice>
            </speak>
            """
            
            synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=None)
            result = synthesizer.speak_ssml_async(ssml).get()
            
            if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                audio_data = result.audio_data
                print(f"✅ Azure Synthesis Success ({len(audio_data)} bytes)")
                
                # Save for debug
                timestamp = int(time.time())
                debug_filename = os.path.join(DEBUG_DIR, f"debug_azure_{timestamp}.wav")
                with open(debug_filename, "wb") as f:
                    f.write(audio_data)
                
                return send_file(io.BytesIO(audio_data), mimetype="audio/wav")
            elif result.reason == speechsdk.ResultReason.Canceled:
                cancellation_details = result.cancellation_details
                print(f"❌ Azure Canceled: {cancellation_details.reason}")
                if cancellation_details.reason == speechsdk.CancellationReason.Error:
                    print(f"   Error Details: {cancellation_details.error_details}")
                    print(f"   Error Code: {cancellation_details.error_code}")
                print("🔄 Falling back to Sherpa...")
            else:
                print(f"❌ Azure Unexpected Reason: {result.reason}. Falling back to Sherpa...")

        # ── SHERPA GENERATE (Default/Fallback) ─────────
        print("🎙️ Using Sherpa-ONNX Local Engine...")
        cfg = sherpa_onnx.GenerationConfig()
        cfg.sid   = sid
        cfg.speed = speed
        cfg.extra["lang"] = "id"

        audio_chunks = []
        sample_rate  = None

        for sent in sentences:
            sent = sent.strip()
            if not sent:
                continue
            audio = tts.generate(sent, cfg)
            if audio and audio.samples:
                audio_chunks.append(np.array(audio.samples, dtype=np.float32))
                sample_rate = audio.sample_rate

        if not audio_chunks or sample_rate is None:
            return "Empty audio output", 500

        # ── Concat dengan crossfade ───────────────────
        final = crossfade_concat(audio_chunks, sample_rate, fade_ms=30)

        # Save for debug
        timestamp = int(time.time())
        debug_filename = os.path.join(DEBUG_DIR, f"debug_{timestamp}.wav")
        sf.write(debug_filename, final, sample_rate)
        print(f"💾 Audio saved for debug: {debug_filename}")

        buf = io.BytesIO()
        sf.write(buf, final, sample_rate, format='WAV')
        buf.seek(0)

        return send_file(buf, mimetype="audio/wav")

    except Exception as e:
        import traceback; traceback.print_exc()
        return str(e), 500


@app.route('/debug_text', methods=['POST'])
def debug_text():
    """Endpoint untuk cek preprocessing saja (tanpa generate audio)."""
    data     = request.json or {}
    raw_text = data.get('text', '')
    processed = clean_for_tts(raw_text)
    sentences = split_to_sentences(processed)
    return jsonify({
        "raw":       raw_text,
        "processed": processed,
        "chunks":    sentences,
        "n_chunks":  len(sentences),
    })


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "version": "v3", "model": MODEL_DIR})


if __name__ == '__main__':
    print("\n" + "═"*60)
    print("🚀 VOKARA TTS Server v3 — Hybrid Mode Ready!")
    print(f"   Current Dir : {os.getcwd()}")
    print(f"   Model Dir   : {MODEL_DIR}")
    print(f"   Port        : 5001")
    
    # Check Azure Config
    has_key = "✅ Terdeteksi" if AZURE_SPEECH_KEY and AZURE_SPEECH_KEY != "MASUKKAN_KEY_AZURE_DISINI" else "❌ BELUM DIISI"
    print(f"   Azure Key   : {has_key}")
    print(f"   Azure Region: {AZURE_REGION}")
    
    if AZURE_SPEECH_KEY == "MASUKKAN_KEY_AZURE_DISINI":
        print("\n   💡 TIPS: Isi AZURE_SPEECH_KEY di file .env buat aktifin Azure.")
    
    print("═"*60 + "\n")
    app.run(host='0.0.0.0', port=5001, debug=True)