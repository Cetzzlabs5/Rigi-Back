import { Router } from 'express'
import { ProviderController } from '../controllers/ProviderController.js'

const router = Router()

router.get('/:id', ProviderController.getProfile)
router.patch('/:id', ProviderController.updateProfile)

export default router as Router
