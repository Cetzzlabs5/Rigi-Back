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

    static sendConfirmationEmail = async (user: IEmail) => {
        try {
            const info = await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'RIGI - Confirma tu cuenta',
                text: 'RIGI - Confirma tu cuenta',
                html: `
                <p>Hola ${user.name}, has creado tu cuenta en RIGI, ya casi esta todo listo.</p>
                <p>Solo debes confirmar tu cuenta ingresando el siguiente codigo:</p>
                <p>CODIGO: <b>${user.token}</b></p>
                <p>Este codigo expira en 15 minutos</p>
                `
            })
            console.log('Mensaje enviado: %s', info.messageId)
        } catch (error) {
            console.log(error)
            // No lanzamos throw error aquí para no romper el registro si falla el email,
            // pero es decisión tuya si quieres que falle todo el proceso :o
            // throw error 
        }
    }
}