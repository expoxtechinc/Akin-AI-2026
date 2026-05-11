import React from 'react';
import { motion } from 'motion/react';
import { 
  MessageSquare, 
  CheckSquare, 
  User, 
  Settings, 
  Github, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Layout
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

type View = 'chat' | 'tasks' | 'profile';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ activeView, setActiveView, isOpen, setIsOpen }: SidebarProps) {
  const { user } = useAuth();
  const menuItems = [
    { id: 'chat', label: 'Neural Chat', icon: MessageSquare, accent: 'violet' },
    { id: 'tasks', label: 'Task Engine', icon: CheckSquare, accent: 'emerald' },
    { id: 'profile', label: 'Akin Profile', icon: User, accent: 'blue' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isOpen ? 0 : -300,
          width: isOpen ? 280 : 0
        }}
        className={cn(
          "fixed inset-y-0 left-0 bg-[#050505] border-r border-white/5 z-50 lg:relative lg:translate-x-0 lg:w-72 flex flex-col glass transition-all overflow-hidden"
        )}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-violet-600/20">
              A
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight uppercase block">AkinAI <span className="text-[10px] opacity-40 font-normal ml-1">v2.1</span></span>
              <div className="flex items-center gap-1">
                <ShieldCheck size={10} className="text-emerald-500" />
                <span className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Secure Core</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            <div className="px-2 mb-4">
              <span className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold">Primary Control</span>
            </div>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id as View);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group relative",
                  activeView === item.id 
                    ? "bg-white/5 text-white" 
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.02]"
                )}
              >
                {activeView === item.id && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-0 w-1 h-5 bg-violet-500 rounded-full" 
                  />
                )}
                <item.icon size={20} className={cn(
                  "transition-transform",
                  activeView === item.id ? "scale-110" : "group-hover:scale-110"
                )} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
            
            {user && (
              <div className="pt-4 mt-4 border-t border-white/5">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white/30">
                        {user.displayName?.[0] || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{user.displayName || 'Akin User'}</p>
                    <p className="text-[9px] text-white/30 uppercase tracking-widest font-black truncate">Authorized</p>
                  </div>
                </div>
              </div>
            )}
          </nav>

          {/* System Monitor */}
          <div className="mt-auto space-y-6">
            <div className="p-4 rounded-xl border border-white/5 bg-white/5 space-y-4">
              <div>
                <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2">
                  <span>Neural Pipeline</span>
                  <Zap size={10} className="text-violet-400" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-white/70">Optimization</span>
                  <span className="text-xs font-mono text-emerald-400">98%</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '98%' }}
                    className="h-full bg-violet-500" 
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest opacity-40">
                <span>Latency</span>
                <span className="font-mono">14ms</span>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-1">
              <a 
                href="https://github.com/expoxtechinc/AkinAI-2026" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-2 text-[10px] text-white/40 hover:text-white/80 transition-colors uppercase font-bold tracking-widest"
              >
                <div className="flex items-center gap-2">
                  <Github size={12} />
                  <span>Repository</span>
                </div>
                <ExternalLink size={10} />
              </a>
              <button className="w-full py-3 pill-btn text-[10px] uppercase tracking-[0.2em] font-bold mt-4 hover:bg-white/10 transition-all">
                View Portfolio
              </button>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
