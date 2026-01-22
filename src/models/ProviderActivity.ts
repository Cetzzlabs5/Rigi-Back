import { prisma } from '../config/prisma.js'

export class ProviderActivityModel {

    static async getAll() {
        return prisma.providerActivity.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: 'asc',
            },
        })
    }
}
