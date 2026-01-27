import { PDFParse } from 'pdf-parse';

export const extractTextFromBuffer = async (buffer: Buffer): Promise<string> => {
    try {
        const uint8ArrayData = new Uint8Array(buffer);

        const parser = new PDFParse(uint8ArrayData);

        const data = await parser.getText();
        await parser.destroy()

        console.log(data.text)
        return data.text;
    } catch (error) {
        console.error("Error al leer PDF:", error);
        return "";
    }
};