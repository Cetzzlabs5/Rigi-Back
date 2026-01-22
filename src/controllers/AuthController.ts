import { Request, Response } from "express";
import { prisma } from '../config/prisma.js';
import { registerProviderSchema } from "../schemas/authSchema.js";
import { createResetToken } from '../utils/token.js';
import bcrypt from 'bcrypt';

export default class AuthController {
    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "Bad request" });
            }

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });

        }

    }
}

export const register = async (req: Request, res: Response) => {
  try {
    const result = registerProviderSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ errors: result.error.flatten().fieldErrors });

    const { cuit, email, password, legalName } = result.data;

    const userExists = await prisma.user.findFirst({ where: { OR: [{ cuit }, { email }] } });
    if (userExists) return res.status(400).json({ message: "Usuario ya registrado con ese CUIT o Email" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const resultData = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { legalName, email, cuit, password: hashedPassword, role: 'PROVIDER' }
      });

      await tx.provider.create({
        data: { id: user.id, phone: "", address: "", province: "", generalStatus: 'ACTIVE' }
      });

      const tokenRecord = await createResetToken(user.id, tx);
      console.log("el token es",tokenRecord)
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

export const confirmAccount = async (req: Request, res: Response) => {
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
