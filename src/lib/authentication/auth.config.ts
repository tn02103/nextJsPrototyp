import { NextAuthConfig, User } from "next-auth";
import { getPrisma } from "../db";
import { JWT } from "next-auth/jwt";

export const authConfig = {
    pages: {
    },
    session: {
        strategy: "jwt",
        maxAge: 12 * 60 * 60, //12 hours
        updateAge: 60 * 60, //1 hours
    },
    callbacks: {
        async jwt({ session, user, token }) {
            console.log("🚀 ~ jwt ~ session, user, token:", session, user, token)
            if (user) {
                const dbUser = await getPrisma(user.assosiation.id).user.findUnique({
                    where: { id: user.id, active: true },
                });
                if (dbUser) {
                    return {
                        user: {
                            id: user.id!,
                            name: user.name!,
                            role: user.role!,
                            email: user.email!,
                            assosiation: {
                                id: user.assosiation.id!,
                                name: user.assosiation.name!
                            }
                        }
                    } satisfies JWT
                }

            } else if (token) {
                // TODO check for blocked tokenId
               return token;
            }
            return null;
        },
        async session({ session, token, user }) {
            console.log("🚀 ~ session ~ session, token, user :", session, token, user);
            if (token) {
                console.log(' ~ session ~ with token');
                return {
                    ...session,
                    user: token.user,
                }
            } else {
                console.log(' ~ session ~ without token');
                return {
                    ...session,
                    user: null
                }
            }
        },
    },
    providers: []
} satisfies NextAuthConfig;
