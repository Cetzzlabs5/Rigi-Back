import { Request, Response } from 'express'
import { ProviderActivityModel } from '../models/ProviderActivity.js'
import fs from 'fs/promises'
import path from 'path'
import { prisma } from '../config/prisma.js'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { processDocument } from '../service/documentValidation.js'

export class ProviderActivityController {

    static async getProviderActivities(req: Request, res: Response) {
        try {
            const activities = await ProviderActivityModel.getAll()

            return res.json(activities)
        } catch (error) {
            console.error(error)
            return res.status(500).json({
                message: 'Error al obtener rubros de proveedor',
            })
        }
    }

    static async uploadFile(req: Request, res: Response) {
        try {
            // VALIDAR QUE LLEGÓ EL ARCHIVO 
            if (!req.file) {
                return res.status(400).json({ message: 'No se subió ningún archivo' });
            }

            const file = req.file; // Aquí está el archivo real (buffer, nombre, etc.)
            
            // GENERAR HASH (Para evitar duplicados)
            const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

            // VERIFICAR SI YA EXISTE (Duplicidad)
            const existingDoc = await prisma.document.findUnique({
                where: { hash: hash }
            });

            if (existingDoc) {
                return res.status(409).json({ 
                    message: 'Este documento ya fue subido anteriormente (Duplicado).' 
                });
            }

            // SANITIZAR NOMBRE Y PREPARAR RUTA
            // Convertimos "Mi Archivo.pdf" a "uuid-Mi_Archivo.pdf"
            const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `${uuidv4()}-${sanitizedName}`;
            
            // Definir carpeta de destino 
            const uploadDir = path.join(process.cwd(), 'uploads'); 
            // Crear directorio si no existe (opcional pero recomendado)
            await fs.mkdir(uploadDir, { recursive: true });
            
            const uploadPath = path.join(uploadDir, fileName);

            // GUARDAR ARCHIVO EN DISCO
            await fs.writeFile(uploadPath, file.buffer);

            // GUARDAR EN BASE DE DATOS 
            const newDocument = await prisma.document.create({
                data: {
                    originalName: file.originalname,  
                    mimeType: file.mimetype,          
                    size: file.size,                  
                    fileUrl: uploadPath,              
                    hash: hash,                       
                    
                    status: 'PENDING',
                    issueDate: new Date(),
                    expirationDate: new Date(),
                    documentType: req.body.documentType || 'OTROS', 
                    
                    // RELACIONES
                    provider: {
                        connect: { id: req.user.id }
                    },
                    requirement: req.body.requirementId ? {
                        connect: { id: req.body.requirementId }
                    } : undefined 
                }
            });

            // VERIFICAR PROVEEDOR 
            const provider = await prisma.provider.findUnique({
                where: { id: req.user.id },
                include: { user: true }
            });

            if (!provider) {
                return res.status(404).json({ message: 'Proveedor no encontrado' });
            }

            processDocument(newDocument.id, file.buffer, provider.user.cuit, provider.user.legalName).catch(err => console.error("Error en OCR background", err));

            return res.status(201).json(newDocument);

        } catch (error) {
            console.error('Error en uploadFile:', error);
            return res.status(500).json({
                message: 'Error interno al procesar el archivo',
            });
        }
    }
}
