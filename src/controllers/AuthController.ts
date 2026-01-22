import { Request, Response } from "express";
import { checkUserEmail } from "../models/Auth.js";
import { generateJWT } from "../utils/jwt.js";
import { checkToken } from "../models/Token.js";
import { createResetToken } from "../utils/token.js";
import { AuthEmail } from "../email/AuthEmail.js";
import { checkPassword, hashPassword } from "../utils/auth.js";
import { prisma } from "../config/prisma.js";

export default class AuthController {
    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            const user = await checkUserEmail(email);

            if (!user) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            // TODO: Validar si la cuenta fue activada
            if (!user.isActive) {
                return res.status(401).json({ error: "Cuenta no activada" });
            }

            // TODO: Validar la contraseña
            const isPasswordValid = await checkPassword(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ error: "Contraseña incorrecta" });
            }

            // Generar token
            const token = generateJWT({ id: user.id });

            res.cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV == 'production', // la cookie solo se puede acceder en https
                sameSite: 'strict',
                maxAge: 10 * 60 * 1000
            }).send('Sesion iniciada correctamente')
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });

        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            const user = await checkUserEmail(email)

            if (!user) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            const token = await createResetToken(user.id)

            AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.legalName,
                token: token.token
            })

            res.send('Token generado correctamente')
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });

        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            const tokenExists = await checkToken(token)

            if (!tokenExists) {
                const error = new Error('Token no valido')
                return res.status(404).json({ error: error.message })
            }
            res.send('Token valido, define tu nueva contraseña')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })

        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params
            const { password } = req.body

            const tokenExists = await checkToken(token as string)

            if (!tokenExists) {
                const error = new Error('Token no valido')
                res.status(404).json({ error: error.message })
                return
            }

            const user = await checkUserEmail(tokenExists.user.email)
            user.password = await hashPassword(password)

            await Promise.all([prisma.user.update({ where: { id: user.id }, data: { password: user.password } }), prisma.token.delete({ where: { id: tokenExists.id } })])

            res.send('La contraseña ha sido actualizada')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })

        }
    }

    static logout = async (req: Request, res: Response) => {
        res.clearCookie('access_token').send('Sesion cerrada correctamente')
    }

    static session = async (req: Request, res: Response) => {
        res.json(req.user)
    }

}

