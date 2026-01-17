import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value

    // Define protected routes
    const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

    // If trying to access protected route without token, redirect to login
    if ((isDashboardRoute || isAdminRoute) && !token) {
        const loginUrl = new URL('/auth/login', request.url)
        // Optional: Add redirect param to return after login
        // loginUrl.searchParams.set('from', request.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Allow request to proceed
    return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/admin/:path*',
    ],
}
