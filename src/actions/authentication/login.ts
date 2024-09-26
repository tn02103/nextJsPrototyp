"use server"

import { signIn } from "@/lib/authentication/auth";
import { LoginFormSchema } from "@/zod/login";

export async function login(data: LoginFormSchema) {
    return signIn('credentials', 
        { ...data, redirect: false }
    ).then(() => {
        return {
            error: false,
            logedIn: true,
        }
    }).catch(e => {
        return {
            error: e.code !== "two factor required",
            logedIn: false,
        }
    });
}
