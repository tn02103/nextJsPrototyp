import { getUserList } from "@/actions/users/getUsers";
import { Col, Row } from "react-bootstrap";
import UserAdminTable from "./table";

export default async function AdminUserPage() {

    const userList = await getUserList();

    return (
        <div className="container-lg content-center bg-light rounded p-0 pt-2 position-relative">
            <h1 className="text-center">Nutzerverwaltung</h1>
            <Row className="justify-content-center m-0">
                <Col xs={12} xl={10} xxl={8} className="p-0 p-md-4">
                    <UserAdminTable initialData={userList} />
                </Col>
            </Row>
        </div>
    )
}