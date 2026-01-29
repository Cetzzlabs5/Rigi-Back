import nodemailer from 'nodemailer'

try {
    process.loadEnvFile()
} catch (error) {
    console.error('wtf')
}

// Configura el transporter de Nodemailer
const config = () => {
    return {
        service: 'gmail', // Usar el servicio de Gmail
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    }
}

export const transporter = nodemailer.createTransport(config());