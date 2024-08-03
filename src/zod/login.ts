import { z } from "zod";

export const loginFormSchema = z.object({
    acronym: z.string({}).regex(/^\w*$/).max(6).min(3),
    username: z.string().min(1).max(10),
    password: z.string().min(1),
    token: z.string().regex(/^\d{6}$/).nullable().optional(),
});
export type LoginFormSchema = z.infer<typeof loginFormSchema>