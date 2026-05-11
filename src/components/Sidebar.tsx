import React, { useState, useEffect } from 'react';
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
  Layout,
  Download,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/dataService';
import { cn } from '../lib/utils';

type View = 'chat' | 'tasks' | 'profile';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
}

export default function Sidebar({ 
  activeView, 
  setActiveView, 
  isOpen, 
  setIsOpen,
  activeConversationId,
  setActiveConversationId
}: SidebarProps) {
  const { user } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    return dataService.subscribeToConversations(user.uid, (synced) => {
      setConversations(synced);
    });
  }, [user]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

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
          <div className="flex items-center gap-3 mb-10 px-2 lg:px-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-[0_4px_15px_rgba(255,255,255,0.1)] overflow-hidden">
              <img src="https://www.image2url.com/r2/default/images/1778503153344-dedc222a-cefc-456a-b4b2-50e8b3e2226f.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tighter uppercase block italic">AkinAI<span className="text-[9px] opacity-30 font-bold ml-1 not-italic">v3.0</span></span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] uppercase tracking-[0.3em] opacity-40 font-black">Neural Pipeline</span>
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

            {activeView === 'chat' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-8 space-y-4"
              >
                <div className="px-2 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold">Recent Streams</span>
                  <button 
                    onClick={() => setActiveConversationId(null)}
                    className="p-1 px-2 border border-white/5 rounded text-[8px] uppercase font-black tracking-widest text-white/30 hover:text-white transition-all"
                  >
                    + New
                  </button>
                </div>
                
                <div className="space-y-1 max-h-[30vh] overflow-y-auto custom-scrollbar pr-2">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConversationId(conv.id)}
                      className={cn(
                        "w-full text-left px-4 py-2.5 rounded-xl text-xs transition-all group relative truncate flex items-center justify-between",
                        activeConversationId === conv.id 
                          ? "bg-white/5 text-white" 
                          : "text-white/40 hover:text-white/60 hover:bg-white/[0.01]"
                      )}
                    >
                      <span className="truncate flex-1">{conv.title}</span>
                      <X 
                        size={12} 
                        className="opacity-0 group-hover:opacity-40 hover:opacity-100 transition-all ml-2" 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Erase this stream?') && user) {
                            dataService.deleteConversation(user.uid, conv.id);
                            if (activeConversationId === conv.id) setActiveConversationId(null);
                          }
                        }}
                      />
                    </button>
                  ))}
                  {conversations.length === 0 && (
                    <p className="px-4 py-8 text-[10px] text-white/10 uppercase tracking-widest font-black text-center italic">
                      No active neural streams
                    </p>
                  )}
                </div>
              </motion.div>
            )}
            
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
              
              {isInstallable && (
                <button 
                  onClick={handleInstall}
                  className="w-full mt-2 py-4 px-4 bg-white text-black rounded-xl text-[10px] uppercase font-black tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] group"
                >
                  <Download size={14} className="group-hover:bounce" />
                  <span>Install System</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
