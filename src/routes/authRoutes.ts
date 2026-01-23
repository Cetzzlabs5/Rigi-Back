import { Router } from 'express'
import AuthController from '../controllers/AuthController.js';
import { handleInputErrors } from '../middleware/validation.js';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { confirmAccount, register } from "../controllers/AuthController.js";

const router = Router()

router.post('/login',
    body('email').isEmail().withMessage('E-mail no valido'),
    body('password').notEmpty().withMessage('El password es obligatorio'),
    handleInputErrors,
    AuthController.login
)

router.post('/forgot-password',
    body('email').isEmail().withMessage('E-mail no valido'),
    handleInputErrors,
    AuthController.forgotPassword
)

router.post('/validate-token',
    body('token').notEmpty().withMessage('El token es obligatorio'),
    handleInputErrors,
    AuthController.validateToken
)

router.post('/update-password/:token',
    param('token').isNumeric().withMessage('Token no valido'),
    body('password').notEmpty().withMessage('El password es obligatorio'),
    handleInputErrors,
    AuthController.updatePasswordWithToken
)

router.get('/logout', authenticate, AuthController.logout)

router.get('/session', authenticate, AuthController.session)

// Ruta de registro (la que acabamos de crear)
router.post("/register", register);
router.post("/confirm-account", confirmAccount);

// Ruta de login (el método estático de tu clase)
router.post("/login", AuthController.login);

export default router as Router;