import { prisma } from "../config/prisma.js";

export async function checkUserEmail(email: string) {
    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            return true;
        }

        return false;
    } catch (error) {
        console.log(error);
        return false;
    }
}