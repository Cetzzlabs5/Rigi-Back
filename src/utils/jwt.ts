import jwt from 'jsonwebtoken'
import { User } from '../generated/prisma/client.js'

type UserPayload = {
    id: User['id']
}

export const generateJWT = (payload: UserPayload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '10d'
    })

    return token
}