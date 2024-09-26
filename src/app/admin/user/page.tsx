
import { Col, Row } from "react-bootstrap";
import UserAdminTable from "./table";
import { getUserList } from "@/actions/users";
import { auth } from "@/lib/authentication/auth";

export default async function AdminUserPage() {
    const session = await auth();
    const userList = await getUserList();

    return (
        <div className="container-lg content-center bg-light rounded p-0 pt-2 position-relative">
            <h1 className="text-center">Nutzerverwaltung</h1>
            <Row className="justify-content-center m-0">
                <Col xs={12} xl={12} xxl={10} className="p-0 p-md-4">
                    <UserAdminTable initialData={userList} userId={session!.user!.id} />
                </Col>
            </Row>
        </div>
    )
}