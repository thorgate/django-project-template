import { withAuth } from "next-auth/middleware";

/**
 * NextAuth middleware to protect pages that require authentication to access
 *
 * ref: https://next-auth.js.org/configuration/nextjs#middleware
 */
export default withAuth({
    pages: {
        signIn: "/auth/login",
    },
    callbacks: {
        authorized: ({ token }) =>
            !!(
                token?.accessToken &&
                token?.refreshToken &&
                !token?.sessionExpired
            ),
    },
});

/**
 * Matcher for pages that require authentication to access
 *  Matcher is a regex string, e.g. '/((?!api|_next/static|_next/image|favicon.ico).*)',
 *  which matches all routes except those starting with /api, /_next/static, /_next/image, /favicon.ico
 *
 *  ref: https://nextjs.org/docs/advanced-features/middleware
 *
 * @type {{matcher: string[]}}
 */
export const config = { matcher: ["/user-details"] };
