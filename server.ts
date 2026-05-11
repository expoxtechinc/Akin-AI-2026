import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import { config as dotenvConfig } from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenvConfig();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  const getApiKey = () => {
    const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY' || key.includes('ENTER_YOUR')) {
      return null;
    }
    return key;
  };

  // Gemini Proxy
  app.post('/api/ai/chat', async (req, res) => {
    const { history, prompt, systemContext, model } = req.body;
    const apiKey = getApiKey();

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY_NOT_CONFIGURED' });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: model || 'gemini-3-flash-preview',
        contents: [
          ...history,
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: systemContext
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ai/stream', async (req, res) => {
    const { history, prompt, systemContext, model } = req.body;
    const apiKey = getApiKey();

    if (!apiKey) {
      res.write(`data: ${JSON.stringify({ error: 'GEMINI_API_KEY_NOT_CONFIGURED' })}\n\n`);
      return res.end();
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContentStream({
        model: model || 'gemini-3-flash-preview',
        contents: [
          ...history,
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: systemContext
        }
      });

      for await (const chunk of response) {
        const text = chunk.text;
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    } catch (error: any) {
      console.error('Gemini Stream Error:', error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    } finally {
      res.end();
    }
  });

  app.post('/api/ai/image', async (req, res) => {
    const { prompt, options } = req.body;
    const apiKey = getApiKey();

    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY_NOT_CONFIGURED' });

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          imageConfig: {
            aspectRatio: options?.aspectRatio || '1:1',
          }
        }
      });

      const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (part?.inlineData) {
        res.json({ imageUrl: `data:image/png;base64,${part.inlineData.data}` });
      } else {
        res.status(500).json({ error: 'No image data returned' });
      }
    } catch (error: any) {
      console.error('Image Gen Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ai/tts', async (req, res) => {
    const { text, voice } = req.body;
    const apiKey = getApiKey();

    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY_NOT_CONFIGURED' });

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ role: 'user', parts: [{ text }] }],
        config: {
          responseModalities: ["AUDIO" as any],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        res.json({ audioUrl: `data:audio/wav;base64,${base64Audio}` });
      } else {
        res.status(500).json({ error: 'No audio data returned' });
      }
    } catch (error: any) {
      console.error('TTS Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'active', timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Neural Core Server active at http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
