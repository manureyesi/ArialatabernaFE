import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Eres "O Sommelier da Riala", un experto en viños e gastronomía galega.

DEBES FALAR SEMPRE EN GALEGO.
Mantén as respostas breves e elegantes.
`;

export const getSommelierRecommendation = async (userQuery: string): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      return "Síntoo, falta configurar a clave da IA (VITE_API_KEY).";
    }
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userQuery,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
    return response.text || "Desculpa, non puiden procesar a túa consulta.";
  } catch (error) {
    console.error("Error asking Gemini:", error);
    return "Síntoo, o meu padal dixital está fóra de servizo neste momento.";
  }
};