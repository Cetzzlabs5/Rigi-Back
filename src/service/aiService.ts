import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Definimos una interfaz para las opciones de configuración
interface AIGenerationOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
}

export class AIService {
    private openai: OpenAI;
    private defaultModel: string = "meta-llama/llama-3.3-70b-instruct:free";

    constructor() {
        // Configuración específica para OpenRouter
        this.openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY,
            defaultHeaders: {
                "HTTP-Referer": process.env.APP_URL || "http://localhost:3000", // Para rankings de OpenRouter
                "X-Title": process.env.APP_NAME || "My App",
            },
        });
    }

    /**
     * Genera una respuesta de chat completando el prompt
     * @param prompt El mensaje del usuario
     * @param options Opciones adicionales (modelo, temperatura, etc.)
     */
    public async generateText(prompt: string, options?: AIGenerationOptions): Promise<string | null> {
        try {
            const completion = await this.openai.chat.completions.create({
                model: options?.model || this.defaultModel,
                messages: [
                    {
                        role: "system",
                        content: options?.systemPrompt || "Eres un asistente útil. Tu funcion es extraer informacion de documentos de AFIP. Solo debe extraer la informacion solicitada y nada mas. No agregues explicaciones ni nada por el estilo. Responde unicamente con la informacion solicitada."
                    },
                    {
                        role: "user",
                        content: prompt
                    },
                ],
                temperature: options?.temperature ?? 0.7,
                max_tokens: options?.maxTokens,
            });

            return completion.choices[0]?.message?.content || null;
        } catch (error) {
            console.error("Error connecting to OpenRouter:", error);
            throw new Error("Failed to generate AI response");
        }
    }

    // Puedes agregar más métodos aquí, por ejemplo para Streaming o JSON Mode
}

// Exportamos una instancia única (Singleton) para reusar la conexión
export const aiService = new AIService();