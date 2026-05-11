import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, LogIn, ShieldCheck, Globe, Cpu, Zap, Fingerprint } from 'lucide-react';

export default function Login() {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-600/10 blur-[100px] rounded-full" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="absolute inset-0 monochrome-grid opacity-10 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-lg w-full z-10 glass border-white/5 p-12 rounded-[3.5rem] space-y-12 text-center backdrop-blur-3xl relative"
      >
        {/* Glow behind the logo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-violet-500/20 blur-3xl -z-10 rounded-full" />

        <div className="space-y-6">
          <motion.div 
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-[2rem] mx-auto flex items-center justify-center text-white shadow-[0_20px_50px_rgba(124,58,237,0.3)] border border-white/20"
          >
            <Cpu size={48} className="text-white drop-shadow-lg" />
          </motion.div>
          
          <div className="space-y-2">
            <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic accent-glow">AkinAI</h1>
            <div className="flex items-center justify-center gap-3 overflow-hidden">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/20" />
              <p className="text-white/40 text-[10px] uppercase tracking-[0.5em] font-black">Neural Identity Core</p>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/20" />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
               <Fingerprint size={12} />
               <span>Biometric Verification Active</span>
             </div>
             <p className="text-white/60 text-base font-medium leading-relaxed max-w-sm mx-auto">
              Precision execution and semantic intelligence. Built by <span className="text-white font-bold underline decoration-violet-500 underline-offset-4">Akin S. Sokpah</span> in Liberia.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-left space-y-2">
              <Zap size={20} className="text-amber-400" />
              <p className="text-[10px] font-black text-white/40 uppercase tracking-wide">Performance</p>
              <p className="text-sm font-bold text-white tracking-tight">Ultra Low Latency</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-left space-y-2">
              <ShieldCheck size={20} className="text-emerald-400" />
              <p className="text-[10px] font-black text-white/40 uppercase tracking-wide">Security</p>
              <p className="text-sm font-bold text-white tracking-tight">Encrypted Logic</p>
            </div>
          </div>

          <button
            onClick={signIn}
            className="group relative w-full py-5 bg-white text-black rounded-[2rem] font-black uppercase text-sm tracking-widest hover:bg-white overflow-hidden transition-all active:scale-[0.98] shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-center gap-3 relative z-10">
              <LogIn size={20} strokeWidth={3} />
              <span>Initiate Authentication Protocol</span>
            </div>
          </button>

          <footer className="pt-4 flex flex-col items-center gap-4 border-t border-white/5">
             <div className="flex items-center gap-6">
               <span className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em]">Pipeline v2.9</span>
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em]">Monrovia Node Active</span>
             </div>
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
