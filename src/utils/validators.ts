import { aiService } from "../service/aiService.js";

export const findCuitInText = (text: string): string | null => {
    // Busca patrones como 20-12345678-9 o 20123456789
    const cuitRegex = /\b(20|23|24|27|30|33|34)-?(\d{8})-?(\d)\b/g;

    const matches = text.match(cuitRegex);

    if (matches && matches.length > 0) {
        return matches[0].replace(/-/g, ""); // Devuelve solo números para comparar fácil
    }
    return null;
};

export const findNameInText = async (text: string): Promise<string | null> => {
    const aiAsist = await aiService.generateText(`Extrae el nombre o razon social de la empresa del siguiente texto: ${text}`)

    if (aiAsist) {
        return sanitizeName(aiAsist);
    }

    return null;
};

const sanitizeName = (rawName: string): string => {
    return rawName
        .replace(/^["']|["']$/g, '')
        .replace(/[:.-]+$/, '')
        .trim()
};