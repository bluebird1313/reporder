import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Create supabase client for middleware
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get auth token from request headers
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                req.cookies.get('sb-access-token')?.value

  if (token) {
    // Set the auth token
    supabase.auth.setSession({
      access_token: token,
      refresh_token: req.cookies.get('sb-refresh-token')?.value || ''
    })
  }

  // Check auth for protected routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If no session and trying to access dashboard, redirect to sign-in
    if (!session) {
      const redirectUrl = new URL('/sign-in', req.url)
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If authenticated and trying to access auth pages, redirect to dashboard
  if (req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up')) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up']
} 