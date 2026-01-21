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
    // 1. Validar entrada (Zod)
    const result = registerProviderSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ errors: result.error.flatten().fieldErrors });

    const { cuit, email, password, legalName } = result.data;

    // 2. Verificar duplicados
    const userExists = await prisma.user.findFirst({ where: { OR: [{ cuit }, { email }] } });
    if (userExists) return res.status(400).json({ message: "Usuario ya registrado con ese CUIT o Email" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Transacción: Crear todo o nada
    const resultData = await prisma.$transaction(async (tx) => {
      // Crear Usuario
      const user = await tx.user.create({
        data: { legalName, email, cuit, password: hashedPassword, role: 'PROVIDER' }
      });

      // Crear Perfil inicial de Proveedor (Criterio de Jira: completar perfil después)
      await tx.provider.create({
        data: { userId: user.id, mainActivity: "", phone: "", address: "", province: "", generalStatus: 'ACTIVE' }
      });

      // 4. Generar Token usando la función de tu compañero
      const tokenRecord = await createResetToken(user.id, tx);

      return { user, token: tokenRecord.token };
    });

    // 5. Enviar respuesta (Aquí llamarías a tu servicio de Email con resultData.token)
    res.status(201).json({
      message: "Usuario registrado. Revisa tu email para confirmar la cuenta.",
      token: resultData.token // En producción esto no se envía en el JSON, solo por email
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

