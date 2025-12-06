import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/app(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/apps/get-by-domain(.*)',
  '/auth/(.*)',
  '/api/auth/(.*)'
]);


export default clerkMiddleware(async (auth, req) => {
  const { redirectToSignIn } = await auth()
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }
  return redirectToSignIn()
})


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};