import { z } from "zod";


export const authenticatorAppNameSchema = z.object({
    name: z.string().max(30).min(1).regex(/^[\w -\d]*$/gm),
});
export type authenticatorAppNameSchema = z.infer<typeof authenticatorAppNameSchema>;

export const passwordSchema = z.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/);

export const changePasswordFormSchema = z.object({
    password: z.string(),
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
});
export type changePasswordFormSchema = z.infer<typeof changePasswordFormSchema>;
