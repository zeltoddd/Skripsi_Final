import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { input } = body;

    if (!input || !Array.isArray(input)) {
      return NextResponse.json({ error: 'Input must be an array of strings' }, { status: 400 });
    }
    
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
      console.error('SERVER ERROR: NVIDIA API Key is missing for embeddings proxy');
      return NextResponse.json({ error: 'NVIDIA API Key tidak ditemukan.' }, { status: 500 });
    }

    console.log(`SERVER: Proxying ${input.length} embedding vectors to NVIDIA NIM`);

    const response = await fetch('https://integrate.api.nvidia.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input,
        model: 'nvidia/llama-nemotron-embed-1b-v2',
        input_type: 'query',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NVIDIA NIM Embeddings Error response:', errorText);
      return NextResponse.json({ error: `NVIDIA NIM Embeddings Error: ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('NVIDIA Embed Proxy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
