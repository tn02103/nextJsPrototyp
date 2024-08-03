"use server"

import { AuthRole } from "@/lib/authRole"
import { getPrisma } from "@/lib/db"
import { genericSAValidator } from "@/lib/serverActionValidation"


export const getUserList = () => genericSAValidator({
    requiredRole: AuthRole.admin
}).then(([{ assosiation }]) => {
    console.log("🚀 ~ getUserList ~ assosiation:", assosiation)
    
    return getPrisma(assosiation.id).user.findMany();
});