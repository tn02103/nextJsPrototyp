import Link from "next/link";


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

        </div>
    );
}
