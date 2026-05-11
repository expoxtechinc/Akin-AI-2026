# AkinAI - Sophisticated Personal AI Assistant

AkinAI is a modern, mobile-first AI companion built with React, Vite, and Google's Gemini AI. It features a polished interface, real-time chat, voice synthesis (TTS), and intelligent proactive assistance.

![AkinAI Preview](https://picsum.photos/seed/akinai/1200/600)

## 🚀 Features

- **Intelligent Conversations**: Powered by Gemini 3 Flash for fast, accurate responses.
- **Voice Synthesis**: Listen to AI responses with high-quality TTS.
- **Mobile-First Design**: Optimized for seamless interaction on any device.
- **Persistent History**: Chat history saved locally for a continuous experience.
- **Modern Aesthetic**: Clean, data-focused UI with glassmorphism and smooth animations.

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 6
- **Styling**: Tailwind CSS 4
- **Animations**: Motion (Framer Motion)
- **AI Platform**: Google Gemini API (@google/genai)
- **Icons**: Lucide React

## 📦 Setup Instructions

### Prerequisites

- Node.js 18+
- A Google Gemini API Key (Get it from [Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/expoxtechinc/AkinAI-2026.git
   cd AkinAI-2026
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the root directory and add your Gemini API Key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *Note: In the AI Studio environment, this is handled via `process.env.GEMINI_API_KEY`.*

4. **Run development server**:
   ```bash
   npm run dev
   ```

## 🚀 Deployment (Vercel)

AkinAI is ready for one-click deployment to Vercel.

1. Push your code to GitHub.
2. Connect your repository to Vercel.
3. Add the following Environment Variable in the Vercel Dashboard:
   - `VITE_GEMINI_API_KEY`: Your Google Gemini API Key.
4. Deployment will be automatic!

## 📄 License

SPDX-License-Identifier: Apache-2.0

---
Created with ❤️ by AkinAI Team.
