import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Protects all routes except static files and the root
    '/((?!_next|.*\\..*|favicon.ico).*)',
  ],
}; 