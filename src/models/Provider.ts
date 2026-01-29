import { prisma } from '../config/prisma.js'

export interface UpdateProviderProfileInput {
    providerActivityId: string
    phone: string
    address: string
    province: string
}

export class ProviderModel {

    static async getProfileByUserId(userId: string) {
        const provider = await prisma.provider.findUnique({
            where: { id: userId },
            select: {
                id: true,
                phone: true,
                address: true,
                province: true,
                generalStatus: true,
                createdAt: true,
                updatedAt: true,
                providerActivity: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                user: {
                    select: {
                        legalName: true,
                        email: true,
                        cuit: true,
                        role: true,
                    },
                }
            },
        })

        if (!provider) {
            throw new Error('Proveedor no encontrado')
        }

        return provider
    }

    static async updateProfileByUserId(
        userId: string,
        data: UpdateProviderProfileInput
    ) {
        const exists = await prisma.provider.findUnique({
            where: { id: userId },
        })

        if (!exists) {
            throw new Error('El perfil proveedor no existe')
        }

        return prisma.provider.update({
            where: { id: userId },
            data: {
                phone: data.phone,
                address: data.address,
                province: data.province,
                providerActivityId: data.providerActivityId,
            },
        })
    }
}
