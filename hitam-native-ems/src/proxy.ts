import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "better-auth/types";

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    
    // Explicitly allow auth routes
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');

    // Make an internal fetch to better-auth
    const { data: session } = await betterFetch<Session>(
        "/api/auth/get-session",
        {
            baseURL: request.nextUrl.origin,
            headers: {
                cookie: request.headers.get("cookie") || "", // Pass cookies
            },
        },
    );

    if (!session) {
        // Dev Preview Bypass - STRICTLY DEVELOPMENT ONLY
        const isDev = process.env.NODE_ENV === "development";
        const roleParam = request.nextUrl.searchParams.get("role");
        
        if (isDev && roleParam) {
           const requestHeaders = new Headers(request.headers);
           requestHeaders.set("x-ems-role", roleParam.toUpperCase());
           return NextResponse.next({
               request: {
                   headers: requestHeaders,
               }
           });
        }

        if (!isAuthRoute && !pathname.startsWith('/api') && !pathname.startsWith('/_next') && pathname !== '/') {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        return NextResponse.next();
    }

    // Even if logged in, allow for role overrides in dev
    if (process.env.NODE_ENV === "development") {
        const roleParam = request.nextUrl.searchParams.get("role");
        if (roleParam) {
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set("x-ems-role", roleParam.toUpperCase());
            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                }
            });
        }
    }

    // If logged in and trying to access login/signup, redirect to dashboard
    if (isAuthRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
