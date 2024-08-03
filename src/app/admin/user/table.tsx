"use client";

import { userAdministrationUserList } from "@/swr/userAdministration";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { User } from "@prisma/client";
import { Button, Table } from "react-bootstrap";
import UserAdminTableRow from "./tableRow";

export default function UserAdminTable({
    initialData
}: {
    initialData: User[]
}) {

    const { userList } = userAdministrationUserList(initialData);



    return (
        <Table striped>
            <thead>
                <tr>
                    <th>Nutzername</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Rolle</th>
                    <th>Status</th>
                    <th>2FA-Status</th>
                    <th>
                        <Button size="sm" variant="outline-success" className="border-0">
                            <FontAwesomeIcon icon={faPlus} />
                        </Button>
                    </th>
                </tr>
            </thead>
            <tbody>
                {userList?.map(user =>
                    <UserAdminTableRow
                        key={user.id}
                        user={user} 
                        />
                )}
            </tbody>
        </Table>
    )
}