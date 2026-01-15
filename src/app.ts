import express from "express";
import cors from "cors";
import { prisma } from "./config/prisma.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
    const usersCount = await prisma.user.count();
    res.json({ ok: true, usersCount });
});
