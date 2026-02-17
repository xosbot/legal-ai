
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileSettingsProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onLogout: () => void;
  onClose: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onSave, onLogout, onClose }) => {
  const [email, setEmail] = useState(profile.email);
  const [enabled, setEnabled] = useState(profile.notificationsEnabled);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" onClick={onClose}></div>
      <div className="relative bg-black w-full max-w-md rounded-[3rem] overflow-hidden border border-[#00ff41]/20 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="absolute inset-0 glossy-overlay pointer-events-none opacity-40"></div>
        
        <div className="bg-black/90 p-10 border-b border-[#00ff41]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="w-14 h-14 bg-[#00ff41]/10 rounded-2xl flex items-center justify-center border border-[#00ff41]/30">
                <i className="fas fa-user-gear text-[#00ff41] text-2xl shadow-[0_0_10px_#00ff41]"></i>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter matrix-title leading-none">Context</h2>
                <p className="text-[#00ff41] text-[10px] font-black uppercase tracking-[0.4em] mt-1">Profile_Management</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-[#00ff41]">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <div className="p-10 space-y-8">
          {profile.googleId && (
            <div className="bg-[#00ff41]/5 border border-[#00ff41]/10 p-5 rounded-2xl flex items-center space-x-5">
              <img src={profile.avatar} className="w-16 h-16 rounded-2xl border-2 border-black shadow-xl" />
              <div>
                <p className="text-lg font-black text-white uppercase tracking-tighter">{profile.name}</p>
                <div className="flex items-center space-x-2 mt-1 text-[#00ff41]">
                   <i className="fab fa-google text-[11px]"></i>
                   <p className="text-[10px] font-black uppercase tracking-widest">ID_LINKED_GMAIL</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block ml-1">Counsel_Email_Hash</label>
              <div className="relative group">
                <i className="fas fa-at absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-[#00ff41]"></i>
                <input 
                  type="email" 
                  className="w-full bg-black border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-white outline-none focus:border-[#00ff41]/40 transition-all font-mono text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={!!profile.googleId}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-black border border-white/5 rounded-2xl">
              <div>
                <p className="text-[11px] font-black text-white uppercase tracking-widest">Kernel_Direct_Alerts</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase">Piping analysis to inbox</p>
              </div>
              <button 
                onClick={() => setEnabled(!enabled)}
                className={`relative w-14 h-7 rounded-full transition-all border ${enabled ? 'bg-[#00ff41] border-[#00ff41]' : 'bg-black border-slate-700'}`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full transition-all ${enabled ? 'left-8 bg-black' : 'left-1 bg-slate-700'}`}></div>
              </button>
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <button 
              onClick={() => onSave({ ...profile, email, notificationsEnabled: enabled })}
              className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-[#00ff41] transition-all"
            >
              SAVE_CONFIG
            </button>
            <button 
              onClick={onLogout}
              className="w-full py-5 bg-black border border-red-900/50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-red-950/20 transition-all"
            >
              TERMINATE_SESSION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};