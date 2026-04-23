import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "better-auth/types";

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const isDev = process.env.NODE_ENV === "development";
    // 1. FAST PATH: Dev Preview Bypass (STRICTLY DEVELOPMENT ONLY)
    // If a role param or cookie is provided in dev, bypass session check entirely
    if (isDev) {
        const roleParam = request.nextUrl.searchParams.get("role");
        const cookieRole = request.cookies.get("ems-role")?.value;
        const devRole = roleParam || cookieRole;

        if (devRole) {
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set("x-ems-role", devRole.toUpperCase());
            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                }
            });
        }
    }

    // 2. Explicitly allow auth routes
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');

    // 3. Blocking session check (Only if not bypassing)
    const { data: session } = await betterFetch<Session>(
        "/api/auth/get-session",
        {
            baseURL: request.nextUrl.origin,
            headers: {
                cookie: request.headers.get("cookie") || "",
            },
        },
    );

    if (!session) {
        if (!isAuthRoute && !pathname.startsWith('/api') && !pathname.startsWith('/_next') && pathname !== '/') {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        return NextResponse.next();
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
