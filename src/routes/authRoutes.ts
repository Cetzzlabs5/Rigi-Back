import { Router } from 'express'
import AuthController from '../controllers/AuthController.js';
import { handleInputErrors } from '../moddleware/validation.js';
import { body } from 'express-validator';

const router = Router()

router.post('/login',
    body('email').isEmail().withMessage('E-mail no valido'),
    body('password').notEmpty().withMessage('El password es obligatorio'),
    handleInputErrors,
    AuthController.login
)

export default router as Router