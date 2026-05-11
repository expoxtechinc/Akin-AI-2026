import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Sparkles, Volume2, Loader2, Trash2 } from 'lucide-react';
import { gemini } from '../services/gemini';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('akin_chat_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('akin_chat_history', JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const res = await gemini.generateChatResponse(history, input);
      
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
        ? "⚠️ Gemini API Key not found. Please add VITE_GEMINI_API_KEY to your environment variables."
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
      const audioUrl = await gemini.generateTTS(text);
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
              {['Plan my day', 'Write a joke', 'Analysis', 'Creative ideas'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="p-3 text-[10px] uppercase tracking-widest font-bold glass rounded-xl text-white/60 hover:text-violet-400 hover:border-violet-500/50 transition-all active:scale-95"
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
                "p-4 rounded-[1.5rem] text-[15px] leading-relaxed transition-all",
                m.role === 'user' 
                  ? "bg-violet-600 text-white rounded-tr-none shadow-lg shadow-violet-900/20" 
                  : "glass text-slate-200 border-white/10 rounded-tl-none shadow-lg"
              )}>
                {m.content}
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
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-violet-400/80 p-3 glass rounded-2xl w-fit"
          >
            <Loader2 size={16} className="animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-widest italic accent-glow">NEURAL COMPUTE</span>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <footer className="p-4 bg-transparent border-t border-white/5 safe-bottom z-10 glass rounded-t-3xl">
        <div className="relative flex items-center group max-w-2xl mx-auto w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Awaiting instruction..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 pr-14 text-sm focus:border-violet-500/50 focus:bg-white/10 text-white transition-all outline-none shadow-inner font-light placeholder:text-white/20"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2.5 bg-violet-600 text-white rounded-xl disabled:opacity-20 disabled:bg-white/10 transition-all hover:shadow-lg hover:shadow-violet-500/40 active:scale-90"
          >
            <Send size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}
