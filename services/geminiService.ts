import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, LeakStatus } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeLeakDescription = async (
  description: string,
  address: string
): Promise<AIAnalysisResult | null> => {
  if (!apiKey) {
    console.warn("API Key missing for Gemini Service");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyse ce rapport de fuite d'eau/gaz. 
      Adresse: ${address}
      Description: ${description}
      
      Détermine la sévérité (Faible, Moyenne, Élevée, Critique), génère un résumé technique court, et suggère un statut (Nouveau, En cours, Résolu, Urgent).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: { type: Type.STRING, enum: ['Faible', 'Moyenne', 'Élevée', 'Critique'] },
            summary: { type: Type.STRING },
            recommendedStatus: { type: Type.STRING, enum: [LeakStatus.NOUVEAU, LeakStatus.EN_COURS, LeakStatus.RESOLU, LeakStatus.URGENT] }
          },
          required: ['severity', 'summary', 'recommendedStatus']
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as AIAnalysisResult;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return null;
  }
};
