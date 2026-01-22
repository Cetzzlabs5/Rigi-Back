import express, { type Application } from 'express'
import { corsMiddleware } from "./config/cors.js";
import providerRoutes from "./routes/providerRoutes.js";
import providerActivityRoutes from "./routes/providerActivityRoutes.js";

const app: Application = express()

app.use(corsMiddleware());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Respuesta desde el servidor')
})

app.use('/api/provider', providerRoutes)
app.use('/api/providerActivity', providerActivityRoutes)

export default app;