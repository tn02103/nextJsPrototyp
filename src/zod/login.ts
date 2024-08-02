import { z } from "zod";

export const loginFormSchema = z.object({
    acronym: z.string({}).regex(/^\w*$/).max(6).min(3),
    username: z.string().max(10),
    password: z.string(),
    token: z.string().regex(/^\d{6}$/).nullable().optional(),
});
export type LoginFormSchema = z.infer<typeof loginFormSchema>