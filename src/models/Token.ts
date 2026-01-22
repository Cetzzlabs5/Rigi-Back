import { prisma } from "../config/prisma.js";

export async function checkToken(token: string) {
    try {
        const tokenExists = await prisma.token.findFirst({
            where: { token },
            include: {
                user: true
            }
        });

        if (tokenExists) {
            return tokenExists;
        }

        return null;
    } catch (error) {
        console.log(error);
        return null;
    }
}