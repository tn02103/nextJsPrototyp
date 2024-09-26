"use server";

import { AuthRole } from "@/lib/authRole";
import { getPrisma } from "@/lib/db";
import { genericSAValidator } from "@/lib/serverActionValidation";
import { authenticatorAppNameSchema } from "@/zod/account";
import { revalidatePath } from "next/cache";
import { Secret, TOTP } from "otpauth";
import { z } from "zod";

export const createTwoFactorApp = (props: authenticatorAppNameSchema) => genericSAValidator({
    requiredRole: AuthRole.user,
    data: props,
    schema: authenticatorAppNameSchema
}).then(async ([user, { name }]) => getPrisma(user.assosiation.id).$transaction(async (client) => {
    const dbUser = await client.user.findUniqueOrThrow({
        where: {
            id: user.id
        },
        include: {
            towFactorApp: true,
            assosiation: true
        },
    });

    if (dbUser?.towFactorApp) throw new Error('Two Factor App for user allready configured');

    const secret = new Secret({ size: 32 });
    const totp = new TOTP({
        label: user.name!,
        issuer: 'NextJs-Prototype-'+dbUser.assosiation.acronym,
        digits: 6,
        period: 30,
        secret,
    });

    await client.twoFactorApp.create({
        data: {
            secret: secret.base32,
            userId: user.id!,
            appName: name,
            verified: false,
        }
    });

    return totp.toString();
}))

export const verifyTowFactorApp = (props: string) => genericSAValidator({
    requiredRole: AuthRole.user,
    data: props,
    schema: z.string().regex(/^\d{6}$/),
}).then(async ([user, token]) => getPrisma(user.assosiation.id).$transaction(async (client) => {

    const app = await client.twoFactorApp.findUnique({
        where: { userId: user.id },
        select: {
            id: true,
            secret: true,
            verified: true,
        },
    });

    if (!app) throw new Error('Could not verify TwoFactorApp. NullValueException');
    if (app.verified) throw new Error('App already verified');

    const totp = new TOTP({
        secret: app.secret
    });

    const t = totp.validate({
        token,
        window: 3
    });
    if (!Number.isInteger(t)) throw new Error('Token is invalid');

    await client.twoFactorApp.update({
        where: { id: app.id },
        data: { verified: true }
    });
    await client.user.update({
        where: { id: user.id },
        data: {
            usingAuthenticator: true,
        }
    });
    revalidatePath('/account', 'page');
}));

const deleteTwoFactorAppPropShema = z.object({
    password: z.string(),
})
type deleteTwoFactorAppPropShema = z.infer<typeof deleteTwoFactorAppPropShema>;
export const deleteTwoFactorApp = (props: deleteTwoFactorAppPropShema) => genericSAValidator({
    requiredRole: AuthRole.user,
    data: props,
    schema: deleteTwoFactorAppPropShema,
    reauthenticate: "password",
}).then(([user,]) => getPrisma(user.assosiation.id).$transaction(async (client) => {
    await client.twoFactorApp.delete({
        where: { userId: user.id }
    });
    await client.user.update({
        where: { id: user.id },
        data: { usingAuthenticator: false }
    });
    revalidatePath('/account', 'page');
}));
