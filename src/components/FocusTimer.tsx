import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, X, Target } from 'lucide-react';
import { cn } from '../lib/utils';

interface FocusTimerProps {
  onClose: () => void;
  taskTitle?: string;
}

export default function FocusTimer({ onClose, taskTitle }: FocusTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setIsFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setIsFinished(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-6 lg:p-0"
    >
      <div className="absolute inset-0 bg-[#050505]/95 backdrop-blur-2xl" onClick={onClose} />
      
      <div className="w-full max-w-sm glass rounded-[3rem] p-8 border-white/10 relative z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-violet-600/10 blur-[80px] rounded-full pointer-events-none" />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-white/20 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center space-y-8">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-violet-400">
              <Target size={16} />
              <span className="text-[10px] uppercase font-black tracking-[0.3em]">Neural Focus Active</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight px-4 line-clamp-1">
              {taskTitle || "Concentration Node"}
            </h2>
          </div>

          {/* Progress Ring */}
          <div className="relative flex items-center justify-center">
            <svg className="w-48 h-48 -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-white/5"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * 88}
                initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                animate={{ 
                  strokeDashoffset: (2 * Math.PI * 88) * (timeLeft / (25 * 60)) 
                }}
                className="text-violet-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black font-mono text-white tracking-tighter">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[9px] uppercase font-black tracking-widest text-white/30 mt-2">Time Remaining</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4">
            <button
              onClick={resetTimer}
              className="p-4 rounded-2xl glass border-white/5 text-white/30 hover:text-white transition-all active:scale-95"
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={toggleTimer}
              className={cn(
                "p-6 rounded-[2rem] transition-all active:scale-95 shadow-xl",
                isActive 
                  ? "bg-white/5 text-white border border-white/10" 
                  : "bg-white text-black shadow-white/10"
              )}
            >
              {isActive ? <Pause size={32} /> : <Play size={32} fill="currentColor" />}
            </button>
            <div className="w-[52px]" /> {/* Spacer for symmetry */}
          </div>

          <AnimatePresence>
            {isFinished && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-emerald-400 text-[10px] uppercase font-black tracking-[0.2em] animate-pulse"
              >
                Neural Cycle Complete
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
