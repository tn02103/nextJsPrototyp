import { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
    },
    session: {
      strategy: "jwt",
      maxAge: 12 * 60 * 60, //12 hours
      updateAge: 60 * 60, //1 hours
    },
    callbacks: {
      async session({ session, token, user }) {
        console.log("🚀 ~ session ~ session, token, user :", session, token, user )
        if (user) {
          return {
            ...session,
            user: {
              ...session.user,
              id: user?.id,
              email: user?.email,
              name: user?.name,
              assosiation: user.assosiation,
              role: user.role,
            }
          }
        } else {
          return session
        }
      },
    },
    providers: []
  } satisfies NextAuthConfig;
  