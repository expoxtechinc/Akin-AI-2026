import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Volume2, MessageSquare, Shield, Globe, Award, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ProfileView() {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('akin_profile');
    return saved ? JSON.parse(saved) : {
      name: 'Akin User',
      aiName: 'AkinAI',
      voice: 'Kore',
      style: 'Professional',
      location: 'Liberia'
    };
  });

  const saveProfile = (newProfile: any) => {
    setProfile(newProfile);
    localStorage.setItem('akin_profile', JSON.stringify(newProfile));
  };

  const voices = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];
  const styles = ['Professional', 'Creative', 'Minimalist', 'Detailed'];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] p-6 lg:p-10 relative overflow-hidden monochrome-grid">
      <div className="max-w-3xl mx-auto w-full z-10">
        <header className="mb-12 flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter text-white uppercase accent-glow">Identity Core</h1>
            <p className="text-white/40 text-sm font-light uppercase tracking-widest">Sokpah Intelligence Protocols</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-violet-600/20">
            <User size={32} />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Settings */}
          <section className="glass p-6 rounded-3xl space-y-6">
            <div className="flex items-center gap-3 text-violet-400 mb-2">
              <Shield size={18} />
              <h2 className="text-xs font-black uppercase tracking-widest">Primary User</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-2 block">Username</label>
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => saveProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-violet-500/50 outline-none transition-all"
                />
              </div>
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                 <MapPin size={14} className="text-emerald-400" />
                 <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest">Region: {profile.location}</span>
                 <Award size={14} className="text-emerald-400 ml-auto" />
              </div>
            </div>
          </section>

          {/* AI Settings */}
          <section className="glass p-6 rounded-3xl space-y-6">
            <div className="flex items-center gap-3 text-indigo-400 mb-2">
              <Globe size={18} />
              <h2 className="text-xs font-black uppercase tracking-widest">Intelligence Config</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-2 block">Assistant Name</label>
                <input 
                  type="text" 
                  value={profile.aiName}
                  onChange={(e) => saveProfile({ ...profile, aiName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-violet-500/50 outline-none transition-all"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-2 block">Neural Voice</label>
                  <select 
                    value={profile.voice}
                    onChange={(e) => saveProfile({ ...profile, voice: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-xs text-white focus:border-violet-500/50 outline-none transition-all"
                  >
                    {voices.map(v => <option key={v} value={v} className="bg-[#050505]">{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-2 block">Interaction</label>
                  <select 
                    value={profile.style}
                    onChange={(e) => saveProfile({ ...profile, style: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-xs text-white focus:border-violet-500/50 outline-none transition-all"
                  >
                    {styles.map(s => <option key={s} value={s} className="bg-[#050505]">{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Credit Footer */}
          <footer className="md:col-span-2 pt-10 text-center space-y-4">
             <div className="p-10 glass rounded-3xl border-violet-500/20 bg-violet-600/5">
                <h3 className="text-xl font-bold text-white mb-2 tracking-tighter">Akin S. Sokpah</h3>
                <p className="text-white/40 text-xs font-light tracking-[0.2em] uppercase max-w-xs mx-auto mb-6">
                  Developed by Akin S. Sokpah in Liberia, Africa. Powered by Gemini Quantum Engine.
                </p>
                <div className="flex justify-center gap-4">
                  <div className="p-3 rounded-full bg-white/5 text-white/40 hover:text-white transition-colors cursor-pointer">
                    <Award size={20} />
                  </div>
                  <div className="p-3 rounded-full bg-white/5 text-white/40 hover:text-white transition-colors cursor-pointer">
                    <Globe size={20} />
                  </div>
                </div>
             </div>
          </footer>
        </div>
      </div>

      <div className="absolute top-[-30%] left-[-20%] w-[80%] h-[80%] bg-violet-600/5 blur-[140px] rounded-full pointer-events-none" />
    </div>
  );
}
