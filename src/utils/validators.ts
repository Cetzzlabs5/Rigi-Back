export const findCuitInText = (text: string): string | null => {
    // Busca patrones como 20-12345678-9 o 20123456789
    const cuitRegex = /\b(20|23|24|27|30|33|34)-?(\d{8})-?(\d)\b/g;

    const matches = text.match(cuitRegex);

    if (matches && matches.length > 0) {
        return matches[0].replace(/-/g, ""); // Devuelve solo números para comparar fácil
    }
    return null;
};

export const findNameInText = (text: string): string | null => {
    // 1. APLANADO DE TEXTO (NUEVO & CRUCIAL)
    // Reemplazamos todos los saltos de línea y espacios múltiples por un solo espacio.
    // Esto permite que las regex encuentren patrones que se cortan entre líneas.
    const cleanText = text.replace(/\s+/g, ' ');

    //TODO: Implementar IA para que pueda leer el nombre

    // Array de patrones de búsqueda ordenados por prioridad
    const patterns = [
        // ------------------------------------------------------------------
        // 1. PRIORIDAD ALTA: Formato DGR Salta (F.900)
        // Busca "Razón Social" y se detiene EXACTAMENTE antes de "Tipo de Persona"
        // Maneja las comillas y comas del formato CSV/Tabla.
        // ------------------------------------------------------------------
        /Raz(?:ó|o)n\s*Social\s*[:.,"]*\s*([A-Z0-9\s.,&]+?)(?=\s*["']?\s*Tipo\s*de\s*Persona)/i,

        // 2. Caso Estándar: "Razón Social: EMPRESA S.A." (Gral. AFIP/Minera)
        // Se detiene al encontrar CUIT, Domicilio o Forma
        /Raz(?:ó|o)n\s*Social\s*[:.-]?\s*([A-Z0-9\s.,&]+?)(?=\s*(?:CUIT|Domicilio|Forma|$))/i,

        // 3. Caso Monotributo/Persona: "Apellido y Nombre: PEREZ JUAN"
        /Apellido\s*y\s*Nombre\s*[:.-]?\s*([A-Z\s]+?)(?=\s*(?:CUIT|Domicilio|$))/i,

        // 4. Caso Otros: "Denominación: EMPRESA S.A."
        /Denominaci(?:ó|o)n\s*[:.-]?\s*([A-Z0-9\s.,&]+?)(?=\s*(?:CUIT|Domicilio|$))/i
    ];

    // Iteramos sobre el texto LIMPIO
    for (const regex of patterns) {
        const match = cleanText.match(regex);

        // Si encontramos coincidencia y el grupo de captura no está vacío
        if (match && match[1] && match[1].trim().length > 2) {
            return sanitizeName(match[1]);
        }
    }

    // ------------------------------------------------------------------
    // ESTRATEGIA DE RESPALDO (FALLBACK)
    // ------------------------------------------------------------------
    // Si todo falla, volvemos a usar el `text` ORIGINAL (con saltos de línea).
    // A veces el formato es tan estricto línea por línea que el aplanado lo rompe.

    const multilineRegex = /Raz(?:ó|o)n\s*Social[:\s]*\n+([^\n]+)/i;
    const multilineMatch = text.match(multilineRegex);

    if (multilineMatch && multilineMatch[1]) {
        return sanitizeName(multilineMatch[1]);
    }

    return null;
};

// Función auxiliar mejorada para limpiar basura del nombre extraído
const sanitizeName = (rawName: string): string => {
    return rawName
        .replace(/^["']|["']$/g, '') // NUEVO: Quita comillas al inicio o final (común en DGR)
        .replace(/[:.-]+$/, '')       // Quita puntos o dos puntos al final
        .trim()
        .toUpperCase();               // Estandariza a mayúsculas
};