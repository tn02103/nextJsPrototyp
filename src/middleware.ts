import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "./lib/authentication/auth.config";
import { userAdministrationFormSchema } from "./zod/user";
import { AuthRole } from "./lib/authRole";

const { auth } = NextAuth(authConfig)


export default auth((request) => {
    const session = request.auth
    const pathname = request.nextUrl.pathname;
    console.log("🚀 ~ auth middleware:", request.auth, session, pathname)

    if (!session || !session.user) {
        if (pathname.startsWith("/public") || pathname.startsWith("/login")) {
            return;
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }


    if (pathname.startsWith('/admin') && session.user.role < AuthRole.admin) {
        return NextResponse.rewrite('/403')
    }
    
});

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}