import { prisma } from './src/config/prisma'

async function main() {

    // Fetch all users with their posts
    const allUsers = await prisma.user.findMany()
    console.log('All users:', JSON.stringify(allUsers, null, 2))
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