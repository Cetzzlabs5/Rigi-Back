import { Request, Response } from 'express'
import { ProviderActivityModel } from '../models/ProviderActivity.js'
import fs from 'node:fs'
import path from 'node:path'
import { prisma } from '../config/prisma.js'
import { processDocument } from '../service/documentValidation.js'

export class ProviderActivityController {

    static async getProviderActivities(req: Request, res: Response) {
        try {
            const activities = await ProviderActivityModel.getAll()

            return res.json(activities)
        } catch (error) {
            console.error(error)
            return res.status(500).json({
                message: 'Error al obtener rubros de proveedor',
            })
        }
    }

    static async uploadFile(req: Request, res: Response) {
        try {
            const filePath = path.join(process.cwd(), 'assets', 'fileExample', 'mockup_dgr_f900_completo.pdf')
            console.log(filePath)
            const file = await fs.readFileSync(filePath)

            const newDocument = await prisma.document.create({
                data: {
                    fileUrl: filePath,
                    documentType: 'F900',
                    hash: 'hash1',
                    originalName: 'mockup_dgr_f900_completo.pdf',
                    issueDate: new Date(),
                    expirationDate: new Date(),
                    status: 'PENDING',
                    provider: {
                        connect: { id: req.user.id }
                    },
                    requirement: {
                        connect: { id: '1' }
                    }
                }
            })

            const provider = await prisma.provider.findUnique({
                where: { id: req.user.id },
                include: {
                    user: true
                }
            })

            if (!provider) {
                return res.status(404).json({
                    message: 'Proveedor no encontrado',
                })
            }

            processDocument(newDocument.id, file, provider.user.cuit, provider.user.legalName).catch(console.error);

            return res.json(newDocument)

        } catch (error) {
            console.error(error)
            return res.status(500).json({
                message: 'Error al subir archivo',
            })
        }
    }
}
