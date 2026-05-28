import ollama from 'ollama';
import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = 'qwen2.5-coder:1.5b';
const AI_PROVIDER = process.env.AI_PROVIDER || 'ollama';
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
// Log para saber qué motor está activo
console.log(`[AI System] Conectando con el motor: ${AI_PROVIDER.toUpperCase()}`);

export const generateSubtasksFromIA = async (taskTitle: string, taskDescription: string): Promise<string[]> => {
  const prompt = `
    Sos un Agente experto en gestión de proyectos informáticos. 
    Tu tarea es desglosar la siguiente actividad macro en exactamente 4 o 5 subtareas técnicas.
    Tarea Principal: "${taskTitle}"
    Descripción: "${taskDescription}"
    Responde EXCLUSIVAMENTE con un formato de lista JSON de strings, sin texto adicional, sin bloques de código Markdown.
  `;

  try {
    let content: string = "";

    if (AI_PROVIDER === 'gemini') {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key no configurada");
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    // Intentamos hasta 3 veces si nos satura
    let retries = 3;
    while (retries > 0) {
        try {
            const result = await model.generateContent(prompt);
            content = result.response.text();
            console.log('>>> Respuesta de Gemini terminada con éxito');
            break; // Si sale bien, cortamos el loop
        } catch (err: any) {
            if (err.status === 429 && retries > 1) {
                console.warn("Saturación detectada, reintentando en 2 segundos...");
                await delay(2000);
                retries--;
            } else {
                throw err; // Si no es saturación o se acabaron los intentos, lanzamos el error
            }
        }
    }
    } else {
      console.log(">>> Entrando a la lógica de Ollama...");
      const response = await ollama.chat({
        model: MODEL_NAME,
        messages: [{ role: 'user', content: prompt }],
        options: { temperature: 0.2 }
      });
      content = response.message.content;
    }

    const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanContent) as string[];

  } catch (error) {
    console.error('Error en aiService.generateSubtasks:', error);
    // Retorno de seguridad obligatorio para cumplir con Promise<string[]>
    return [
      'Analizar los requerimientos técnicos',
      'Configurar entorno y dependencias',
      'Implementar lógica y endpoints',
      'Realizar pruebas de integración'
    ];
  }
};