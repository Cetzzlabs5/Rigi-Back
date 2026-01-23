<<<<<<< HEAD
import { prisma } from "../config/prisma.js";
=======
import { prisma } from '../config/prisma.js';
>>>>>>> 6c633c0143d1fb1bb52a402b3d2122be2ff1d70b

export const generateToken = () => Math.floor(100000 + Math.random() * 900000).toString()

export const createResetToken = async (userId: string, tx?: any) => {
<<<<<<< HEAD
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
=======
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
>>>>>>> 6c633c0143d1fb1bb52a402b3d2122be2ff1d70b
}