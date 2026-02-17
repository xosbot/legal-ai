
import React, { useState } from 'react';

interface GoogleLoginProps {
  onSuccess: (user: { email: string; name: string; avatar: string; googleId: string }) => void;
  onClose: () => void;
}

export const GoogleLogin: React.FC<GoogleLoginProps> = ({ onSuccess, onClose }) => {
  const [step, setStep] = useState<'prompt' | 'picking' | 'loading'>('prompt');

  const mockUsers = [
    { email: 'advocate.specter@lexfirm.in', name: 'Advocate Harvey', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Harvey', googleId: 'g_123' },
    { email: 'legal.expert@procedural.ai', name: 'Defense Expert', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya', googleId: 'g_456' }
  ];

  const handlePick = (user: typeof mockUsers[0]) => {
    setStep('loading');
    setTimeout(() => {
      onSuccess(user);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-[#0a0a0a] w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)] border border-[#00ff41]/10 animate-in zoom-in-95 duration-200">
        <div className="bg-black border-b border-white/5 p-10 text-center">
          <div className="flex justify-center mb-8">
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                <svg width="32" height="32" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
             </div>
          </div>
          <h2 className="text-xl font-black text-white leading-tight uppercase tracking-tighter">Counsel Identity</h2>
          <p className="text-[#00ff41] text-[10px] mt-2 font-bold uppercase tracking-[0.2em] opacity-60">Secure Gmail Linkage</p>
        </div>

        <div className="p-8">
          {step === 'prompt' && (
            <div className="space-y-4">
              <button 
                onClick={() => setStep('picking')}
                className="w-full flex items-center justify-center space-x-4 bg-white py-4 rounded-xl hover:bg-indigo-50 transition-all font-black text-black uppercase tracking-widest text-[10px]"
              >
                <i className="fab fa-google text-lg"></i>
                <span>Link Verified Account</span>
              </button>
              <button 
                onClick={onClose}
                className="w-full py-3 text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-[0.2em]"
              >
                Cancel Identification
              </button>
            </div>
          )}

          {step === 'picking' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Detected Credentials</p>
              {mockUsers.map((user) => (
                <button 
                  key={user.email}
                  onClick={() => handlePick(user)}
                  className="w-full flex items-center space-x-3 p-4 bg-black border border-white/5 rounded-xl hover:border-[#00ff41]/40 hover:bg-[#00ff41]/5 transition-all group"
                >
                  <img src={user.avatar} className="w-10 h-10 rounded-full bg-slate-800" />
                  <div className="text-left flex-1">
                    <p className="text-xs font-black text-white uppercase tracking-tighter">{user.name}</p>
                    <p className="text-[10px] text-slate-500">{user.email}</p>
                  </div>
                  <i className="fas fa-chevron-right text-slate-700 text-[10px] group-hover:translate-x-1 group-hover:text-[#00ff41] transition-all"></i>
                </button>
              ))}
            </div>
          )}

          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-10 space-y-6">
              <div className="w-12 h-12 border-2 border-slate-800 border-t-[#00ff41] rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-[#00ff41] uppercase tracking-[0.3em] animate-pulse">Syncing ID Hash...</p>
            </div>
          )}

          <div className="mt-8 text-[9px] text-slate-600 text-center leading-relaxed font-bold uppercase tracking-widest opacity-60">
            Secure ID sharing governed by LexDefense <span className="text-[#00ff41] underline">Cryptographic Protocols</span>.
          </div>
        </div>
      </div>
    </div>
  );
};
