import { Router } from 'express'
import { ProviderActivityController } from '../controllers/ProviderActivityController.js'
import { authenticate } from '../middleware/auth.js';

const router = Router()

router.get('/', authenticate, ProviderActivityController.getProviderActivities)
router.post('/upload', authenticate, ProviderActivityController.uploadFile)

export default router as Router
