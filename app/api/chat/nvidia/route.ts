
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, model, temperature, top_p, max_tokens, stream } = body;
    
    // Read key from Authorization header if provided and valid (not empty/dummy)
    const authHeader = req.headers.get('Authorization') || '';
    let apiKey = '';
    if (authHeader.startsWith('Bearer ')) {
      const clientKey = authHeader.slice(7).trim();
      if (clientKey && clientKey !== 'dummy_key') {
        apiKey = clientKey;
      }
    }

    // Fallback to environment variable
    if (!apiKey) {
      apiKey = process.env.NEXT_PUBLIC_NVIDIA_API_KEY || (process.env as any).VITE_NVIDIA_API_KEY || '';
    }

    if (!apiKey || apiKey === 'dummy_key') {
      console.error('SERVER ERROR: NVIDIA API Key is missing from both request and environment');
      return NextResponse.json({ error: 'NVIDIA API Key tidak ditemukan. Silakan hubungi pengembang atau konfigurasi environment variables.' }, { status: 500 });
    }
    
    console.log('SERVER: Proxying request to NVIDIA using key:', apiKey.slice(0, 8) + '...');

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        top_p,
        max_tokens,
        stream: true, // Enable streaming
      }),
    });

    // Proxy the stream with headers to disable buffering (critical for Cloudflare/Nginx)
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable buffering for Nginx/Cloudflare
        'Content-Encoding': 'none', // Prevent Cloudflare from trying to compress the stream
      },
    });
  } catch (error: any) {
    console.error('NVIDIA Proxy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
