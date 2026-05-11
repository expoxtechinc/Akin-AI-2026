import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, CheckCircle2, Circle, AlertCircle, Calendar, Sparkles, SortAsc, AlertTriangle, ArrowUpCircle, MinusCircle, Target, Search } from 'lucide-react';
import { gemini, Task } from '../services/gemini';
import { dataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import FocusTimer from './FocusTimer';

type SortType = 'newest' | 'oldest' | 'priority-high' | 'priority-low';

export default function TasksView() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [sortBy, setSortBy] = useState<SortType>('priority-high');
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;
    const unsubscribe = dataService.subscribeToTasks(user.uid, (syncedTasks) => {
      setTasks(syncedTasks as Task[]);
    });
    return unsubscribe;
  }, [user]);

  const addTask = async (title: string, priority: Task['priority'] = 'medium') => {
    if (!user) return;
    const task: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      priority,
    };
    await dataService.addTask(user.uid, task);
  };

  const toggleTask = async (task: Task) => {
    if (!user) return;
    await dataService.updateTask(user.uid, { ...task, completed: !task.completed });
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    await dataService.deleteTask(user.uid, id);
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
      for (const t of extracted) {
        if (t.title) await addTask(t.title, t.priority || 'medium');
      }
      setNewTaskTitle('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsExtracting(false);
    }
  };

  const sortedTasks = [...tasks]
    .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
    if (sortBy === 'newest') return Number(b.id) - Number(a.id);
    if (sortBy === 'oldest') return Number(a.id) - Number(b.id);
    
    const priorityMap = { high: 3, medium: 2, low: 1 };
    if (sortBy === 'priority-high') return priorityMap[b.priority] - priorityMap[a.priority];
    if (sortBy === 'priority-low') return priorityMap[a.priority] - priorityMap[b.priority];
    
    return 0;
  });

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return <ArrowUpCircle size={10} />;
      case 'medium': return <AlertTriangle size={10} />;
      case 'low': return <MinusCircle size={10} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] p-6 lg:p-10 relative overflow-y-auto custom-scrollbar monochrome-grid">
      <div className="max-w-3xl mx-auto w-full z-10">
        {/* Input */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <header className="space-y-1">
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic accent-glow">Task Engine</h1>
            <p className="text-white/30 text-[10px] uppercase tracking-[0.4em] font-black">Neural Priority Management</p>
          </header>
          
          <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
            <div className="relative group/search flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/search:text-violet-400 transition-colors" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pipeline..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-[10px] font-bold text-white outline-none focus:border-violet-500/50 transition-all uppercase tracking-widest"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-[9px] uppercase font-black tracking-widest text-white/20 whitespace-nowrap">Sort By</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] font-bold text-white/60 outline-none focus:border-violet-500/50 transition-all uppercase tracking-widest appearance-none cursor-pointer"
              >
                <option value="priority-high">Heavy Priority</option>
                <option value="priority-low">Light Priority</option>
                <option value="newest">Recent Nodes</option>
                <option value="oldest">Legacy Records</option>
              </select>
            </div>
          </div>
        </div>

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
            {sortedTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={cn(
                  "p-4 rounded-2xl glass transition-all flex items-center gap-4 group",
                  task.completed ? "opacity-40 grayscale" : "border-white/5 bg-white/[0.02]",
                  !task.completed && (
                    task.priority === 'high' ? "hover:border-red-500/30" :
                    task.priority === 'medium' ? "hover:border-amber-500/30" :
                    "hover:border-blue-500/30"
                  )
                )}
              >
                <button 
                  onClick={() => toggleTask(task)}
                  className={cn(
                    "transition-colors",
                    task.completed ? "text-emerald-500" : "text-white/20 hover:text-white/60"
                  )}
                >
                  {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </button>

                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "text-sm font-bold tracking-tight",
                    task.completed ? "line-through" : "text-white"
                  )}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className={cn(
                      "text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1.5 border transition-all",
                      task.priority === 'high' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      task.priority === 'medium' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    )}>
                      {getPriorityIcon(task.priority)}
                      {task.priority}
                    </span>
                    <div className="flex items-center gap-1.5 text-[9px] text-white/30 uppercase font-bold">
                      <Calendar size={10} className="opacity-50" />
                      <span>{new Date(Number(task.id)).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setFocusTask(task)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-violet-400 transition-all active:scale-90"
                  title="Enter Focus Mode"
                >
                  <Target size={16} />
                </button>

                <button 
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-400 transition-all active:scale-90"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {sortedTasks.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/10">
                {searchQuery ? <Search size={32} strokeWidth={1} /> : <AlertCircle size={32} strokeWidth={1} />}
              </div>
              <p className="text-white/30 text-xs uppercase tracking-widest font-bold">
                {searchQuery ? `No matches found for "${searchQuery}"` : "Pipeline Clear. No tasks found."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/5 blur-[100px] rounded-full pointer-events-none" />

      <AnimatePresence>
        {focusTask && (
          <FocusTimer 
            onClose={() => setFocusTask(null)} 
            taskTitle={focusTask.title} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
