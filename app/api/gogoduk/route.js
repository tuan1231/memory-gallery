import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  const apiKey = process.env.NEXT_PUBLIC_GOGODUK_API_KEY || '';

  const headers = { 'X-API-Key': apiKey };
  const origin = request.headers.get('origin') || request.headers.get('referer');
  if (origin) {
    headers['Origin'] = origin;
    headers['Referer'] = origin;
  }

  try {
    const handleFetch = async (url) => {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const text = await res.text();
        console.error(`Gogoduk API Error (${res.status}):`, text);
        throw new Error(`Gogoduk API Error: ${res.status}`);
      }
      return await res.json();
    };

    if (action === 'suggest') {
      const input = searchParams.get('input');
      const data = await handleFetch(`https://api.gogoduk.com/v1/suggest?input=${encodeURIComponent(input)}&lang=vi`);
      return NextResponse.json(data);
    }
    
    if (action === 'resolve') {
      const id = searchParams.get('id');
      const data = await handleFetch(`https://api.gogoduk.com/v1/place/resolve?id=${id}&lang=vi`);
      return NextResponse.json(data);
    }
    
    if (action === 'reverse') {
      const lat = searchParams.get('lat');
      const lon = searchParams.get('lon');
      const data = await handleFetch(`https://api.gogoduk.com/v1/reverse?point.lat=${lat}&point.lon=${lon}&lang=vi`);
      return NextResponse.json(data);
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
