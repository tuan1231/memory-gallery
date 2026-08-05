import { NextResponse } from 'next/server';
import { decryptSession } from './app/lib/session';

export async function middleware(request) {
  const sessionToken = request.cookies.get('auth_session')?.value;
  let currentUser = null;
  
  if (sessionToken) {
    const payload = await decryptSession(sessionToken);
    if (payload && payload.username) {
      currentUser = payload.username;
    }
  }
  
  if (!currentUser && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (currentUser && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.webp|.*\\.mp4|.*\\.webm).*)',
  ],
}
