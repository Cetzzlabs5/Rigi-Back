import { transporter } from "../config/email.js"

try {
    process.loadEnvFile()
} catch (error) {
    console.error('wtf')
}

interface IEmail {
    email: string,
    name: string,
    token: string
}


export class AuthEmail {
    static sendPasswordResetToken = async (user: IEmail) => {
        try {
            const info = await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'RIGI - Restablece tu constraseña',
                text: 'RIGI - Restablece tu constraseña',
                html: `
                <p> Hola ${user.name}, has solicitado reestablecer tu constraseña.</p>
                <p>Visita el siguiente enlace:</p>
                <a href="${process.env.FRONTEND_URL}/auth/new-password" >Reestablecer constraseña</a>
                <p>Ingresa el codigo: <b>${user.token}</b></p>
                <p>Este token expira en 15 minutos</p>
                `
            })

        } catch (error) {
            console.log(error)
            throw error
        }
    }
}