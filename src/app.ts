import express, { type Application } from 'express'
import { prisma } from "./config/prisma";
import { corsMiddleware } from "./config/cors";

const app: Application = express()

app.use(corsMiddleware());
app.use(express.json());

app.get("/health", async (_req, res) => {
    const usersCount = await prisma.user.count();
    res.json({ ok: true, usersCount });
});

export default app;
