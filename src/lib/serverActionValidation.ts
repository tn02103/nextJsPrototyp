import "server-only";
import { AuthRole } from "./authRole";
import { auth } from "./authentication/auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "next-auth/react";
import { User } from "next-auth";

export const genericSAValidator = async <T>(props: {
    requiredRole: AuthRole,
    data?: any,
    schema?: z.ZodType<T>,
}): Promise<[User, T | null]> => {
    const session = await auth();

    if (!session || !session.user) {
        return redirect('/login');
    }
    if (session.user.role < props.requiredRole) {
        throw new Error('User not Authorized for SA');
    }
    if (!props.schema) {
        return [session.user, null]
    }
    if (!props.data) {
        throw new Error('SA Implementation Error: ZodSchema but no Data Provided');
    }

    const zodResult = props.schema.safeParse(props.data);
    if (!zodResult.success) {
        throw new Error('Props not valid');
    }

    return [session.user, zodResult.data]
}