import NextAuth, { DefaultSession } from "next-auth";
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import config from "@lib/config";
import { getExpirationDate, verifyToken } from "@lib/jwt";
import { resolveBaseUrl } from "@lib/utils";

declare module "next-auth/jwt" {
    interface JWT {
        accessToken: string | null;
        expiresAt?: number;
        refreshToken: string | null;
        sessionExpired?: boolean;
    }
}

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            accessToken: string | null;
            refreshToken: string | null;
            sessionExpired: boolean;
        } & DefaultSession["user"];
    }
    interface User {
        access: string;
        refresh: string;
    }
}

async function refreshToken(
    accessToken?: string | null,
    refreshToken?: string | null
): Promise<
    | {
          access: string;
          refresh: string;
      }
    | string
    | boolean
    | null
> {
    try {
        const result = await verifyToken(accessToken);

        if (!result && refreshToken) {
            const res = await fetch(
                resolveBaseUrl() + "/api/auth/token/refresh/",
                {
                    method: "POST",
                    body: JSON.stringify({
                        refresh: refreshToken,
                    }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            const newToken = await res.json();

            if (res.ok) {
                return newToken;
            }

            return null;
        }
    } catch (e) {
        console.log(e);
    }

    return false;
}

export const authOptions: AuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: "Username and password",
            credentials: {
                email: {
                    label: "email",
                    type: "email",
                    placeholder: "jsmith@example.com",
                },
                password: { label: "Password", type: "password" },
                refreshToken: {},
            },
            async authorize(credentials) {
                if (credentials?.refreshToken) {
                    return await refreshToken(null, credentials?.refreshToken);
                }

                const payload = {
                    email: credentials?.email || "",
                    password: credentials?.password || "",
                };
                const res = await fetch(resolveBaseUrl() + "/api/auth/token/", {
                    method: "POST",
                    body: JSON.stringify(payload),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const user = await res.json();

                if (res.ok) {
                    return user;
                }

                // Return null if user data could not be retrieved
                return null;
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/login",
    },
    callbacks: {
        async jwt({ token, user, account }) {
            // Initial login
            if (account && user) {
                const payload = await verifyToken(user.access);

                return {
                    ...token,
                    accessToken: user.access,
                    refreshToken: user.refresh,
                    expiresAt: getExpirationDate(payload) || 0,
                };
            }

            if (token.expiresAt && token.expiresAt * 1000 < Date.now()) {
                const newToken = await refreshToken(
                    token.accessToken,
                    token.refreshToken
                );

                if (
                    newToken &&
                    typeof newToken !== "boolean" &&
                    typeof newToken !== "string"
                ) {
                    const payload = await verifyToken(newToken.access);

                    if (payload) {
                        return {
                            ...token,
                            accessToken: newToken.access,
                            refreshToken: newToken.refresh,
                            expiresAt: getExpirationDate(payload) || 0,
                        };
                    }
                }

                return {
                    ...token,
                    accessToken: "",
                    refreshToken: "",
                    sessionExpired: true,
                };
            }

            return token;
        },

        async session({ session, token }) {
            if (session && session.user) {
                session.user.accessToken = token.accessToken || "";
                session.user.refreshToken = token.refreshToken || "";
                session.user.sessionExpired = token.sessionExpired || false;
            }

            return session;
        },
    },
    theme: {
        colorScheme: "auto", // "auto" | "dark" | "light"
        brandColor: "", // Hex color code #33FF5D
        logo: "/logo.png", // Absolute URL to image
    },
    // Enable debug messages in the console if you are having problems
    debug: process.env.NODE_ENV === "development" || config("DEBUG", "boolean"),
};

export default NextAuth(authOptions);
