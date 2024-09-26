"use client"

import { createUser, deleteUser, resetPassword, updateUser } from "@/actions/users";
import { useModal } from "@/components/modalProvider";
import { AuthRole } from "@/lib/authRole";
import { userAdministrationUserList } from "@/swr/userAdministration";
import { userAdministrationFormSchema } from "@/zod/user";
import { faBars, faCheck, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useState } from "react";
import { Button, Dropdown, DropdownItem, FormCheck, FormControl, FormSelect } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";


export default function UserAdminTableRow({
    user,
    closeNewLine,
    rowOfActiveUser,
}: {
    user: User | null;
    closeNewLine: () => void;
    rowOfActiveUser: boolean;
}) {
    const modal = useModal();
    const { mutate } = userAdministrationUserList()
    const { register, formState: { errors }, reset, handleSubmit, watch } = useForm<userAdministrationFormSchema>({
        defaultValues: user ?? { active: true },
        resolver: zodResolver(userAdministrationFormSchema)
    });
    const [editable, setEditable] = useState(false);

    function handleEdit() {
        if (user) reset(user);
        setEditable(true);
    }
    function handleSave(data: userAdministrationFormSchema) {
        if (!user) {
            const createMutation = (password: string, newPassword: string, sendMail: boolean) => createUser({
                data: { ...data, password: newPassword },
                sendMail,
                password,
            }).then((value) => {
                mutate();
                closeNewLine();
                // show new Password
            }).catch((e) => {
                toast.error('Beim Erstellen des Nutzers ist eine Fehler aufgetreten. Stellen Sie sicher, dass Sie Ihr richtige Passwort eingeben.')
            });

            modal?.resetPasswordModal(
                "Neuen Nutzer Anlegen",
                "Soll dem Nutzer die Zugansdaten zur Applikation per mail mitgetetil werden? Wenn nicht speichern Sie sich bitte das Passwort für den Nutzer ab",
                (newPassword, sendMail) => modal?.passwordReauthenticationModal(
                    (password) => createMutation(password, newPassword, sendMail)
                ),
            );
        } else {
            setEditable(false);
            updateUser({ id: user.id, data }).then(() => {
                mutate();
            }).catch((e) => {
                toast.error('Beim Speichern der Nutzerdaten ist ein Fehler aufgetreten');
            });
        }
    }
    function handleResetPassword() {
        if (!user) return;

        modal?.resetPasswordModal(
            "Passwor zurücksetzen",
            "Soll das neue Passwort dem Nutzer per Mail zugeschickt werden?",
            (newPassword, sendMail) => modal?.passwordReauthenticationModal(
                (password) => resetPassword({
                    newPassword, sendMail, password, userId: user.id
                }).then(() => {
                    toast.success('Das Passwort wurder erfolgreich zurückgesetzt');
                }).catch((e) => {
                    toast.error('Das Passwort vom Nutzer konnte nicht zurückgesetzt werden');
                })
            )
        );
    }

    function handleDelete() {
        if (!user) return;

        deleteUser(user.id).then(() => mutate()).catch(() => {
            toast.error('Beim Löschen des Nutzers gab es ein Problem');
        });
    }

    const formName = `user_${user ? user.id : "new"}`;

    if (!user || editable) {
        return (
            <tr>
                <td>
                    <FormControl
                        form={formName}
                        isInvalid={!!errors.username}
                        {...register('username')}
                    />
                    <div className="test-danger fs-7">
                        {errors.username?.message}
                    </div>
                </td>
                <td>
                    <FormControl
                        form={formName}
                        isInvalid={!!errors.name}
                        {...register('name')}
                    />
                    <div className="test-danger fs-7">
                        {errors.name?.message}
                    </div>
                </td>
                <td>
                    <FormControl
                        form={formName}
                        isInvalid={!!errors.email}
                        {...register('email')}
                    />
                    <div className="test-danger fs-7">
                        {errors.username?.message}
                    </div>
                </td>
                <td>
                    <FormSelect
                        form={formName}
                        isInvalid={!!errors.role}
                        disabled={rowOfActiveUser}
                        {...register('role', { valueAsNumber: true })}
                    >
                        <option value={AuthRole.user}>{getUserRoleTranslation(AuthRole.user)}</option>
                        <option value={AuthRole.manager}>{getUserRoleTranslation(AuthRole.manager)}</option>
                        <option value={AuthRole.admin}>{getUserRoleTranslation(AuthRole.admin)}</option>
                    </FormSelect>
                </td>
                <td>
                    <FormCheck
                        defaultChecked
                        disabled={rowOfActiveUser}
                        type="switch"
                        label={watch('active') ? "Aktiv" : "Gespert"}
                        {...register('active')}
                    />
                </td>
                <td colSpan={2} className="text-end">
                    <form id={formName} onSubmit={handleSubmit(handleSave)}>
                        <Button
                            size="sm"
                            type="submit"
                            variant="outline-success"
                            className="border-0 mx-1"
                        >
                            <FontAwesomeIcon icon={faCheck} />
                        </Button>
                    </form>
                    <Button
                        size="sm"
                        variant="outline-danger"
                        className="border-0 mx-1"
                        onClick={() => { user ? setEditable(false) : closeNewLine() }}
                    >
                        <FontAwesomeIcon icon={faX} />
                    </Button>
                </td>
            </tr >
        )
    } else {
        return (
            <tr>
                <td className={rowOfActiveUser ? "text-primary" : ""}>{user.username}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{getUserRoleTranslation(user.role)}</td>
                <td>{user.active ? "Aktiv" : "Gesperrt"}</td>
                <td>{user.usingAuthenticator ? "Authenticator" : "E-Mail"}</td>
                <td>
                    <Dropdown drop="start" className={``}>
                        <Dropdown.Toggle data-testid="btn_menu" variant="outline-seccondary" className="border-0" id={"Sizelist-dropdown"}>
                            <FontAwesomeIcon icon={faBars} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <DropdownItem data-testid="btn_menu_edit" onClick={handleEdit} className="py-2">Bearbeiten</DropdownItem>
                            {!rowOfActiveUser && <DropdownItem data-testid="btn_menu_changePassword" onClick={handleResetPassword} className="py-2">Passwort zurücksetzen</DropdownItem>}
                            {!rowOfActiveUser && <DropdownItem data-testid="btn_menu_delete" onClick={handleDelete} className="py-2">Benutzer Löschen</DropdownItem>}
                        </Dropdown.Menu>
                    </Dropdown>
                </td>
            </tr>
        )
    }
}

function getUserRoleTranslation(role: AuthRole) {
    switch (role) {
        case AuthRole.admin: return "Admin";
        case AuthRole.manager: return "Manager";
        case AuthRole.user: return "Nutzer";
    }
}