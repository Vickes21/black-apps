import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/app(.*)',
  '/api/apps/get-by-domain(.*)',
  '/api/apps/public(.*)',
]);


export default clerkMiddleware(async (auth, req) => {
  console.log('Proxy middleware called for:', req.url);
  if (!isPublicRoute(req)) {

    console.log('Protecting route:', req.url);
    await auth.protect()
  }
})


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};