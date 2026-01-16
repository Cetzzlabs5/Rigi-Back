import express, { type Application } from 'express'
import { corsMiddleware } from "./config/cors.js";

const app: Application = express()

app.use(corsMiddleware());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Respuesta desde el servidor')
})

export default app;
