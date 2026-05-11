/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import TasksView from './components/TasksView';
import ProfileView from './components/ProfileView';
import SplashScreen from './components/SplashScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AnimatePresence, motion } from 'motion/react';

type View = 'chat' | 'tasks' | 'profile';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [activeView, setActiveView] = useState<View>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  if (authLoading || showSplash) {
    return (
      <AnimatePresence>
        {showSplash ? (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        ) : (
          <div className="h-screen bg-[#020202] flex items-center justify-center">
            <motion.div 
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full shadow-[0_0_20px_rgba(124,58,237,0.3)]"
            />
          </div>
        )}
      </AnimatePresence>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'tasks':
        return <TasksView />;
      case 'profile':
        return <ProfileView />;
      case 'chat':
      default:
        return <Chat onMenuClick={() => setIsSidebarOpen(true)} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#020202] text-[#E5E7EB] font-sans selection:bg-violet-500/30 selection:text-white overflow-hidden">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1 h-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
