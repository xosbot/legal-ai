
import React, { useState } from 'react';

interface PublicAccessProps {
  onSuccess: (user: { email: string; name: string; avatar: string; googleId: string }) => void;
  onCancel: () => void;
}

export const PublicAccess: React.FC<PublicAccessProps> = ({ onSuccess, onCancel }) => {
  const [step, setStep] = useState<'welcome' | 'identifying' | 'syncing'>('welcome');

  const mockUsers = [
    { email: 'public.citizen@gmail.com', name: 'Verified Citizen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Public', googleId: 'g_789' },
    { email: 'anonymous.user@proton.me', name: 'Anonymous Counselor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anon', googleId: 'g_000' }
  ];

  const handleIdentify = () => setStep('identifying');

  const handlePick = (user: typeof mockUsers[0]) => {
    setStep('syncing');
    setTimeout(() => onSuccess(user), 1500);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 matrix-grid pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00ff41]/5 rounded-full blur-[150px] pointer-events-none"></div>
      
      <div className="max-w-xl w-full relative z-10">
        <div className="lex-card rounded-[4rem] p-12 border-[#00ff41]/30 shadow-[0_0_100px_rgba(0,255,65,0.15)] relative overflow-hidden group">
          <div className="absolute inset-0 glossy-overlay pointer-events-none"></div>
          <div className="absolute inset-x-0 h-[3px] bg-[#00ff41]/50 top-0 animate-[scanline_5s_linear_infinite] shadow-[0_0_20px_#00ff41] z-20"></div>

          <div className="text-center mb-16 relative z-30">
            <div className="relative inline-block mb-10">
              <div className="w-28 h-28 bg-black rounded-[2.5rem] flex items-center justify-center border-2 border-[#00ff41] shadow-[0_0_40px_rgba(0,255,65,0.4)] animate-pulse relative">
                <div className="absolute inset-0 bg-[#00ff41]/10 rounded-[2.5rem] blur-xl opacity-50"></div>
                <i className="fas fa-fingerprint text-6xl text-[#00ff41] relative z-10"></i>
              </div>
              <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-[#00ff41] rounded-full flex items-center justify-center border-4 border-black text-black shadow-lg">
                <i className="fas fa-lock text-sm"></i>
              </div>
            </div>
            <h2 className="text-5xl font-black text-white uppercase tracking-tighter matrix-title mb-3 flicker">Kernel_Portal</h2>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-2.5 h-2.5 bg-[#00ff41] rounded-full animate-ping shadow-[0_0_10px_#00ff41]"></div>
              <p className="text-[#00ff41] text-[11px] uppercase tracking-[0.5em] font-black">Establishing_Identity...</p>
            </div>
          </div>

          {step === 'welcome' && (
            <div className="space-y-10 animate-in fade-in duration-700 relative z-30">
              <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-center backdrop-blur-md">
                <p className="text-slate-300 text-sm leading-relaxed font-bold font-mono">
                  Access with any <span className="text-[#00ff41]">gmail</span> account to create account to get the loopholes on your <span className="text-[#00ff41] underline underline-offset-8">"FIR"</span> number uploaded.
                </p>
              </div>
              <div className="space-y-5">
                <button 
                  onClick={handleIdentify}
                  className="w-full py-7 bg-[#00ff41] text-black rounded-[2rem] font-black text-xs hover:bg-white transition-all flex items-center justify-center space-x-5 uppercase tracking-[0.3em] shadow-[0_15px_40px_rgba(0,255,65,0.2)] group"
                >
                  <i className="fab fa-google text-2xl group-hover:scale-125 transition-transform"></i>
                  <span>Initiate_Google_Auth</span>
                </button>
                <button 
                  onClick={onCancel}
                  className="w-full py-4 text-slate-600 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.4em]"
                >
                  Terminate_Procedural_Link
                </button>
              </div>
            </div>
          )}

          {step === 'identifying' && (
            <div className="space-y-5 animate-in slide-in-from-right-12 duration-500 relative z-30">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 text-center">Identity_Stream_Detected</p>
              <div className="grid grid-cols-1 gap-4">
                {mockUsers.map((user) => (
                  <button 
                    key={user.email}
                    onClick={() => handlePick(user)}
                    className="w-full flex items-center space-x-6 p-7 bg-black/80 border border-white/10 rounded-[2rem] hover:border-[#00ff41] hover:bg-[#00ff41]/5 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00ff41]/0 to-[#00ff41]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <img src={user.avatar} className="w-16 h-16 rounded-2xl bg-slate-900 border border-[#00ff41]/20 shadow-2xl relative z-10" />
                    <div className="text-left flex-1 relative z-10">
                      <p className="text-lg font-black text-white uppercase tracking-tighter">{user.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-1">{user.email}</p>
                    </div>
                    <i className="fas fa-arrow-right-long text-[#00ff41] opacity-0 group-hover:opacity-100 group-hover:translate-x-3 transition-all relative z-10"></i>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'syncing' && (
            <div className="flex flex-col items-center justify-center py-20 space-y-10 animate-in zoom-in-95 duration-500 relative z-30">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-white/5 border-t-[#00ff41] rounded-full animate-spin shadow-[0_0_20px_rgba(0,255,65,0.2)]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fas fa-network-wired text-[#00ff41] text-2xl animate-pulse"></i>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-white uppercase tracking-tighter">Establishing_Neural_Bridge</p>
                <p className="text-[11px] font-bold text-[#00ff41] uppercase tracking-[0.6em] mt-3 flicker">Syncing_Kernel_Buffer...</p>
              </div>
            </div>
          )}

          <div className="mt-16 pt-10 border-t border-white/5 flex items-center justify-between text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] relative z-30">
            <span className="flex items-center"><i className="fas fa-shield-halved mr-2 text-[#00ff41]/40"></i> RSA_4096_ACTIVE</span>
            <div className="flex space-x-6">
              <span className="text-[#00ff41]">ENCRYPTED</span>
              <span className="opacity-20">STANDBY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};