import { prisma } from "../config/prisma.js";

export const generateToken = () => Math.floor(100000 + Math.random() * 900000).toString()

export const createResetToken = async (userId: string, tx?: any) => {
  const expiresIn = 15 * 60 * 1000;
  const expirationDate = new Date(Date.now() + expiresIn);
  const db = tx || prisma

  const newToken = await db.token.create({
    data: {
      token: generateToken(),
      userId: userId,
      expiresAt: expirationDate,
    },
  });

  return newToken;
}