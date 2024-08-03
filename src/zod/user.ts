import { AuthRole } from "@/lib/authRole";
import { z } from "zod";


export const userAdministrationFormSchema = z.object({
    username: z.string().max(6, 'darf nicht Länger als 10 Zeichen sein'),
    name: z.string().max(20, 'Der Name darf nicht Länger wie 20 Zeichen sein'),
    email: z.string().email(),
    role: z.nativeEnum(AuthRole),
    active: z.boolean(),
});
export type userAdministrationFormSchema = z.infer<typeof userAdministrationFormSchema>;