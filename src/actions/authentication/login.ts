"use server"

import { signIn } from "@/lib/authentication/auth";
import { LoginFormSchema } from "@/zod/login";
import { faHourglassEmpty } from "@fortawesome/free-solid-svg-icons";

export async function login(data: LoginFormSchema) {
    return signIn('credentials', data).catch(e => {
        if (e.message === "NEXT_REDIRECT") {
            // This error gets thrown if authentication was successfull
            return {
                error: false,
                logedIn: true,
            }
        }

        return {
            error: e.code !== "two factor required",
            logedIn: false,
        }
    });
}
