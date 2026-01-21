import { Request, Response } from "express";
import { checkUserEmail } from "../models/Auth.js";
import { generateJWT } from "../utils/jwt.js";

export default class AuthController {
    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            const user = await checkUserEmail(email);

            if (!user) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            // TODO: Validar si la cuenta fue activada

            // TODO: Validar la contraseña
            if (password !== user.password) {
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
}

