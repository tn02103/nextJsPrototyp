"use client"

import { deleteTwoFactorApp } from "@/actions/account"
import { useModal } from "@/components/modalProvider"
import { TwoFactorApp } from "@prisma/client"
import { Button } from "react-bootstrap"
import { toast } from "react-toastify"

export default function AccountAuthenticatorActions({
    authenticator
}: {
    authenticator: TwoFactorApp | null
}) {
    const modal = useModal();

    function handleDeleteAuthenticator() {
        modal?.passwordReauthenticationModal(
            (password) => deleteTwoFactorApp({password}).catch(() => {
                toast.error('Beim Löschen der Authenticator-App ist ein Fehler aufgetreten.')
            }),
        );
    }

    if (authenticator) {
        return (
            <td>
                <Button size="sm" variant="outline-danger" onClick={handleDeleteAuthenticator} >
                    Löschen
                </Button>
            </td>
        );
    } else {
        return (
            <td>
                <Button onClick={() => modal?.activateAuthenticatorModal()} size="sm" variant="outline-primary">
                    Jetzt Aktivieren
                </Button>
            </td>
        );
    }
}