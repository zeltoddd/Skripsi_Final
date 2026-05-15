import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  console.log("🚀 API TTS DIPANGGIL!"); // Log pertama banget
  const { searchParams } = new URL(req.url);
  const text = searchParams.get('text');

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

    const engine = searchParams.get('engine') || 'azure'; // Default ke azure buat ngetes
    const sid = searchParams.get('sid') || '2';
    const speed = searchParams.get('speed') || '1.0';

    console.log(`🤖 Mencoba POST ke Python Server [Engine: ${engine}]: ${SHERPA_URL}`);

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
