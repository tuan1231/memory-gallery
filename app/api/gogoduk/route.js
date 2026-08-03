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
    if (action === 'suggest') {
      const input = searchParams.get('input');
      const res = await fetch(`https://api.gogoduk.com/v1/suggest?input=${encodeURIComponent(input)}&lang=vi`, {
        headers
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }
    
    if (action === 'resolve') {
      const id = searchParams.get('id');
      const res = await fetch(`https://api.gogoduk.com/v1/place/resolve?id=${id}&lang=vi`, {
        headers
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }
    
    if (action === 'reverse') {
      const lat = searchParams.get('lat');
      const lon = searchParams.get('lon');
      const res = await fetch(`https://api.gogoduk.com/v1/reverse?point.lat=${lat}&point.lon=${lon}&lang=vi`, {
        headers
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
