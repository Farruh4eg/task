import prisma from "../src/lib/prisma";

async function main() {
    const roles = await prisma.user_Roles.createMany({
        data: [
            {
                name: "admin"
            },
            {
                name: "user"
            }
        ]
    })

    const statuses = await prisma.user_Statuses.createMany({
        data: [
            {
                name: "active"
            },
            {
                name: "inactive"
            }
        ]
    })

    console.log({ roles, statuses })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })