"use client";

import { userAdministrationUserList } from "@/swr/userAdministration";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { User } from "@prisma/client";
import { Button, Table } from "react-bootstrap";
import UserAdminTableRow from "./tableRow";
import { useState } from "react";
import { auth } from "@/lib/authentication/auth";

export default function UserAdminTable({
    initialData, userId
}: {
    initialData: User[];
    userId: string;
}) {
    const { userList } = userAdministrationUserList(initialData);
    const [showNewRow, setShowNewRow] = useState(false);

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
                        <Button
                            size="sm"
                            variant="outline-success"
                            className="border-0"
                            onClick={() => setShowNewRow(true)}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                        </Button>
                    </th>
                </tr>
            </thead>
            <tbody>
                {(showNewRow) &&
                    <UserAdminTableRow
                        closeNewLine={() => setShowNewRow(false)}
                        user={null} 
                        rowOfActiveUser={false}/>
                }
                {userList?.map(user =>
                    <UserAdminTableRow
                        key={user.id}
                        user={user}
                        closeNewLine={() => setShowNewRow(false)}
                        rowOfActiveUser={user.id === userId}
                    />
                )}
            </tbody>
        </Table>
    )
}