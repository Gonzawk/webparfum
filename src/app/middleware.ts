// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Rutas protegidas
  const protectedPaths = ['/productos', '/ventas', '/admin-usuarios'];
  const { pathname } = request.nextUrl;

  // Si la ruta no es protegida, continuar
  if (!protectedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Leer token desde la cookie
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Decodificar el token (suponemos que el claim "role" está presente)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);

    // Verifica que el rol sea Admin o Superadmin
    if (payload.role !== 'Admin' && payload.role !== 'Superadmin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/productos/:path*', '/ventas/:path*', '/admin-usuarios/:path*'],
};
