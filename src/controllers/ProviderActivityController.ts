import { Request, Response } from 'express'
import { ProviderActivityModel } from '../models/ProviderActivity.js'

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
}
