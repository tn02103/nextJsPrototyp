import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./lib/authentication/auth.config";
import { AuthRole } from "./lib/authRole";

const { auth } = NextAuth(authConfig)
export default auth((request) => {
    const session = request.auth;
    const pathname = decodeURIComponent(request.nextUrl.pathname);
   
    if (!session || !session.user) {
        if (publicPaths.includes(pathname)) {
            return;
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (pathname.startsWith('/admin') && session.user.role < AuthRole.admin) {
        return NextResponse.rewrite(new URL('/403', request.url))
    }
});
const publicPaths = [
    "/login",
    "/public",
    "/public/subpage"
];

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