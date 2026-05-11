/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import TasksView from './components/TasksView';
import ProfileView from './components/ProfileView';
import { AnimatePresence, motion } from 'motion/react';

type View = 'chat' | 'tasks' | 'profile';

export default function App() {
  const [activeView, setActiveView] = useState<View>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="flex h-screen bg-[#050505] text-[#E5E7EB] font-sans selection:bg-violet-500/30 selection:text-white overflow-hidden">
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
