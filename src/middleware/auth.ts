import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'

import { prisma } from "../config/prisma.js";

interface IUser {
    id: string;
    legalName: string;
    email: string;
    role: string;
    isActive: boolean;
    hasCompletedProfile?: boolean;
}

declare global {
    namespace Express {
        interface Request {
            user?: IUser
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.access_token
    if (!token) {
        const error = new Error('No Autorizado')
        res.status(401).json({ error: error.message })
        return
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (typeof decoded === 'object' && decoded.id) {
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    legalName: true,
                    email: true,
                    role: true,
                    isActive: true,
                    provider: {
                        select: {
                            phone: true,
                            address: true,
                            province: true,
                            providerActivityId: true
                        }
                    }
                }
            })

            if (!user.isActive) {
                const error = new Error('La cuenta no ha sido desactivada')
                res.status(401).json({ error: error.message })
                return
            }

            if (user) {
                const userResponse: IUser = {
                    id: user.id,
                    legalName: user.legalName,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive
                }

                if (user.role === 'PROVIDER' && user.provider) {
                    const hasCompletedProfile = !!(
                        user.provider.phone &&
                        user.provider.address &&
                        user.provider.province &&
                        user.provider.providerActivityId
                    )
                    userResponse.hasCompletedProfile = hasCompletedProfile
                }

                req.user = userResponse
                next()
            } else {
                res.status(500).json({ error: 'Token No Valido' })
                return
            }
        }

    } catch (error) {
        res.status(500).json({ error: 'Token No Valido' })
        return
    }
}