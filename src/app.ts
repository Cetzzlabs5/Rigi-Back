import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { prisma } from './config/prisma.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', async (_req, res) => {
    const usersCount = await prisma.user.count()
    res.json({ ok: true, usersCount })
})

const PORT = process.env.PORT ?? 4000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
