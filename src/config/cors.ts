import cors from 'cors';

const FRONTEND_URLS = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : [];

const ACCEPTED_ORIGINS = [
    'http://localhost:5173',
    ...FRONTEND_URLS
];

export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) => cors({
    origin: (origin, callback) => {

        if (!origin) {
            return callback(null, true);
        }

        if (!acceptedOrigins.includes(origin)) {
            console.error(`🔴 CORS Bloqueado. Origen recibido: '${origin}'. Origenes permitidos:`, acceptedOrigins);
            return callback(new Error('Not allowed by CORS'));
        }

        return callback(null, true);
    },
    credentials: true
});