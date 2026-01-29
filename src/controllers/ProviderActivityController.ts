import { Request, Response } from 'express'
import { ProviderActivityModel } from '../models/ProviderActivity.js'
import fs from 'fs/promises'
import path from 'path'
import { prisma } from '../config/prisma.js'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { processDocument } from '../service/documentValidation.js'
import { createDocument, existingDocument, updateDocumentUrl } from '../models/Document.js'
import { ProviderModel } from '../models/Provider.js'

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

            const file = req.file;

            // GENERAR HASH (Para evitar duplicados)
            const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

            // VERIFICAR SI YA EXISTE (Duplicidad)
            const existingDoc = await existingDocument(hash);

            if (existingDoc) {
                return res.status(409).json({
                    message: 'Este documento ya fue subido anteriormente (Duplicado).'
                });
            }

            // GUARDAR EN BASE DE DATOS 
            const newDocument = await createDocument(file, hash, req.user.id, req.body.requirementId, req.body.documentType);

            // VERIFICAR PROVEEDOR 
            const provider = await ProviderModel.getProfileByUserId(req.user.id);

            if (!provider) {
                return res.status(404).json({ message: 'Proveedor no encontrado' });
            }

            const validationResult = await processDocument(
                newDocument.id,
                file.buffer,
                provider.user.cuit,
                provider.user.legalName
            );

            // MANEJO DE RECHAZO
            if (!validationResult.isValid) {
                // El documento ya se marcó como REJECTED en la DB dentro de processDocument

                return res.status(422).json({
                    message: 'El documento no pasó la validación automática.',
                    rejectionReason: validationResult.reason,
                    status: validationResult.status
                });
            }

            // SANITIZAR NOMBRE Y PREPARAR RUTA
            // Convertimos "Mi Archivo.pdf" a "uuid-Mi_Archivo.pdf"
            const sanitizedName = file.originalname.replace(' ', '_');
            const fileName = `${uuidv4()}-${sanitizedName}`;

            // Definir carpeta de destino 
            const uploadDir = path.join(process.cwd(), 'uploads');

            // Crear directorio si no existe (opcional pero recomendado)
            await fs.mkdir(uploadDir, { recursive: true });

            const uploadPath = path.join(uploadDir, fileName);

            // GUARDAR ARCHIVO EN DISCO
            await fs.writeFile(uploadPath, file.buffer);

            await updateDocumentUrl(newDocument.id, uploadPath);

            return res.status(201).json({
                ...newDocument,
                status: 'VERIFIED',
                fileUrl: uploadPath
            });

        } catch (error) {
            console.error('Error en uploadFile:', error);
            return res.status(500).json({
                message: 'Error interno al procesar el archivo',
            });
        }
    }
}
