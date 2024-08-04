import "server-only";

import { AuthRole } from "@/lib/authRole";
import { getPrisma } from "@/lib/db";
import { genericSAValidator } from "@/lib/serverActionValidation";
import { passwordSchema } from "@/zod/account";
import { hash } from "bcrypt";
import { z } from "zod";

// !!! THIS FILE DOES NOT CONTAIN SERVER-ACTIONS.
// all functions must be implemented in Enclosed-ServerActions

const changePasswordPropsSchema = z.object({
    password: z.string(),
    newPassword: passwordSchema,
    userId: z.string().uuid(),
})
type changePasswordPropsSchema = z.infer<typeof changePasswordPropsSchema>;
export const changePasswordFunction = (props: changePasswordPropsSchema) => genericSAValidator({
    requiredRole: AuthRole.user,
    data: props,
    schema: changePasswordPropsSchema,
    reauthenticate: "password",
    csrfProtected: true
}).then(async ([user, { newPassword }]) => {
    await getPrisma(user.assosiation.id).user.update({
        where: { id: user.id },
        data: {
            password: await hash(newPassword, 12)
        }
    })
});
