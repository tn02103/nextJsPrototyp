import { AuthRole } from "@/lib/AuthRoles"
import NextAuth, { DefaultSession } from "next-auth"
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */

    interface User {
        id: string,
        name: string,
        email: string,
        role: AuthRole,
        assosiation: {
            id: string,
            name: string,
        };
    }

    interface Session {
        user: {
            id: string,
            name: string,
            email: string,
            role: AuthRole;
            assosiation: {
                id: string,
                name: string,
            };
        },
        expires: ISODateString;
    }
    interface JWT extends DefaultJWT {
        picture: unknown;
        name: unknown;
        email: unknown;
        user: User
    }
}