import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, LogIn, ShieldCheck, Globe } from 'lucide-react';

export default function Login() {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden monochrome-grid">
      {/* Background Decorative Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full z-10 glass p-10 rounded-[2.5rem] border-white/5 space-y-10 text-center"
      >
        <div className="space-y-4">
          <div className="w-20 h-20 bg-violet-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-2xl shadow-violet-600/40">
            <Sparkles size={40} className="animate-pulse" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tighter text-white uppercase accent-glow">AkinAI</h1>
            <p className="text-white/40 text-xs uppercase tracking-[0.4em] font-bold">Neural Identity Core</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
             <p className="text-white/60 text-sm font-light leading-relaxed">
              Experience the next generation of personal intelligence. Developed by <strong>Akin S. Sokpah</strong> in Liberia.
            </p>
            <div className="flex items-center justify-center gap-4 text-[10px] uppercase font-bold tracking-widest text-white/30">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe size={12} className="text-blue-500" />
                <span>Global</span>
              </div>
            </div>
          </div>

          <button
            onClick={signIn}
            className="w-full py-4 flex items-center justify-center gap-3 bg-white text-black rounded-2xl font-bold hover:bg-white/90 transition-all active:scale-95 shadow-xl"
          >
            <LogIn size={20} />
            <span>Sign in with Google</span>
          </button>

          <p className="text-[9px] text-white/20 uppercase font-black tracking-widest">
            AkinAI v2.5 ● Liberia Pipeline Active
          </p>
        </div>
      </motion.div>

      {/* Credit Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.2em]">
          Designed & Built by <span className="text-white/40">Akin S. Sokpah</span>
        </p>
      </motion.div>
    </div>
  );
}
