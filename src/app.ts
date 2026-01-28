import express, { type Application } from 'express'
import { corsMiddleware } from "./config/cors.js";
import providerRoutes from "./routes/providerRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import providerActivityRoutes from "./routes/providerActivityRoutes.js";
import cookieParser from 'cookie-parser';

const app: Application = express()

app.use(cookieParser());
app.use(corsMiddleware());
app.use(express.json());

app.get('/api', (req, res) => {
    res.send('Respuesta desde el servidor')
})

app.use("/api/auth", authRoutes);
app.use("/api/provider", providerRoutes);
app.use('/api/providerActivity', providerActivityRoutes)

export default app;