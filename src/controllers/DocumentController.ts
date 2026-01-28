import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/prisma.js';

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });

    const buffer = req.file.buffer;

    // GENERAR HASH SHA-256 
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    // VERIFICAR DUPLICIDAD INSTANTÁNEA
    const existingDoc = await prisma.document.findUnique({
      where: { hash: hash }
    });

    if (existingDoc) {
      return res.status(409).json({ 
        error: 'Documento duplicado. Este archivo ya fue subido por otra empresa.' 
      });
    }

    // SANITIZAR NOMBRE Y GUARDAR EN DISCO (Si pasó el hash)
    // Limpiamos caracteres raros del nombre original
    const sanitizedParams = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${uuidv4()}-${sanitizedParams}`;
    const uploadPath = path.join(__dirname, '../../uploads', fileName); // Asegúrate que la carpeta uploads exista

    // Escribimos el archivo del buffer al disco
    await fs.writeFile(uploadPath, buffer);

    // GUARDAR EN BASE DE DATOS
    const newDoc = await prisma.document.create({
      data: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: uploadPath,
        hash: hash,
        companyId: req.user.companyId,
        status: 'PENDING'
      }
    });

    // ... DEV 2 ...

    res.status(201).json(newDoc);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};