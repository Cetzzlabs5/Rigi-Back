import { prisma } from '../config/prisma.js';

// Genera un código de 6 dígitos para el email
export const generateToken = () => Math.floor(100000 + Math.random() * 900000).toString()

export const createResetToken = async (userId: string, tx?: any) => {
  // 1. Calcular la fecha de expiración (Tiempo actual + 15 minutos)
  // 15 minutos * 60 segundos * 1000 milisegundos
  const expiresIn = 15 * 60 * 1000; 
  const expirationDate = new Date(Date.now() + expiresIn);

  const db = tx || prisma

  // 2. Crear el registro en la BD
  const newToken = await db.token.create({
    data: {
      token: generateToken(),
      userId: userId,
      expiresAt: expirationDate,
    },
  });

  return newToken;
};