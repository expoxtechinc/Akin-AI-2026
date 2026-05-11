import { GoogleGenAI } from "@google/genai";

const AI_MODEL = "gemini-3-flash-preview";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables.");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateChatResponse(history: { role: "user" | "model"; parts: { text: string }[] }[], prompt: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: AI_MODEL,
        contents: [
          ...history,
          { role: "user", parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: "You are AkinAI, a sophisticated and helpful personal AI assistant. Your tone is professional, intelligent, and proactive. Keep responses concise but impactful. Use markdown for formatting.",
        }
      });

      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }

  async generateTTS(text: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: ["AUDIO" as any],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Kore" },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return `data:audio/wav;base64,${base64Audio}`;
      }
      return null;
    } catch (error) {
      console.error("TTS Error:", error);
      return null;
    }
  }
}

export const gemini = new GeminiService();
