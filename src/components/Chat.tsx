import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  Bot, 
  Sparkles, 
  Volume2, 
  Loader2, 
  Trash2, 
  Mic, 
  MicOff, 
  ThumbsUp, 
  ThumbsDown, 
  Image as ImageIcon,
  Menu,
  X
} from 'lucide-react';
import { gemini } from '../services/gemini';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  imageUrl?: string;
  feedback?: 'up' | 'down';
}

interface ChatProps {
  onMenuClick?: () => void;
}

export default function Chat({ onMenuClick }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('akin_chat_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem('akin_chat_history', JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + ' ' + transcript);
        setIsRecording(false);
      };
      recognitionRef.current.onerror = () => setIsRecording(false);
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, []);

  const handleSend = async (forcedImagePrompt?: string) => {
    const textToProcess = forcedImagePrompt || input;
    if (!textToProcess.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToProcess,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const isImageRequest = textToProcess.toLowerCase().includes('generate image') || 
                             textToProcess.toLowerCase().includes('draw') || 
                             textToProcess.toLowerCase().startsWith('/image');

      if (isImageRequest) {
        const imageUrl = await gemini.generateImage(textToProcess);
        if (imageUrl) {
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'model',
            content: `I've generated this image based on your request: "${textToProcess}"`,
            imageUrl,
            timestamp: Date.now(),
          }]);
          setIsLoading(false);
          return;
        }
      }

      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const profile = JSON.parse(localStorage.getItem('akin_profile') || '{}');
      const systemContext = `You are ${profile.aiName || 'AkinAI'}, a sophisticated personal AI assistant created by Akin S. Sokpah from Liberia. Your tone is ${profile.style || 'Professional'}. Use markdown for formatting.`;

      const res = await gemini.generateChatResponse(history, textToProcess, systemContext);
      
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: res || "I'm sorry, I couldn't process that.",
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message === "MISSING_API_KEY" 
        ? "⚠️ Gemini API Key not found. Please add VITE_GEMINI_API_KEY to your env vars."
        : "⚠️ Connection error. Please check your network.";
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: errorMessage,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakMessage = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const profile = JSON.parse(localStorage.getItem('akin_profile') || '{}');
      const audioUrl = await gemini.generateTTS(text, profile.voice || 'Kore');
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsSpeaking(false);
        audio.play();
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error(error);
      setIsSpeaking(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (e) {
        console.error("Speech recognition failed", e);
      }
    }
  };

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, feedback: type } : m));
  };

  const clearChat = () => {
    if (confirm('Clear all messages?')) {
      setMessages([]);
      localStorage.removeItem('akin_chat_history');
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent transition-colors relative overflow-hidden monochrome-grid">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[30%] bg-violet-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[20%] bg-violet-600/10 blur-[80px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-white/10 glass sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuClick}
            className="p-2 lg:hidden text-white/40 hover:text-white"
          >
            <Menu size={20} />
          </button>
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
            <Sparkles size={22} className="animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-white leading-tight tracking-tight accent-glow">AkinAI</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Neural Engine Active</p>
            </div>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2.5 rounded-full hover:bg-white/5 text-white/40 hover:text-red-400 transition-all duration-300"
          title="Clear chat history"
        >
          <Trash2 size={20} />
        </button>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-8 scroll-smooth z-0"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-24 h-24 rounded-3xl glass flex items-center justify-center text-violet-400 shadow-inner"
            >
              <Bot size={48} strokeWidth={1.5} />
            </motion.div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase accent-glow">Akin Intelligence</h2>
              <p className="text-white/50 max-w-[260px] mx-auto text-sm leading-relaxed font-light">
                High-scale personal framework for logic, execution, and semantic insights.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs mt-6">
              {['Plan my day', 'Draw a futuristic city', 'Summarize notes', 'Creative ideas'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSend(suggestion)}
                  className="p-3 text-[10px] uppercase tracking-widest font-bold glass rounded-xl text-white/60 hover:text-violet-400 hover:border-violet-500/50 transition-all active:scale-95 text-center"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex flex-col gap-2.5 max-w-[88%]",
                m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className={cn(
                "p-4 rounded-[1.5rem] text-[15px] leading-relaxed transition-all relative group",
                m.role === 'user' 
                  ? "bg-violet-600 text-white rounded-tr-none shadow-lg shadow-violet-900/20" 
                  : "glass text-slate-200 border-white/10 rounded-tl-none shadow-lg"
              )}>
                {m.imageUrl && (
                  <img 
                    src={m.imageUrl} 
                    alt="AI Generated" 
                    className="w-full h-auto rounded-xl mb-3 border border-white/10 shadow-2xl" 
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="prose prose-invert max-w-none text-inherit prose-sm md:prose-base">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
                
                {/* GPT Style Feedback (Hover only on desktop) */}
                {m.role === 'model' && (
                  <div className="absolute -right-12 bottom-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleFeedback(m.id, 'up')}
                      className={cn(
                        "p-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-all",
                        m.feedback === 'up' ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-white/20"
                      )}
                    >
                      <ThumbsUp size={12} />
                    </button>
                    <button 
                      onClick={() => handleFeedback(m.id, 'down')}
                      className={cn(
                        "p-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-all",
                        m.feedback === 'down' ? "text-red-400 bg-red-500/10 border-red-500/20" : "text-white/20"
                      )}
                    >
                      <ThumbsDown size={12} />
                    </button>
                  </div>
                )}
              </div>

              <div className={cn(
                "flex items-center gap-3 text-[9px] text-white/30 font-bold uppercase tracking-[0.2em] px-1",
                m.role === 'user' ? "flex-row-reverse text-right" : "flex-row text-left"
              )}>
                <span className="opacity-80 font-mono tracking-tighter">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {m.role === 'model' && (
                  <button 
                    onClick={() => speakMessage(m.content)}
                    className={cn(
                      "flex items-center gap-1.5 transition-all py-1 px-2 rounded-lg border border-white/5",
                      isSpeaking ? "text-violet-400 bg-violet-400/10" : "hover:text-violet-400 hover:bg-white/5"
                    )}
                    disabled={isSpeaking}
                  >
                    <Volume2 size={11} />
                    <span>{isSpeaking ? 'SYNCING' : 'AUDIO'}</span>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 text-violet-400/80 p-5 glass rounded-2xl w-fit"
          >
            <div className="flex gap-1.5">
               <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
               <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
               <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] italic accent-glow">Neural Computation in Progress</span>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <footer className="p-4 bg-transparent border-t border-white/5 safe-bottom z-10 glass rounded-t-3xl">
        <div className="flex items-center gap-2 max-w-3xl mx-auto w-full">
          <button
            onClick={toggleRecording}
            className={cn(
              "p-3 rounded-2xl transition-all shadow-lg",
              isRecording 
                ? "bg-red-500 text-white animate-pulse shadow-red-500/20" 
                : "glass text-white/40 hover:text-white"
            )}
            title="Voice Input"
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <div className="relative flex-1 group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Awaiting instruction..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 pr-14 text-sm focus:border-violet-500/50 focus:bg-white/10 text-white transition-all outline-none shadow-inner font-light placeholder:text-white/20"
            />
            <button
              onClick={() => handleSend()}
              disabled={(!input.trim() && !isRecording) || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-violet-600 text-white rounded-xl disabled:opacity-20 disabled:bg-white/10 transition-all hover:shadow-lg hover:shadow-violet-500/40 active:scale-90"
            >
              <Send size={20} />
            </button>
          </div>
          
          <button
            onClick={() => handleSend('/image ' + input)}
            disabled={!input.trim() || isLoading}
            className="p-3 glass text-white/40 hover:text-violet-400 transition-all rounded-2xl hidden md:flex items-center justify-center"
            title="Generate Image"
          >
            <ImageIcon size={20} />
          </button>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-[9px] text-white/20 uppercase font-black tracking-[0.2em]">
           <span>Created by Akin S. Sokpah</span>
           <span className="text-violet-500/40">●</span>
           <span>Africa Pipeline Active</span>
           <span className="text-violet-500/40">●</span>
           <span>Vercel Optimized</span>
        </div>
      </footer>
    </div>
  );
}
