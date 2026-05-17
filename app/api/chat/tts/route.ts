import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  console.log("🚀 API TTS DIPANGGIL (POST)!");
  const body = await req.json().catch(() => ({}));
  const text = body.text;

  console.log("📝 Teks yang diterima:", text?.substring(0, 20) + "...");

  if (!text) {
    console.error("❌ Gagal: Parameter teks kosong");
    return new NextResponse('Missing text parameter', { status: 400 });
  }

  try {
    // Gunakan URL dari Env (misal: link tunnel Cloudflare) atau fallback ke localhost
    const SHERPA_URL = process.env.SHERPA_TTS_URL
      ? `${process.env.SHERPA_TTS_URL}/synthesize`
      : `http://127.0.0.1:5001/synthesize`;

    const engine = body.engine || 'azure';
    const sid = body.sid || '2';
    const speed = body.speed || '1.18';

    console.log(`🤖 Mencoba POST ke TTS [Engine: ${engine}]`);

    if (engine === 'gemini') {
      const apiKey = process.env.GOOGLE_TTS_API_KEY;
      if (!apiKey) {
        throw new Error("GOOGLE_TTS_API_KEY is not set in environment variables");
      }

      console.log("☁️ Memanggil Gemini 3.1 Flash TTS Preview...");
      const geminiUrl = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${apiKey}`;
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioConfig: {
            audioEncoding: "MP3",
            pitch: 0,
            speakingRate: parseFloat(speed) || 1
          },
          input: {
            prompt: "Read aloud in a warm, welcoming, and youthful mentor tone. Sound friendly, empathetic, and human-like.",
            text: text
          },
          voice: {
            languageCode: "id-id",
            modelName: "gemini-3.1-flash-tts-preview",
            name: "Callirrhoe"
          }
        }),
        cache: 'no-store'
      });

      if (!geminiResponse.ok) {
        const errText = await geminiResponse.text();
        console.error(`❌ Gemini TTS Error:`, errText);
        throw new Error(`Gemini TTS Error: ${geminiResponse.status}`);
      }

      const data = await geminiResponse.json();
      // data.audioContent is base64 encoded string
      const audioBuffer = Buffer.from(data.audioContent, 'base64');
      console.log("✅ Gemini TTS Berhasil! Mengirim audio ke client.");

      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // Fallback to Sherpa if engine is not gemini
    const response = await fetch(SHERPA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        engine: engine,
        sid: parseInt(sid),
        speed: parseFloat(speed)
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      console.error(`❌ Sherpa Error Status: ${response.status}`);
      throw new Error(`Sherpa responded with ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    console.log("✅ Sherpa Berhasil! Mengirim audio WAV ke client.");

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('⚠️ Piper Gagal, Fallback ke Google:', error);
    // Kalau Piper mati, kita fallback balik ke Google Translate biar aplikasi gak crash
    const googleFallback = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=id&client=tw-ob`;
    const fallbackRes = await fetch(googleFallback);
    const fallbackBuffer = await fallbackRes.arrayBuffer();

    return new NextResponse(fallbackBuffer, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  }
}
