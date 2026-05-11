import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, LogIn, ShieldCheck, Globe, Cpu, Zap, Fingerprint, Mail, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const { signUpCustom, signInCustom } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        if (!name || !email) throw new Error('Please enter all parameters');
        await signUpCustom(email, name);
      } else {
        if (!email) throw new Error('Neural identity required');
        await signInCustom(email);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication protocol failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-violet-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="absolute inset-0 monochrome-grid opacity-5 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full z-10 glass border-white/5 p-10 rounded-[3rem] space-y-10 text-center backdrop-blur-3xl relative"
      >
        {/* Glow behind the logo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-violet-500/20 blur-3xl -z-10 rounded-full" />

        <div className="space-y-4">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-20 h-20 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-[2rem] mx-auto flex items-center justify-center text-white shadow-2xl border border-white/20"
          >
            <Cpu size={40} />
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic accent-glow text-shadow-lg">AkinAI</h1>
            <p className="text-white/30 text-[9px] uppercase tracking-[0.4em] font-black">Neural Identity Core</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div
                key="signup-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-2">Operator Name</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:border-violet-500/50 outline-none transition-all placeholder:text-white/10 shadow-inner"
                    placeholder="Enter full name"
                    required={mode === 'signup'}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-2">Neural Signature (Email)</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:border-violet-500/50 outline-none transition-all placeholder:text-white/10 shadow-inner"
                placeholder="operator@nexus.ai"
                required
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-bold text-red-400 uppercase tracking-widest text-center"
            >
              !! {error} !!
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-white/95 transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin text-black" size={18} />
            ) : (
              <>
                <span>{mode === 'signin' ? 'Initiate Link' : 'Establish Record'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="pt-6 border-t border-white/5 space-y-4">
          <button 
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-[10px] uppercase font-bold text-white/40 hover:text-white transition-colors tracking-widest"
          >
            {mode === 'signin' ? "No identity record found? Register" : "Already indexed? Log in"}
          </button>

          <footer className="flex items-center justify-center gap-6 saturate-0 opacity-40 grayscale">
            <ShieldCheck size={16} className="text-white" />
            <Globe size={16} className="text-white" />
            <Zap size={16} className="text-white" />
          </footer>
        </div>
      </motion.div>

      {/* Credit Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 text-center space-y-2"
      >
        <p className="text-white/30 text-[11px] uppercase font-bold tracking-[0.4em]">
          Designed & Architected by
        </p>
        <h2 className="text-white/60 text-lg font-black tracking-tighter uppercase italic">Akin S. Sokpah</h2>
      </motion.div>
    </div>
  );
}
