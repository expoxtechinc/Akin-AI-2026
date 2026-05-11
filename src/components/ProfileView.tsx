import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Shield, Globe, Award, MapPin, RefreshCw, LogOut, Sparkles } from 'lucide-react';
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
    location: 'Liberia'
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
          location: 'Liberia'
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
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white shadow-2xl shadow-violet-600/30 overflow-hidden border-2 border-white/10">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} />
              )}
            </div>
            {isSaving && (
              <div className="absolute -bottom-2 -right-2 p-1.5 bg-violet-600 rounded-full animate-spin">
                <RefreshCw size={12} className="text-white" />
              </div>
            )}
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
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  onBlur={() => saveProfile(profile)}
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
                  onChange={(e) => setProfile({ ...profile, aiName: e.target.value })}
                  onBlur={() => saveProfile(profile)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-violet-500/50 outline-none transition-all"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-2 block">Voice</label>
                  <select 
                    value={profile.voice}
                    onChange={(e) => saveProfile({ ...profile, voice: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-xs text-white focus:border-violet-500/50 outline-none transition-all"
                  >
                    {voices.map(v => <option key={v} value={v} className="bg-[#050505]">{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-2 block">Style</label>
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
          <footer className="md:col-span-2 pt-10 text-center space-y-6">
             <div className="p-8 lg:p-12 glass rounded-[3rem] border-violet-500/20 bg-violet-600/5 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-24 h-24 rounded-full border-4 border-violet-500/30 mx-auto mb-6 p-1 bg-white/5 backdrop-blur-xl">
                    <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center overflow-hidden">
                      {/* Note: User should replace this with the specific Akin S. Sokpah portrait asset */}
                      <Sparkles size={40} className="text-violet-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2 tracking-tighter uppercase">Akin S. Sokpah</h3>
                  <p className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase max-w-xs mx-auto mb-8">
                    Principal Architect ● Liberia, West Africa
                  </p>
                  <div className="flex justify-center gap-6">
                    <a href="https://github.com/expoxtechinc" target="_blank" rel="noreferrer" className="text-white/20 hover:text-white transition-all transform hover:scale-110">
                       <Shield size={24} />
                    </a>
                    <a href="#" className="text-white/20 hover:text-white transition-all transform hover:scale-110">
                       <Globe size={24} />
                    </a>
                  </div>
                </div>
                
                {/* Decorative background for credits */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 blur-3xl rounded-full" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/10 blur-3xl rounded-full" />
             </div>

             <button 
              onClick={logout}
              className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-white/40 hover:text-red-400 rounded-2xl mx-auto transition-all uppercase text-[10px] font-black tracking-widest"
             >
               <LogOut size={16} />
               <span>Terminate Session</span>
             </button>
          </footer>
        </div>
      </div>

      <div className="absolute top-[-30%] left-[-20%] w-[80%] h-[80%] bg-violet-600/5 blur-[140px] rounded-full pointer-events-none" />
    </div>
  );
}
