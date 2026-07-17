import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Protección de rutas por sesión. La cookie httpOnly `access_token` (emitida por
 * la API) es legible aquí en el servidor, no en el cliente. Sin sesión, las
 * rutas privadas redirigen a /login; con sesión, /login redirige al dashboard.
 *
 * Es una comprobación de presencia; la validación real del JWT la hace la API
 * en cada petición.
 */
const PUBLIC_PATHS = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has('access_token');
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!hasSession && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (hasSession && isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Protege todo excepto assets estáticos y la raíz de la API de Next.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
