

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { customCredentialProvider } from "./credentialsProvider";


export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        customCredentialProvider
    ],
 });
