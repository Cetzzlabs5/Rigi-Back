import { Router } from 'express'
import { ProviderController } from '../controllers/ProviderController.js'
import { authenticate } from '../middleware/auth.js';
import { handleInputErrors } from '../middleware/validation.js';
import { body } from 'express-validator';

const router = Router()

router.get('/:id', authenticate, ProviderController.getProfile)
router.patch('/:id', authenticate,
    body('phone').isLength({ min: 8 }).isNumeric().withMessage('El teléfono es requerido'),
    body('providerActivityId').notEmpty().withMessage('La actividad es requerida'),
    body('address').notEmpty().withMessage('La dirección es requerida'),
    body('province').notEmpty().withMessage('La provincia es requerida'),
    handleInputErrors, ProviderController.updateProfile)

export default router as Router
