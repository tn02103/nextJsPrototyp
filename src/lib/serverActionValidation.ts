import { compare } from "bcrypt";
import { User } from "next-auth";
import { redirect } from "next/navigation";
import { RateLimiterMemory } from "rate-limiter-flexible";
import "server-only";
import { z } from "zod";
import { AuthRole } from "./authRole";
import { auth } from "./authentication/auth";
import { getPrisma } from "./db";

const failedReauthenticationLimiter = new RateLimiterMemory({
    points: 15, // 15 failed attempts allowed
    duration: 60 * 15, // reset after 15 minutes
});

/**
 * validation for ServerActions
 * !IMPORTANT! when using extra csrf-Protection. Implementation must not be serverAction, but called from enclosed ServerAction. userId should be passed through the encloser.
 * @param props 
 * 
 * @returns 
 */
export const genericSAValidator = async <T>(props: {
    requiredRole: AuthRole,
    data: any,
    schema: z.ZodType<T>,
    reauthenticate?: "password",
    csrfProtected?: boolean,
}): Promise<[User, T]> => {
    const session = await auth();

    if (!session || !session.user) {
        return redirect('/login');
    }
    if (session.user.role < props.requiredRole) {
        throw new Error('User not Authorized for SA');
    }

    const zodResult = props.schema.safeParse(props.data);
    if (!zodResult.success) {
        throw new Error('Props not valid');
    }

    if (props.csrfProtected && session.user.id !== (zodResult.data as any).userId) {
        throw new Error('CSRF Protection for SA failed');
    }

    if (props.reauthenticate === "password") {
        const count = await failedReauthenticationLimiter.get(session.user.id);
        if (count && count.remainingPoints <= 0) {
            throw new Error('Requthentication ratelimit reached: ' + session.user.id);
        }

        const user = await getPrisma(session.user.assosiation.id).user.findUnique({
            select: { password: true },
            where: {
                id: session.user.id,
                active: true
            }
        });

        const password = (zodResult.data as any).password

        if (!password || !user || !await compare(password, user.password)) {
            failedReauthenticationLimiter.consume(session.user.id);
            throw new Error('Reauthentication failed');
        }
    }


    return [session.user, zodResult.data]
}

export const genericSANoDataValidator = async <T>(props: {
    requiredRole: AuthRole,
}): Promise<User> => {
    const session = await auth();

    if (!session || !session.user) {
        return redirect('/login');
    }
    if (session.user.role < props.requiredRole) {
        throw new Error('User not Authorized for SA');
    }

    return session.user
}


