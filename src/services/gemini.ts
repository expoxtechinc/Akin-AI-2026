import { GoogleGenAI, Type } from "@google/genai";

const AI_MODEL = "gemini-3-flash-preview";
const IMAGE_MODEL = "gemini-2.5-flash-image";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
}

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  private getClient() {
    if (this.ai) return this.ai;
    let apiKey = '';
    try {
      apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
    } catch (e) {
      apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
    }
    
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
       throw new Error("MISSING_API_KEY");
    }
    this.ai = new GoogleGenAI({ apiKey });
    return this.ai;
  }

  async generateChatResponse(history: { role: "user" | "model"; parts: { text: string }[] }[], prompt: string, systemContext?: string) {
    try {
      const client = this.getClient();
      const response = await client.models.generateContent({
        model: AI_MODEL,
        contents: [
          ...history,
          { role: "user", parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: systemContext || "You are AkinAI, a sophisticated and helpful personal AI assistant created by Akin S. Sokpah from Liberia. Your tone is professional, intelligent, and proactive. Keep responses concise but impactful. Use markdown for formatting. If the user asks to generate an image, describe what you would generate first.",
        }
      });

      return response.text;
    } catch (error: any) {
      if (error.message === "MISSING_API_KEY") throw error;
      console.error("Gemini API Error:", error);
      throw error;
    }
  }

  async *generateChatResponseStream(history: { role: string; parts: { text: string }[] }[], prompt: string, systemContext?: string) {
    try {
      const client = this.getClient();
      const response = await client.models.generateContentStream({
        model: AI_MODEL,
        contents: [
          ...history,
          { role: "user", parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: systemContext || "You are AkinAI, a sophisticated personal AI assistant created by Akin S. Sokpah from Liberia.",
        }
      });
      
      for await (const chunk of response) {
        const chunkText = chunk.text;
        if (chunkText) {
          yield chunkText;
        }
      }
    } catch (error: any) {
      console.error("Gemini Stream Error:", error);
      yield `Error: ${error.message || 'Neural connection interrupted.'}`;
    }
  }

  async generateImage(prompt: string, options: { aspectRatio?: string; quality?: string } = {}) {
    try {
      const client = this.getClient();
      const response = await client.models.generateContent({
        model: IMAGE_MODEL,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          imageConfig: {
            aspectRatio: options.aspectRatio === "16:9" ? "16:9" : 
                         options.aspectRatio === "9:16" ? "9:16" : 
                         options.aspectRatio === "4:3" ? "4:3" : 
                         options.aspectRatio === "3:4" ? "3:4" : "1:1",
            quality: options.quality === "high" ? "high" : "standard"
          } as any
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("Image Gen Error:", error);
      return null;
    }
  }

  async extractTasks(text: string): Promise<Partial<Task>[]> {
    try {
      const client = this.getClient();
      const response = await client.models.generateContent({
        model: AI_MODEL,
        contents: [{ parts: [{ text: `Extract any potential tasks or to-do items from this text: "${text}". Return as a JSON array of objects with title and optional priority (low, medium, high).` }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
              },
              required: ['title']
            }
          }
        }
      });
      return JSON.parse(response.text || "[]");
    } catch (error) {
      console.error("Task Extraction Error:", error);
      return [];
    }
  }

  async generateTTS(text: string, voice: string = "Kore") {
    try {
      const client = this.getClient();
      const response = await client.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: ["AUDIO" as any],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice as any },
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
