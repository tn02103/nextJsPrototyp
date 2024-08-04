"use client";
import { changePasswordFormSchema } from "@/zod/account";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button, FormControl, FormLabel, Modal, ModalBody, ModalFooter, ModalHeader } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

export default function ChangePasswordButton(props: { action: (d: { password: string, newPassword: string }) => Promise<void> }) {
    const { register, formState: { errors }, watch, handleSubmit } = useForm<changePasswordFormSchema>({
        mode: "onChange",
        resolver: zodResolver(changePasswordFormSchema),
    });
    const [showModal, setShowModal] = useState(false);

    const handleChangePassword = (data: changePasswordFormSchema) => {
        props.action({
            password: data.password,
            newPassword: data.newPassword,
        }).then(() => {
            toast.success('Ihr passwort wurder erfolgreich geändert');
        }).catch(() => {
            toast.error('Das Passwort konnte aus einem Unbekannten grund nicht geändert werden');
        });
        setShowModal(false);
    }

    return (
        <>
            <Button onClick={() => setShowModal(true)} variant="outline-primary" size="sm">
                Passwort ändern
            </Button>
            <Modal show={showModal}>
                <ModalHeader>
                    Passwort ändern
                </ModalHeader>
                <form onSubmit={handleSubmit(handleChangePassword)}>
                    <ModalBody>
                        <FormLabel>Ihr altes Password</FormLabel>
                        <FormControl
                            type="password"
                            autoComplete="false"
                            autoFocus
                            isInvalid={!!errors.password}
                            {...register('password')} />
                        <FormLabel>Neues Password</FormLabel>
                        <FormControl
                            type="password"
                            autoComplete="false"
                            isInvalid={!!errors.newPassword}
                            {...register('newPassword')} />
                        <FormLabel>Passwort bestätigen</FormLabel>
                        <FormControl
                            type="password"
                            autoComplete="false"
                            isInvalid={!!errors.confirmPassword}
                            {...register('confirmPassword')} />
                        {watch('newPassword') !== watch('confirmPassword') &&
                            <div className="text-danger fs-7">
                                Die Passwörter stimmen nicht überein
                            </div>
                        }
                    </ModalBody>
                    <ModalFooter>
                        <Button type="submit">Passwort ändern</Button>
                    </ModalFooter>
                </form>
            </Modal>
        </>
    )
}