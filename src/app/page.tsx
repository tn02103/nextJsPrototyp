import { getPrisma } from "@/lib/db";

export default async function Home() {
    const users = await getPrisma('3fbc7ca2-4452-4f0a-a017-0ba3ca332ace').user.findMany({include: {assosiation: true}});
    
    return (
        <div>
            Homepage
            <br />
            {users.map(user =>
                <div key={user.id}>
                    {user.assosiation.name} | {user.name} | {user.username} | {user.email} | {user.role}
                </div>
            )}
        </div>
    );
}
