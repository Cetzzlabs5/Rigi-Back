import express, { type Application } from 'express'
import { corsMiddleware } from "./config/cors.js";
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';

const app: Application = express()

app.use(cookieParser());
app.use(corsMiddleware());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Respuesta desde el servidor')
})

app.use('/api/auth', authRoutes)

export default app;
