
import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onCancel }) => {
  const [pass, setPass] = useState('');
  const [err, setErr] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === 'aibot123') {
      onLogin();
    } else {
      setErr(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-mono relative overflow-hidden">
      {/* Retro Scanline Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="bg-[#0a0a0a] border-2 border-slate-800 p-10 rounded-lg shadow-[0_0_100px_rgba(0,0,0,1)] border-t-[#00ff41]">
          
          <div className="mb-12 border-b-2 border-slate-900 pb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-black border border-slate-700 flex items-center justify-center text-[#00ff41] shadow-[inset_0_0_10px_rgba(0,255,65,0.2)]">
                <i className="fas fa-terminal text-2xl"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight uppercase">SYSTEM_ACCESS_v2.5</h2>
                <p className="text-[#00ff41] text-[10px] font-bold uppercase tracking-widest leading-none mt-1">Status: Restricted_Core</p>
              </div>
            </div>
            <div className="bg-black/50 p-4 border border-slate-800 rounded text-[10px] text-slate-500 leading-relaxed uppercase">
              <span className="text-[#00ff41] mr-2">></span> Warning: Unauthorized access to the core kernel will be logged and reported to system security.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enter Access Code</label>
                <span className="text-[9px] text-[#00ff41]/40 uppercase tracking-tighter">[AES-256 Enabled]</span>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center text-[#00ff41]/50 group-focus-within:text-[#00ff41]">
                  <i className="fas fa-key text-xs"></i>
                </div>
                <input 
                  type="password" 
                  autoFocus
                  className="w-full bg-black border-2 border-slate-800 rounded-lg px-12 py-5 text-[#00ff41] outline-none focus:border-[#00ff41] transition-all font-mono placeholder-slate-900 tracking-[0.5em] text-lg"
                  placeholder="********"
                  value={pass}
                  onChange={(e) => { setPass(e.target.value); setErr(false); }}
                />
              </div>
            </div>

            {err && (
              <div className="bg-red-950/30 border-2 border-red-900 p-4 text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center animate-bounce">
                <i className="fas fa-radiation mr-3 text-lg"></i>
                Critical: Identification Failed. Access Refused.
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button className="py-4 bg-[#00ff41] text-black font-black text-xs hover:bg-white transition-all uppercase tracking-widest shadow-[0_5px_0_#003b00] active:translate-y-1 active:shadow-none">
                [ Authorize ]
              </button>
              <button 
                type="button" 
                onClick={onCancel}
                className="py-4 bg-transparent border-2 border-slate-800 text-slate-600 font-black text-xs hover:text-white hover:border-slate-600 transition-all uppercase tracking-widest"
              >
                [ Shutdown ]
              </button>
            </div>
          </form>

          <div className="mt-12 flex items-center justify-center space-x-6 text-[8px] text-slate-800 font-black uppercase tracking-[0.4em]">
            <span className="flex items-center"><i className="fas fa-link mr-2"></i> Encrypted</span>
            <span className="flex items-center"><i className="fas fa-server mr-2"></i> Local_Host</span>
            <span className="flex items-center"><i className="fas fa-microchip mr-2"></i> AI_Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};
