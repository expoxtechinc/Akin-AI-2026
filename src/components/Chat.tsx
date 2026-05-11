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
  X,
  Copy,
  Check
} from 'lucide-react';
import { gemini } from '../services/gemini';
import { dataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
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
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (copiedId) {
      const timer = setTimeout(() => setCopiedId(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedId]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = dataService.subscribeToMessages(user.uid, (syncedMessages) => {
      setMessages(syncedMessages);
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

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
    if (!textToProcess.trim() || isLoading || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToProcess,
      timestamp: Date.now(),
    };

    setInput('');
    await dataService.addMessage(user.uid, userMessage);
    setIsLoading(true);

    try {
      const isImageRequest = textToProcess.toLowerCase().includes('generate image') || 
                             textToProcess.toLowerCase().includes('draw') || 
                             textToProcess.toLowerCase().startsWith('/image');

      const modelProfile = await dataService.getUserProfile(user.uid);
      
      if (isImageRequest) {
        const imageUrl = await gemini.generateImage(textToProcess, {
          aspectRatio: modelProfile?.aspectRatio,
          quality: modelProfile?.quality
        });
        if (imageUrl) {
          await dataService.addMessage(user.uid, {
            id: (Date.now() + 1).toString(),
            role: 'model',
            content: `Generated neural visualization for: "${textToProcess}"`,
            imageUrl,
            timestamp: Date.now(),
          });
          return;
        }
      }

      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const systemContext = `You are ${modelProfile?.aiName || 'AkinAI'}, a sophisticated personal AI assistant created by Akin S. Sokpah from Liberia. Your tone is ${modelProfile?.style || 'Professional'}. Use markdown for formatting.`;

      // Streaming implementation
      const assistantMsgId = (Date.now() + 1).toString();
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: 'model',
        content: '',
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, assistantMsg]);
      let fullContent = '';

      const stream = gemini.generateChatResponseStream(history, textToProcess, systemContext);
      
      for await (const chunk of stream) {
        fullContent += chunk;
        setMessages(prev => prev.map(m => 
          m.id === assistantMsgId ? { ...m, content: fullContent } : m
        ));
      }

      await dataService.addMessage(user.uid, { ...assistantMsg, content: fullContent });

    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message === "MISSING_API_KEY" 
        ? "⚠️ Gemini API Key not found. Please add VITE_GEMINI_API_KEY to your env vars."
        : "⚠️ Connection error. Please check your network.";
        
      await dataService.addMessage(user.uid, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: errorMessage,
        timestamp: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const speakMessage = async (text: string) => {
    if (isSpeaking || !user) return;
    setIsSpeaking(true);
    try {
      const modelProfile = await dataService.getUserProfile(user.uid);
      const audioUrl = await gemini.generateTTS(text, modelProfile?.voice || 'Kore');
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

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
  };

  const clearChat = async () => {
    if (confirm('Clear all messages?') && user) {
      await dataService.clearMessages(user.uid);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] relative overflow-hidden transition-colors">
      {/* Background Decor */}
      <div className="absolute inset-0 monochrome-grid opacity-10 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[50%] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-white/5 glass sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="p-2 -ml-2 lg:hidden text-white/40 hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">AkinAI Neural Engine</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={clearChat}
            className="group flex items-center gap-2 text-[9px] uppercase font-black tracking-widest text-white/20 hover:text-red-400 transition-all"
          >
            <Trash2 size={12} className="opacity-50 group-hover:opacity-100" />
            <span className="hidden sm:inline">Flush Cache</span>
          </button>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 lg:px-0 py-10 scroll-smooth custom-scrollbar"
      >
        <div className="max-w-3xl mx-auto space-y-12 pb-32">
          {messages.length === 0 && (
            <div className="py-20 flex flex-col items-center text-center space-y-8">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 bg-white shadow-[0_0_40px_rgba(255,255,255,0.05)] rounded-3xl flex items-center justify-center"
              >
                <img src="https://www.image2url.com/r2/default/images/1778503153344-dedc222a-cefc-456a-b4b2-50e8b3e2226f.jpg" alt="Logo" className="w-14 h-14 object-contain" />
              </motion.div>
              <div className="space-y-4">
                <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic accent-glow">Akin Intelligence</h1>
                <p className="text-white/30 text-xs uppercase tracking-[0.4em] font-black max-w-xs mx-auto leading-loose">
                  Liberian High-Performance Framework for Logic & Cognition.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 w-full max-w-sm px-4">
                {['Strategic Plan', 'Neural Visualization', 'Code Synthesis', 'Logic Audit'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSend(suggestion)}
                    className="p-4 text-[9px] uppercase tracking-[0.3em] font-black glass rounded-2xl text-white/30 hover:text-white hover:border-white/20 border-white/5 transition-all active:scale-95 text-center"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <AnimatePresence mode="popLayout" initial={false}>
            {messages.map((m, idx) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className={cn(
                  "group flex gap-4 lg:gap-8",
                  m.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Identity Handle */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-black uppercase tracking-tighter border-2",
                  m.role === 'user' 
                    ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                    : "bg-black text-white border-white/10"
                )}>
                  {m.role === 'user' ? 'OP' : 'AI'}
                </div>

                {/* Cognitive Output */}
                <div className={cn(
                   "flex-1 max-w-[85%] space-y-4",
                   m.role === 'user' ? "text-right" : "text-left"
                )}>
                  {m.imageUrl && (
                    <motion.div 
                      layoutId={`img-${m.id}`}
                      className={cn(
                        "rounded-2xl overflow-hidden glass border border-white/10 shadow-2xl max-w-lg inline-block",
                        m.role === 'user' ? "ml-auto" : "mr-auto"
                      )}
                    >
                      <img 
                        src={m.imageUrl} 
                        alt="Neural Synthesis" 
                        className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-700" 
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  )}
                  
                  <div className={cn(
                    "markdown-body text-[15px] leading-relaxed tracking-tight prose prose-invert max-w-none inline-block",
                    m.role === 'user' ? "text-white font-medium" : "text-white/80"
                  )}>
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                    {m.content === '' && m.role === 'model' && (
                      <div className="flex gap-1.5 py-2">
                        <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                      </div>
                    )}
                  </div>
                  
                  {/* Action Cluster */}
                  {m.role === 'model' && m.content !== '' && (
                    <div className="flex items-center gap-3 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleCopy(m.id, m.content)}
                        className={cn(
                          "flex items-center gap-2 p-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-[9px] font-black uppercase tracking-widest transition-all",
                          copiedId === m.id ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-white/20"
                        )}
                      >
                        {copiedId === m.id ? <Check size={10} /> : <Copy size={10} />}
                        <span>{copiedId === m.id ? 'Copied' : 'Clone'}</span>
                      </button>
                      
                      <button 
                        onClick={() => speakMessage(m.content)}
                        className={cn(
                          "flex items-center gap-2 p-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-[9px] font-black uppercase tracking-widest transition-all",
                          isSpeaking ? "text-violet-400 bg-violet-400/10" : "text-white/20"
                        )}
                        disabled={isSpeaking}
                      >
                        <Volume2 size={10} />
                        <span>Audio</span>
                      </button>

                      <div className="h-3 w-[1px] bg-white/5 mx-1" />

                      <button 
                        onClick={() => handleFeedback(m.id, 'up')}
                        className={cn(
                          "p-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-white/20 transition-all",
                          m.feedback === 'up' && "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        )}
                      >
                        <ThumbsUp size={10} />
                      </button>
                      <button 
                        onClick={() => handleFeedback(m.id, 'down')}
                        className={cn(
                          "p-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-white/20 transition-all",
                          m.feedback === 'down' && "text-red-400 bg-red-500/10 border-red-500/20"
                        )}
                      >
                        <ThumbsDown size={10} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Primary Input Cluster */}
      <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-8 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <div className="relative group">
            <div className="glass rounded-[2rem] p-2 pl-6 pr-3 flex items-center gap-3 border-white/10 focus-within:border-white/20 transition-all duration-500 shadow-2xl">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Message AkinAI..."
                className="flex-1 bg-transparent py-4 text-sm text-white placeholder:text-white/20 outline-none font-medium"
                disabled={isLoading}
              />
              
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleRecording}
                  className={cn(
                    "p-3 rounded-2xl transition-all duration-300",
                    isRecording 
                      ? "bg-red-500/20 text-red-500 scale-110 shadow-[0_0_15px_rgba(239,68,68,0.3)]" 
                      : "hover:bg-white/5 text-white/20"
                  )}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                
                <button 
                  onClick={() => handleSend()}
                  disabled={(!input.trim() && !isRecording) || isLoading}
                  className="bg-white text-black p-3 rounded-2xl hover:bg-neutral-200 disabled:opacity-20 transition-all duration-300 shadow-lg active:scale-95"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <Send size={20} strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between items-center px-4">
               <p className="text-[9px] uppercase font-black tracking-[0.3em] text-white/10">
                 Neural Pipeline Active // Akin S. Sokpah Edition
               </p>
               <div className="flex items-center gap-4">
                 <button className="text-[9px] uppercase font-black tracking-widest text-white/10 hover:text-white/30 transition-colors">Documentation</button>
                 <button className="text-[9px] uppercase font-black tracking-widest text-white/10 hover:text-white/30 transition-colors">Privacy Node</button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
