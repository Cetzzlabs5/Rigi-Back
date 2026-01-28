import { Router } from 'express'
import { ProviderActivityController } from '../controllers/ProviderActivityController.js'
import { authenticate } from '../middleware/auth.js';

const router = Router()

router.get('/', authenticate, ProviderActivityController.getProviderActivities)

export default router as Router
