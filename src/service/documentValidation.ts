import { prisma } from "../config/prisma.js"
import { extractTextFromBuffer } from "../utils/pdfExtractor.js";
import { findCuitInText, findNameInText } from "../utils/validators.js";

export const processDocument = async (docId: string, fileBuffer: Buffer, userCuit: string, userName: string) => {
    // 1. Cambiar estado a PROCESSING (Para feedback visual en Tarea 3)
    await prisma.document.update({
        where: { id: docId },
        data: { status: 'PROCESSING' }
    });

    // 2. Extraer texto
    const text = await extractTextFromBuffer(fileBuffer);

    // CASO DE ERROR: PDF es una imagen o escaneado
    if (!text || text.trim().length < 50) {
        return await prisma.document.update({
            where: { id: docId },
            data: {
                status: 'REJECTED',
                rejectionReason: 'El documento no es legible o es una imagen. Suba un PDF nativo.'
            }
        });
    }

    // 3. Buscar CUIT
    const foundCuit = findCuitInText(text);
    const foundName = await findNameInText(text);

    // 4. Comparar y Decidir
    if (foundCuit === userCuit && foundName === userName) {
        return await prisma.document.update({
            where: { id: docId },
            data: { status: 'VERIFIED' }
        });
    } else {
        let rejectionReason = '';
        if (foundCuit !== userCuit) {
            rejectionReason += `CUIT incorrecto. Se encontró ${foundCuit || 'ninguno'}, se esperaba ${userCuit}.`;
        }
        if (foundName !== userName) {
            rejectionReason += `\n Nombre incorrecto. Se encontró ${foundName || 'ninguno'}, se esperaba ${userName}.`;
        }
        return await prisma.document.update({
            where: { id: docId },
            data: {
                status: 'REJECTED',
                rejectionReason
            }
        });
    }
}