import { Request, Response } from "express";
import { prisma } from '../config/prisma.js';
import { registerProviderSchema } from "../schemas/authSchema.js";
import { createResetToken } from '../utils/token.js';
import bcrypt from 'bcrypt';
import { checkUserEmail } from "../models/Auth.js";
import { generateJWT } from "../utils/jwt.js";
import { checkToken } from "../models/Token.js";
import { AuthEmail } from "../email/AuthEmail.js";
import { checkPassword, hashPassword } from "../utils/auth.js";

export default class AuthController {
    static register = async (req: Request, res: Response) => {
        try {
            const result = registerProviderSchema.safeParse(req.body);
            if (!result.success) return res.status(400).json({ errors: result.error.flatten().fieldErrors });

            const { cuit, email, password, legalName } = result.data;

            const userExists = await prisma.user.findFirst({ where: { OR: [{ cuit }, { email }] } });
            if (userExists) return res.status(400).json({ message: "Usuario ya registrado con ese CUIT o Email" });

            const hashedPassword = await hashPassword(password);

            const resultData = await prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: { legalName, email, cuit, password: hashedPassword, role: 'PROVIDER' }
                });

                await tx.provider.create({
                    data: { id: user.id, phone: "", address: "", province: "", generalStatus: 'ACTIVE' }
                });

                const tokenRecord = await createResetToken(user.id, tx);
                console.log("el token es", tokenRecord)
                return { user, token: tokenRecord.token };
            });

            res.status(201).json({
                message: "Usuario registrado. Revisa tu email para confirmar la cuenta.",
                token: resultData.token // solo pa ver en postman 
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error en el servidor" });
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token, email } = req.body;

            // 1. Buscar el token y el usuario asociado
            const tokenExists = await prisma.token.findFirst({
                where: {
                    token,
                    user: { email }
                },
                include: { user: true }
            });

            if (!tokenExists) {
                return res.status(401).json({ message: "Código de verificación inválido" });
            }

            // 2. Verificar si expiró
            if (new Date() > tokenExists.expiresAt) {
                return res.status(401).json({ message: "El código ha expirado" });
            }

            // 3. Activar usuario y borrar el token (Transacción)
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: tokenExists.userId },
                    data: { isActive: true }
                }),
                prisma.token.delete({
                    where: { id: tokenExists.id }
                })
            ]);

            res.status(200).json({ message: "Cuenta activada correctamente" });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al confirmar cuenta" });
        }
    }

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
