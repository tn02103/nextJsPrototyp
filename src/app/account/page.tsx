import { auth } from "@/lib/authentication/auth";
import { getPrisma } from "@/lib/db";
import { Button, Col, Row, Table } from "react-bootstrap";
import AccountAuthenticatorActions from "./autenticatorActions";
import { AuthRole } from "@/lib/authRole";
import { Secret } from "otpauth";
import ChangePasswordButton from "./changePasswordButton";
import { changePasswordFunction } from "@/actions/changePassword";

export default async function AccountPage() {
    const session = await auth();
    if (!session?.user) return <></>;


    const user = await getPrisma(session!.user!.assosiation.id).user.findUnique({
        where: { id: session!.user!.id },
        include: {
            towFactorApp: true
        }
    });
    if (!user) return <></>;

    console.log("🚀 ~ AccountPage ~ user:", user);

    const userId = session.user.id;
    async function csrfProtectedChangePasswordAction(data: { password: string, newPassword: string }): Promise<void> {
        "use server";

        await changePasswordFunction({
            password: data.password,
            newPassword: data.newPassword,
            userId: userId
        });
    }

    return (
        <div className="container-lg content-center bg-light rounded p-0 pt-2 position-relative">
            <h1 className="text-center">Mein Account</h1>
            <Row className="justify-content-center m-0">
                <Col xs={"auto"} className="p-0 p-md-4">
                    <Table className="ps-2">
                        <tbody>
                            <tr>
                                <th className="text-end">Nutzername:</th>
                                <td>{user.username}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <th className="text-end">Rolle</th>
                                <td>{getUserRoleTranslation(user.role)}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <th className="text-end">Name</th>
                                <td>{user.name}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <th className="text-end">E-mail</th>
                                <td>{user.email}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <th className="text-end">Password</th>
                                <td>********</td>
                                <td>
                                    <ChangePasswordButton action={csrfProtectedChangePasswordAction} />
                                </td>
                            </tr>
                            <tr>
                                <th className="text-end">Authenticator</th>
                                {(user.towFactorApp)
                                    ? <td>
                                        <Row className="w-auto">
                                            <Col xs={6} className="text-end">Gerät:</Col>
                                            <Col xs={6}>{user.towFactorApp.appName}</Col>
                                            <Col xs={6} className="text-end">Verifiziert:</Col>
                                            <Col xs={6}>{user.towFactorApp.verified ? "Ja" : "Nein"}</Col>
                                            <Col xs={6} className="text-end"></Col>
                                            <Col xs={6}>{user.usingAuthenticator ? "Aktiv" : "Inaktiv"}</Col>
                                        </Row>
                                    </td>
                                    : <td>
                                        ---
                                    </td>
                                }
                                <AccountAuthenticatorActions authenticator={user.towFactorApp} />
                            </tr>
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </div>
    )
}


function getUserRoleTranslation(role: AuthRole) {
    switch (role) {
        case AuthRole.admin: return "Admin";
        case AuthRole.manager: return "Manager";
        case AuthRole.user: return "Nutzer";
    }
}
