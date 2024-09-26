import { TestSA } from "@/actions/test";
import Link from "next/link";
import { Button } from "react-bootstrap";
import ButtonTest from "./testButton";


export default async function Home() {

    return (
        <div>
            Homepage
            <br />
            <ul>
                <li>
                    <Link href={"/admin/user"}>Nutzerverwaltung</Link>
                </li>
                <li>
                    <Link href={"/account"}>Mein Account</Link>
                </li>
                <li>

                </li>
            </ul>
            <br />

            <br />
            <ButtonTest />
        </div>
    );
}


