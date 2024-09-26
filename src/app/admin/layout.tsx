import { auth } from "@/lib/authentication/auth";
import { AuthRole } from "@/lib/authRole";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import Error403Page from "../403/page";

export default async function Layout({ children }: { children: ReactNode }) {
    const session = await auth();
    if (!session || !session.user) {
        return redirect('/login');
    }
    if ( session.user.role < AuthRole.admin) {
        return Error403Page();
    }

    return children;
}