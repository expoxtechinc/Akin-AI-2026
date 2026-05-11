import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, ShieldCheck } from 'lucide-react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [status, setStatus] = useState('Initializing Neural Core...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const sequence = [
      { p: 20, s: 'Loading Identity Protocols...' },
      { p: 45, s: 'Syncing with Liberian Node...' },
      { p: 70, s: 'Gating Neural Pipelines...' },
      { p: 90, s: 'Authorizing Operator...' },
      { p: 100, s: 'Access Granted.' },
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < sequence.length) {
        setProgress(sequence[current].p);
        setStatus(sequence[current].s);
        current++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 800);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#020202] flex flex-col items-center justify-center p-6 overflow-hidden"
    >
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-violet-600/10 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 space-y-12 text-center max-w-sm w-full">
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
           className="relative"
        >
          <div className="w-32 h-32 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-[2.5rem] mx-auto flex items-center justify-center text-white shadow-[0_0_80px_rgba(124,58,237,0.3)] border border-white/20 relative z-10">
            <img src="https://www.image2url.com/r2/default/images/1778503153344-dedc222a-cefc-456a-b4b2-50e8b3e2226f.jpg" alt="AkinAI Logo" className="w-24 h-24 object-contain drop-shadow-2xl" />
          </div>
          {/* Pulsing ring */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-violet-500/30 rounded-full"
          />
        </motion.div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic accent-glow">AkinAI</h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-[1px] w-8 bg-white/20" />
              <p className="text-white/40 text-[10px] uppercase tracking-[0.6em] font-black">Neural Pipeline</p>
              <div className="h-[1px] w-8 bg-white/20" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 animate={{ width: `${progress}%` }}
                 className="h-full bg-gradient-to-r from-violet-500 to-indigo-500" 
               />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 animate-pulse">
              {status}
            </p>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-12 text-center space-y-2">
        <p className="text-white/20 text-[9px] uppercase font-bold tracking-[0.4em]">Designed & Built by</p>
        <p className="text-white/40 text-[11px] uppercase font-black tracking-widest italic font-serif">Akin S. Sokpah</p>
      </footer>
    </motion.div>
  );
}
