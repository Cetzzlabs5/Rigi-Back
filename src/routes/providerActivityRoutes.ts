import { Router } from 'express'
import { ProviderActivityController } from '../controllers/ProviderActivityController.js'

const router = Router()

router.get('/', ProviderActivityController.getProviderActivities)

export default router as Router
