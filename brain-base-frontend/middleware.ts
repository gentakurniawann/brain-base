import { NextResponse, type NextRequest } from 'next/server';

const publicAssetPatterns = [/^\/_next\//, /^\/images\//, /^\/fonts\//, /^\/favicon/, /^\/api\//];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isPublicAsset = publicAssetPatterns.some((p) => p.test(path));
  if (isPublicAsset) return NextResponse.next();

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
