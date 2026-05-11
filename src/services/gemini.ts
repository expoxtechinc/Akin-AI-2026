import { Type } from "@google/genai";

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
  async generateChatResponse(history: { role: "user" | "model"; parts: { text: string }[] }[], prompt: string, systemContext?: string) {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, prompt, systemContext, model: AI_MODEL })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.text;
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }

  async *generateChatResponseStream(history: { role: string; parts: { text: string }[] }[], prompt: string, systemContext?: string) {
    try {
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, prompt, systemContext, model: AI_MODEL })
      });

      if (!response.body) throw new Error('No response body');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.error) throw new Error(data.error);
            if (data.text) yield data.text;
          }
        }
      }
    } catch (error: any) {
      console.error("Gemini Stream Error:", error);
      yield `Error: ${error.message || 'Neural connection interrupted.'}`;
    }
  }

  async generateImage(prompt: string, options: { aspectRatio?: string; quality?: string } = {}) {
    try {
      const response = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, options })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.imageUrl;
    } catch (error) {
      console.error("Image Gen Error:", error);
      return null;
    }
  }

  async extractTasks(text: string): Promise<Partial<Task>[]> {
    try {
      const prompt = `Extract any potential tasks or to-do items from this text: "${text}". Return as a JSON array of objects with title and optional priority (low, medium, high).`;
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          history: [], 
          prompt, 
          model: AI_MODEL, 
          systemContext: "You are a task extraction engine. Output ONLY raw JSON." 
        })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return JSON.parse(data.text || "[]");
    } catch (error) {
      console.error("Task Extraction Error:", error);
      return [];
    }
  }

  async generateTTS(text: string, voice: string = "Kore") {
    try {
      const response = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.audioUrl;
    } catch (error) {
      console.error("TTS Error:", error);
      return null;
    }
  }
}

export const gemini = new GeminiService();
