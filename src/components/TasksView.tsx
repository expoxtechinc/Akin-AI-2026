import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, CheckCircle2, Circle, AlertCircle, Calendar, Sparkles } from 'lucide-react';
import { gemini, Task } from '../services/gemini';
import { cn } from '../lib/utils';

export default function TasksView() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('akin_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    localStorage.setItem('akin_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (title: string, priority: Task['priority'] = 'medium') => {
    const task: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      priority,
    };
    setTasks(prev => [task, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle);
    setNewTaskTitle('');
  };

  const extractAI = async () => {
    if (!newTaskTitle.trim() || isExtracting) return;
    setIsExtracting(true);
    try {
      const extracted = await gemini.extractTasks(newTaskTitle);
      extracted.forEach(t => {
        if (t.title) addTask(t.title, t.priority || 'medium');
      });
      setNewTaskTitle('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] p-6 lg:p-10 relative overflow-hidden monochrome-grid">
      <div className="max-w-3xl mx-auto w-full z-10">
        <header className="mb-10 space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter text-white uppercase accent-glow">Task Engine</h1>
          <p className="text-white/40 text-sm font-light uppercase tracking-widest">Neural Priority Management</p>
        </header>

        {/* Input */}
        <form onSubmit={handleManualAdd} className="relative mb-10 group">
          <div className="glass p-2 rounded-2xl flex items-center gap-2 border-white/10 focus-within:border-violet-500/50 transition-all duration-300">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done? Or paste a brief..."
              className="flex-1 bg-transparent border-none py-3 px-4 text-white placeholder:text-white/20 outline-none text-sm font-light"
            />
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={extractAI}
              disabled={!newTaskTitle.trim() || isExtracting}
              className="px-4 py-2 bg-violet-600/10 text-violet-400 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-violet-500/20 hover:bg-violet-600/20 disabled:opacity-30 transition-all flex items-center gap-2"
            >
              <Sparkles size={14} className={isExtracting ? 'animate-spin' : ''} />
              <span>Akin AI</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="w-10 h-10 bg-violet-600 text-white rounded-xl flex items-center justify-center hover:bg-violet-500 disabled:opacity-30 transition-all shadow-lg shadow-violet-600/20"
            >
              <Plus size={20} />
            </motion.button>
          </div>
        </form>

        {/* Task List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 text-[10px] uppercase font-bold tracking-widest text-white/40 border-b border-white/5 pb-4">
            <span>Pending Tasks ({tasks.filter(t => !t.completed).length})</span>
            <span>Ref: 0xAKIN-TASK</span>
          </div>

          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={cn(
                  "p-4 rounded-2xl glass transition-all flex items-center gap-4 group",
                  task.completed ? "opacity-40 grayscale" : "border-white/5 bg-white/[0.02]"
                )}
              >
                <button 
                  onClick={() => toggleTask(task.id)}
                  className={cn(
                    "transition-colors",
                    task.completed ? "text-emerald-500" : "text-white/20 hover:text-white/60"
                  )}
                >
                  {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </button>

                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "text-sm font-medium tracking-tight",
                    task.completed ? "line-through" : "text-white"
                  )}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={cn(
                      "text-[9px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded",
                      task.priority === 'high' ? "bg-red-500/10 text-red-400" :
                      task.priority === 'medium' ? "bg-amber-500/10 text-amber-400" :
                      "bg-blue-500/10 text-blue-400"
                    )}>
                      {task.priority}
                    </span>
                    <div className="flex items-center gap-1 text-[9px] text-white/30 uppercase font-bold">
                      <Calendar size={10} />
                      <span>{new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-400 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {tasks.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/10">
                <AlertCircle size={32} strokeWidth={1} />
              </div>
              <p className="text-white/30 text-xs uppercase tracking-widest font-bold">Pipeline Clear. No tasks found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/5 blur-[100px] rounded-full pointer-events-none" />
    </div>
  );
}
