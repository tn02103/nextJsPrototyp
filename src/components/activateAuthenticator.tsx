"use client"

import { createTwoFactorApp, verifyTowFactorApp } from "@/actions/account";
import { authenticatorAppNameSchema } from "@/zod/account";
import { zodResolver } from "@hookform/resolvers/zod";
import QRCode, { QRCodeCanvas } from "qrcode.react";
import { useState } from "react";
import { Button, FormControl, Modal, ModalBody, ModalFooter, ModalHeader } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

export default function ActivateAuthenticatorModal({
    onClose
}: {
    onClose: () => void
}) {

    const [step, setStep] = useState(0);
    const [appUri, setAppUri] = useState('');

    // step 0
    const nameForm = useForm<{ name: string }>({
        mode: 'onChange',
        resolver: zodResolver(authenticatorAppNameSchema)
    });
    async function handleSubmitName(data: { name: string }) {
        await createTwoFactorApp(data).then((uri) => {
            setAppUri(uri);
            setStep(1);
        }).catch(e => {
            toast.error('Das erstellen der Authentifcator App ist fehlgeschlagen. Bitte versuchen Sie es erneut');
        });
    }

    // step2
    const tokenForm = useForm<{ token: string }>({
        mode: "onChange",
        resolver: zodResolver(z.object({
            token: z.string().regex(/^\d{6}$/)
        }))
    });
    async function handleSubmitToken(data: { token: string }) {
        await verifyTowFactorApp(data.token).then(() => {
            onClose();
        }).catch(() => {
            toast.error('Der Token konnte nicht validiert werden')
        })
    }

    return (
        <Modal show onHide={onClose}>
            <ModalHeader>
                Authenticator aktivieren
            </ModalHeader>
            {(step === 0) &&
                <form onSubmit={nameForm.handleSubmit(handleSubmitName)}>
                    <ModalBody>
                        Name des Geräts auf dem der Authenticator läuft:
                        <FormControl
                            isInvalid={!!nameForm.formState.errors.name}
                            {...nameForm.register('name')}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button type="submit">Weiter</Button>
                    </ModalFooter>
                </form>
            }
            {(step === 1) &&
                <>
                    <ModalBody>
                        Bitte Scannen Sie den QR Code um den Authenticator hinzuzufügen.<br />
                        <div className="text-center p-4">
                            <QRCode value={appUri} />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={() => setStep(2)}>
                            Weiter
                        </Button>
                    </ModalFooter>
                </>
            }
            {(step === 2) &&
                <form onSubmit={tokenForm.handleSubmit(handleSubmitToken)}>
                    <ModalBody>
                        Zum aktivieren der App bitte den Token der App eingeben
                        <FormControl
                            isInvalid={!!tokenForm.formState.errors.token}
                            {...tokenForm.register('token')} />
                    </ModalBody>
                    <ModalFooter>
                        <Button type="submit">
                            Speichern
                        </Button>
                    </ModalFooter>
                </form>
            }
        </Modal>
    )
}
