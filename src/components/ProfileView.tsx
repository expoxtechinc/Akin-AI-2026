import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Shield, Globe, Award, MapPin, RefreshCw, LogOut, Sparkles, Cpu, Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/dataService';
import { cn } from '../lib/utils';

export default function ProfileView() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    aiName: 'AkinAI',
    voice: 'Kore',
    style: 'Professional',
    location: 'Liberia',
    aspectRatio: '1:1',
    quality: 'standard',
    ttsEnabled: true,
    highContrast: false,
    memory: [
      "Principal: Akin S. Sokpah",
      "Deployment: Monrovia, Liberia",
      "Focus: High-Performance Neural Execution"
    ]
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      const data = await dataService.getUserProfile(user.uid);
      if (data) setProfile(data as any);
      else {
        // Initial setup
        const initial = {
          name: user.displayName || 'Akin User',
          aiName: 'AkinAI',
          voice: 'Kore',
          style: 'Professional',
          location: 'Liberia',
          aspectRatio: '1:1',
          quality: 'standard',
          ttsEnabled: true,
          highContrast: false,
          memory: [
            "Principal: Akin S. Sokpah",
            "Deployment: Monrovia, Liberia",
            "Focus: High-Performance Neural Execution"
          ]
        };
        setProfile(initial);
        await dataService.setUserProfile(user.uid, initial);
      }
    };
    loadProfile();
  }, [user]);

  const saveProfile = async (newProfile: any) => {
    if (!user) return;
    setProfile(newProfile);
    setIsSaving(true);
    try {
      await dataService.setUserProfile(user.uid, newProfile);
    } finally {
      setIsSaving(false);
    }
  };

  const voices = ['Aeon', 'Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr', 'Orion', 'Lyra'];
  const styles = ['Professional', 'Creative', 'Minimalist', 'Detailed'];
  const aspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];
  const qualities = ['standard', 'high'];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] p-6 lg:p-10 relative overflow-y-auto custom-scrollbar monochrome-grid">
      <div className="max-w-3xl mx-auto w-full z-10">
        <header className="mb-12 flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter text-white uppercase accent-glow">Identity Core</h1>
            <p className="text-white/40 text-sm font-light uppercase tracking-widest">Sokpah Intelligence Protocols</p>
          </div>
          <div className="relative">
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-[2rem] bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white shadow-[0_20px_50px_rgba(124,58,237,0.3)] overflow-hidden border-2 border-white/20 group relative">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
              ) : (
                <User size={48} className="opacity-40" />
              )}
              <div className="absolute inset-0 bg-violet-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {isSaving && (
              <div className="absolute -bottom-2 -right-2 p-2 bg-violet-600 shadow-lg shadow-violet-600/40 rounded-full animate-spin">
                <RefreshCw size={14} className="text-white" />
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="glass border-white/5 p-8 rounded-[2.5rem] space-y-8 backdrop-blur-3xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                <Shield size={20} />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight uppercase tracking-widest">Core Parameters</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30 ml-2">Operator Identity</label>
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  onBlur={() => saveProfile(profile)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-violet-500/50 outline-none transition-all font-medium"
                  placeholder="Enter name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30 ml-2">Liberia Deployment Node</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" />
                  <input 
                    type="text" 
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    onBlur={() => saveProfile(profile)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:border-violet-500/50 outline-none transition-all font-medium"
                    placeholder="Location"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="glass border-white/5 p-8 rounded-[2.5rem] space-y-8 backdrop-blur-3xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Globe size={20} />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight uppercase tracking-widest">Cognitive Overlay</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30 ml-2">System Designation</label>
                <input 
                  type="text" 
                  value={profile.aiName}
                  onChange={(e) => setProfile({ ...profile, aiName: e.target.value })}
                  onBlur={() => saveProfile(profile)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-violet-500/50 outline-none transition-all font-medium font-mono"
                  placeholder="AI Name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30 ml-2">Neural Voice</label>
                  <select 
                    value={profile.voice}
                    onChange={(e) => saveProfile({ ...profile, voice: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-4 text-xs text-white focus:border-violet-500/50 outline-none transition-all font-bold appearance-none cursor-pointer"
                  >
                    {voices.map(v => <option key={v} value={v} className="bg-[#111]">{v}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30 ml-2">Style Preference</label>
                  <select 
                    value={profile.style}
                    onChange={(e) => saveProfile({ ...profile, style: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-4 text-xs text-white focus:border-violet-500/50 outline-none transition-all font-bold appearance-none cursor-pointer"
                  >
                    {styles.map(s => <option key={s} value={s} className="bg-[#111]">{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30 ml-2">Image Aspect Ratio</label>
                  <select 
                    value={profile.aspectRatio}
                    onChange={(e) => saveProfile({ ...profile, aspectRatio: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-4 text-xs text-white focus:border-violet-500/50 outline-none transition-all font-bold appearance-none cursor-pointer"
                  >
                    {aspectRatios.map(r => <option key={r} value={r} className="bg-[#111]">{r}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30 ml-2">Generation Quality</label>
                  <select 
                    value={profile.quality}
                    onChange={(e) => saveProfile({ ...profile, quality: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-4 text-xs text-white focus:border-violet-500/50 outline-none transition-all font-bold appearance-none cursor-pointer"
                  >
                    {qualities.map(q => <option key={q} value={q} className="bg-[#111]">{q}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="glass border-white/5 p-8 rounded-[2.5rem] space-y-8 backdrop-blur-3xl md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                <Cpu size={20} />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight uppercase tracking-widest">Interface Protocols</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-center justify-between p-6 bg-white/[0.03] border border-white/10 rounded-3xl">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Neural Audio Pipeline</h3>
                  <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Voice Output (TTS)</p>
                </div>
                <button 
                  onClick={() => saveProfile({ ...profile, ttsEnabled: !profile.ttsEnabled })}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative overflow-hidden",
                    profile.ttsEnabled ? "bg-violet-600" : "bg-white/10"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-lg",
                    profile.ttsEnabled ? "right-1" : "left-1"
                  )} />
                </button>
              </div>

              <div className="flex items-center justify-between p-6 bg-white/[0.03] border border-white/10 rounded-3xl">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">High Contrast Mode</h3>
                  <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Enhanced Visibility</p>
                </div>
                <button 
                  onClick={() => saveProfile({ ...profile, highContrast: !profile.highContrast })}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative overflow-hidden",
                    profile.highContrast ? "bg-violet-600" : "bg-white/10"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-lg",
                    profile.highContrast ? "right-1" : "left-1"
                  )} />
                </button>
              </div>
            </div>
          </section>

          <section className="glass border-white/5 p-8 rounded-[2.5rem] space-y-8 backdrop-blur-3xl md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Sparkles size={20} />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight uppercase tracking-widest">Neural Memory Context</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {(profile.memory || []).map((fact: string, i: number) => (
                  <div key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 group">
                    <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider">{fact}</span>
                    <button 
                      onClick={() => {
                        const newMemory = (profile.memory || []).filter((_: any, idx: number) => idx !== i);
                        saveProfile({ ...profile, memory: newMemory });
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-400/50 hover:text-red-400 transition-all"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    const fact = prompt('Enter a new fact for AI brain:');
                    if (fact) saveProfile({ ...profile, memory: [...(profile.memory || []), fact] });
                  }}
                  className="px-4 py-2 border border-dashed border-white/20 rounded-xl text-[10px] text-white/30 hover:text-white hover:border-white/40 transition-all uppercase font-black tracking-widest flex items-center gap-2"
                >
                  <Plus size={12} />
                  <span>Insert Node</span>
                </button>
              </div>
              <p className="text-[9px] text-white/20 uppercase font-black tracking-[0.2em] ml-2 mt-4">
                These nodes are used by AkinAI for personalized cognition and workflow optimization.
              </p>
            </div>
          </section>

          {/* Credit Footer */}
          <footer className="md:col-span-2 pt-16 text-center space-y-10">
             <motion.div 
               whileHover={{ y: -10 }}
               className="p-12 lg:p-16 glass rounded-[4rem] border-violet-500/30 bg-violet-600/[0.03] relative overflow-hidden group shadow-[0_40px_100px_rgba(124,58,237,0.1)]"
             >
                <div className="relative z-10">
                  <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full border-4 border-violet-500/30 mx-auto mb-8 p-1 bg-white/5 backdrop-blur-2xl shadow-inline relative">
                    <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden border border-white/10">
                      {/* Using a profile picture if available, or a sophisticated icon */}
                      <img 
                        src="https://www.image2url.com/r2/default/images/1778502896002-25e72563-a347-4ad9-8c4d-d6bef658d3dd.png" 
                        alt="Akin S. Sokpah" 
                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" 
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center border-4 border-[#0a0a0a] shadow-lg">
                      <Award size={20} className="text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-4xl lg:text-5xl font-black text-white mb-3 tracking-tighter uppercase italic group-hover:accent-glow transition-all">Akin S. Sokpah</h3>
                  <div className="flex items-center justify-center gap-4 mb-10">
                    <div className="h-px w-6 bg-white/20" />
                    <p className="text-violet-400 text-[12px] font-black tracking-[0.4em] uppercase">
                      Principal Architect & Founder
                    </p>
                    <div className="h-px w-6 bg-white/20" />
                  </div>

                  <p className="text-white/40 text-sm font-medium leading-relaxed max-w-xl mx-auto mb-12">
                    Leading the frontier of African Neural Intelligence. Developed in Monrovia, Liberia. This framework signifies a commitment to high-performance semantic execution.
                  </p>

                  <div className="flex justify-center gap-10">
                    {[
                      { icon: Shield, label: 'Secure', href: '#' },
                      { icon: Globe, label: 'Liberia', href: '#' },
                      { icon: User, label: 'Core', href: '#' }
                    ].map((item, idx) => (
                      <a key={idx} href={item.href} className="group/item flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 group-hover/item:text-white group-hover/item:border-white/20 group-hover/item:bg-white/10 transition-all">
                          <item.icon size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover/item:text-white/40 transition-colors">{item.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
                
                {/* Decorative background for credits */}
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-violet-600/10 blur-[100px] rounded-full group-hover:bg-violet-600/20 transition-all duration-1000" />
                <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full group-hover:bg-indigo-600/20 transition-all duration-1000" />
             </motion.div>

             <button 
              onClick={logout}
              className="flex items-center gap-3 px-10 py-5 bg-red-500/5 hover:bg-red-500 border border-white/5 hover:border-red-400/50 text-white/40 hover:text-white rounded-[2rem] mx-auto transition-all uppercase text-[11px] font-black tracking-[0.3em] active:scale-95 group shadow-xl"
             >
               <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
               <span>Terminate Access Protocol</span>
             </button>
          </footer>
        </div>
      </div>

      <div className="absolute top-[-30%] left-[-20%] w-[80%] h-[80%] bg-violet-600/5 blur-[140px] rounded-full pointer-events-none" />
    </div>
  );
}
