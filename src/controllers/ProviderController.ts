import { Request, Response } from 'express'
import { ProviderModel } from '../models/Provider.js'

export class ProviderController {

    static async getProfile(req: Request, res: Response) {
        try {
            const { id } = req.params

            const provider = await ProviderModel.getProfileByUserId(id as string)

            return res.json(provider)
        } catch (error: any) {
            return res.status(404).json({ message: error.message })
        }
    }

    static async updateProfile(req: Request, res: Response) {
        try {
            const { id } = req.params
            const { providerActivityId, phone, address, province } = req.body

            await ProviderModel.updateProfileByUserId(id as string, {
                providerActivityId,
                phone,
                address,
                province,
            })

            return res.json({ message: 'Perfil actualizado correctamente' })
        } catch (error: any) {
            return res.status(400).json({ message: error.message })
        }
    }
}
