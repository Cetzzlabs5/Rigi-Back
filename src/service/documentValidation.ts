import { prisma } from "../config/prisma.js"
import { DocStatus } from "../generated/prisma/enums.js";
import { changeDocumentStatus } from "../models/Document.js";
import { extractTextFromBuffer } from "../utils/pdfExtractor.js";
import { findCuitInText, findNameInText } from "../utils/validators.js";

// Definimos una interfaz para la respuesta
interface ValidationResult {
    isValid: boolean;
    reason?: string;
    status: DocStatus;
}

export const processDocument = async (
    docId: string,
    fileBuffer: Buffer,
    userCuit: string,
    userName: string
): Promise<ValidationResult> => {

    // 1. Cambiar estado a PROCESSING
    await changeDocumentStatus(docId, 'PROCESSING');

    try {
        // 2. Extraer texto
        const text = await extractTextFromBuffer(fileBuffer);

        // CASO: PDF Ilegible
        if (!text || text.trim().length < 50) {
            const reason = 'El documento no es legible o es una imagen. Suba un PDF nativo.';
            await changeDocumentStatus(docId, 'REJECTED', reason);
            return { isValid: false, reason, status: 'REJECTED' };
        }

        // 3. Buscar CUIT y Nombre
        const foundCuit = findCuitInText(text);
        const foundName = await findNameInText(text);

        // 4. Comparar
        if (foundCuit === userCuit && foundName === userName) {
            await changeDocumentStatus(docId, 'VERIFIED');
            return { isValid: true, status: 'VERIFIED' };
        } else {
            let rejectionReason = '';
            if (foundCuit !== userCuit) {
                rejectionReason += `CUIT incorrecto. Se encontró ${foundCuit || 'ninguno'}, se esperaba ${userCuit}. `;
            }
            if (foundName !== userName) {
                rejectionReason += `Nombre incorrecto. Se encontró ${foundName || 'ninguno'}, se esperaba ${userName}.`;
            }

            await changeDocumentStatus(docId, 'REJECTED', rejectionReason);
            return { isValid: false, reason: rejectionReason, status: 'REJECTED' };
        }

    } catch (error) {
        await changeDocumentStatus(docId, 'PENDING', 'Error en validación automática, requiere revisión manual.');
        throw error;
    }
}