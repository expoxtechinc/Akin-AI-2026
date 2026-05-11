import React from 'react';
import { MessageSquare, CheckSquare, User } from 'lucide-react';
import { cn } from '../lib/utils';

type View = 'chat' | 'tasks' | 'profile';

interface BottomNavProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

export default function BottomNav({ activeView, setActiveView }: BottomNavProps) {
  const items = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#050505]/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-6 z-50 safe-bottom">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id as View)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              isActive ? "text-white" : "text-white/20"
            )}
          >
            <div className={cn(
              "p-1.5 rounded-xl transition-all",
              isActive && "bg-white/5 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            )}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[9px] uppercase font-black tracking-widest">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
