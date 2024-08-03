"use client"

import { AuthRole } from "@/lib/authRole";
import { userAdministrationFormSchema } from "@/zod/user";
import { icon } from "@fortawesome/fontawesome-svg-core";
import { faBars, faCheck, faCross } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client"
import { error } from "console";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, Dropdown, DropdownItem, FormControl, FormSelect } from "react-bootstrap";
import { useForm } from "react-hook-form";


export default function UserAdminTableRow({
    user,
}: {
    user: User;
}) {
    const { register, formState: { errors }, reset } = useForm<userAdministrationFormSchema>({
        resolver: zodResolver(userAdministrationFormSchema)
    });
    const [editable, setEditable] = useState(false);

    function handleEdit() {
        reset(user);
        setEditable(true);
    }
    function handleSave() {

    }
    function handleChangePassword() {

    }

    function handleDelete() {

    }

    if (editable) {
        return (
            <tr>
                <td>
                    <FormControl
                        isInvalid={!!errors.username}
                        {...register('username')}
                    />
                    <div className="test-danger fs-7">
                        {errors.username?.message}
                    </div>
                </td>
                <td>
                    <FormControl
                        isInvalid={!!errors.name}
                        {...register('name')}
                    />
                    <div className="test-danger fs-7">
                        {errors.name?.message}
                    </div>
                </td>
                <td>
                    <FormControl
                        isInvalid={!!errors.email}
                        {...register('email')}
                    />
                    <div className="test-danger fs-7">
                        {errors.username?.message}
                    </div>
                </td>
                <td>
                    <FormSelect
                        isInvalid={!!errors.role}
                        {...register('role')}
                    >
                        <option value={AuthRole.user}>Nutzer</option>
                        <option value={AuthRole.manager}>Manager</option>
                        <option value={AuthRole.admin}>Admin</option>
                    </FormSelect>
                </td>
                <td>
                    <FormSelect
                        isInvalid={!!errors.active}
                        {...register('active')}
                    >
                        <option value={"true"}>Aktiv</option>
                        <option value={"false"}>Gesperrt</option>
                    </FormSelect>
                </td>
                <td colSpan={2}>
                    <Button>
                        <FontAwesomeIcon icon={faCheck} />
                    </Button>
                    <Button>
                        <FontAwesomeIcon icon={faCross} />
                    </Button>
                </td>
            </tr>
        )
    } else {
        return (
            <tr>
                <td>{user.username}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.active ? "Aktiv" : "Gesperrt"}</td>
                <td>{user.usingAuthenticator ? "Authenticator" : "E-Mail"}</td>
                <td>
                    <Dropdown drop="start" className={``}>
                        <Dropdown.Toggle data-testid="btn_menu" variant="outline-seccondary" className="border-0" id={"Sizelist-dropdown"}>
                            <FontAwesomeIcon icon={faBars} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <DropdownItem data-testid="btn_menu_edit" onClick={handleEdit} className="py-2">Bearbeiten</DropdownItem>
                            <DropdownItem data-testid="btn_menu_changePassword" onClick={handleChangePassword} className="py-2">Passwort zurücksetzen</DropdownItem>
                            <DropdownItem data-testid="btn_menu_delete" onClick={handleDelete} className="py-2">Benutzer Löschen</DropdownItem>
                        </Dropdown.Menu>
                    </Dropdown>
                </td>
            </tr>
        )
    }
}