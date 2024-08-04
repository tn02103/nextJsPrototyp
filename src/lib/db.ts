import { Prisma, PrismaClient } from "@prisma/client";

function forAssosiation(assosiationId: string) {
    return Prisma.defineExtension((prisma) =>
        prisma.$extends({
            query: {
                $allModels: {
                    async $allOperations({ args, query }) {
                        const [, result] = await prisma.$transaction([
                            prisma.$executeRaw`SELECT set_config('app.assosiation_id', ${assosiationId}, TRUE)`,
                            query(args),
                        ]);
                        return result;
                    },
                },
            },
        })
    );
}

const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}

const prisma = globalForPrisma.prisma || new PrismaClient({
    omit: {
        user: {
            password: true,
            usingAuthenticator: true,
        }
    }
});

export function getPrisma(assosiationId: string) {
    return prisma.$extends(forAssosiation(assosiationId)) as PrismaClient;
}
