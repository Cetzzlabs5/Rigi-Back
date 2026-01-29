import { prisma } from "../config/prisma.js";
import { DocStatus } from "../generated/prisma/enums.js";

export async function createDocument(file: Express.Multer.File, hash: string, providerId: string, requirementId?: string, documentType?: string) {
    try {
        const document = await prisma.document.create({
            data: {
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                fileUrl: "",
                hash: hash,

                status: 'PENDING',
                issueDate: new Date(),
                expirationDate: new Date(),
                documentType: documentType || 'OTROS',

                provider: {
                    connect: { id: providerId }
                },
                requirement: requirementId ? {
                    connect: { id: requirementId }
                } : undefined
            }
        });

        return document;
    } catch (error) {
        throw new Error("Error al crear el documento");
    }
}

export async function existingDocument(hash: string) {
    try {
        const document = await prisma.document.findUnique({ where: { hash } });

        if (document) {
            return document;
        }

        return null;
    } catch (error) {
        return null;
    }
}

export async function changeDocumentStatus(documentId: string, status: DocStatus, rejectionReason?: string) {
    try {
        const document = await prisma.document.update({
            where: { id: documentId },
            data: { status, rejectionReason }
        });

        return document;
    } catch (error) {
        throw new Error("Error al cambiar el estado del documento");
    }
}

export async function updateDocumentUrl(documentId: string, fileUrl: string) {
    try {
        const document = await prisma.document.update({
            where: { id: documentId },
            data: { fileUrl }
        });

        return document;
    } catch (error) {
        throw new Error("Error al actualizar la URL del documento");
    }
}