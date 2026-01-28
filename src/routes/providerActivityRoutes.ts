import { Router } from 'express'
import { ProviderActivityController } from '../controllers/ProviderActivityController.js'
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router()

router.get('/', authenticate, ProviderActivityController.getProviderActivities)
router.post('/upload', authenticate, upload.single('file'), ProviderActivityController.uploadFile)

export default router as Router
