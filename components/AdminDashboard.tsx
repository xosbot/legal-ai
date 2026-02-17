
import React, { useState, useEffect } from 'react';
import { AdminConfig, Transaction } from '../types';

interface AdminDashboardProps {
  config: AdminConfig;
  transactions: Transaction[];
  onSaveConfig: (config: AdminConfig) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ config, onLogout }) => {
  const [bootSequence, setBootSequence] = useState(0);
  const [activeParameters, setActiveParameters] = useState({
    model: 'gemini-3-flash-preview',
    tokens: 0,
    temp: 1.0,
    topK: 64,
    topP: 0.95
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setBootSequence(s => (s < 100 ? s + 1 : 100));
      setActiveParameters(p => ({
        ...p,
        tokens: Math.floor(Math.random() * 1000000)
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-[#00ff41] flex font-mono selection:bg-[#00ff41] selection:text-black">
      {/* Sidebar - Terminal Style */}
      <aside className="w-72 border-r border-[#00ff41]/20 bg-black flex flex-col p-8 space-y-8">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <i className="fas fa-microchip text-xl animate-pulse"></i>
            <h1 className="font-black text-white tracking-tighter text-lg uppercase matrix-title">AI CORE</h1>
          </div>
          <p className="text-[10px] opacity-50 uppercase tracking-widest">Procedural Kernel v2.5</p>
        </div>

        <nav className="flex-1 space-y-4">
          <div className="p-4 border border-[#00ff41] bg-[#00ff41]/5 rounded-lg">
            <p className="text-[10px] font-black uppercase mb-2">ACTIVE_MODULE</p>
            <div className="flex items-center space-x-2 text-white">
              <i className="fas fa-brain"></i>
              <span className="text-xs font-bold uppercase tracking-tighter">AI MODEL ARCHITECTURE</span>
            </div>
          </div>
          
          <div className="space-y-1 opacity-40 hover:opacity-100 transition-opacity cursor-not-allowed">
            <p className="text-[9px] font-black uppercase pl-2">READ_ONLY_ACCESS</p>
            <button className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase flex items-center space-x-2">
              <i className="fas fa-database text-[8px]"></i>
              <span>Dataset_Indexing</span>
            </button>
            <button className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase flex items-center space-x-2">
              <i className="fas fa-network-wired text-[8px]"></i>
              <span>Neural_Pathways</span>
            </button>
          </div>
        </nav>

        <div className="pt-8 border-t border-[#00ff41]/10">
          <button 
            onClick={onLogout}
            className="w-full py-3 border border-red-900/50 text-red-500 rounded font-black text-[10px] uppercase tracking-widest hover:bg-red-900 hover:text-white transition-all"
          >
            [ DISCONNECT_TERMINAL ]
          </button>
        </div>
      </aside>

      {/* Main Content - Technical Display */}
      <main className="flex-1 p-12 overflow-y-auto relative">
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none text-right">
          <p className="text-[8px] font-bold uppercase tracking-[0.5em]">System_Uptime: 99.999%</p>
          <p className="text-[8px] font-bold uppercase tracking-[0.5em]">Latent_Space: Optimized</p>
        </div>

        <header className="mb-12">
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">AI MODEL</h2>
          <div className="w-full h-1 bg-[#00ff41]/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#00ff41] transition-all duration-300 shadow-[0_0_10px_#00ff41]" style={{ width: `${bootSequence}%` }}></div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hardware/Cloud Mapping */}
          <div className="lex-card border-[#00ff41]/30 p-8 rounded-2xl bg-black/40 space-y-6">
            <div className="flex items-center justify-between border-b border-[#00ff41]/10 pb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Kernel Specifications</h3>
              <span className="px-2 py-1 bg-[#00ff41]/10 text-[9px] font-black border border-[#00ff41]/20 rounded">STATUS: RUNNING</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[11px]">
                <span className="opacity-50 uppercase">Base_Model</span>
                <span className="text-white font-bold">{activeParameters.model}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="opacity-50 uppercase">Reasoning_Capability</span>
                <span className="text-white font-bold">Multimodal (Flash-Lite 3)</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="opacity-50 uppercase">Context_Window</span>
                <span className="text-white font-bold">1,000,000 Tokens</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="opacity-50 uppercase">Search_Grounding</span>
                <span className="text-[#00ff41] font-bold">ENABLED (GoogleSearch)</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#00ff41]/10">
              <p className="text-[9px] font-black uppercase mb-4 opacity-50">Neural_Load_Simulator</p>
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-4 rounded-sm transition-all duration-500 ${
                      i < bootSequence / 2 ? 'bg-[#00ff41] shadow-[0_0_5px_rgba(0,255,65,0.5)]' : 'bg-white/5'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Configuration Space */}
          <div className="lex-card border-[#00ff41]/30 p-8 rounded-2xl bg-black/40 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-white border-b border-[#00ff41]/10 pb-4">System Instruction Context</h3>
            <div className="bg-black border border-[#00ff41]/10 p-4 rounded-lg font-mono text-[10px] leading-relaxed text-[#00ff41]/70 h-[200px] overflow-y-auto custom-scrollbar">
              <span className="text-white font-bold block mb-2">> LOAD SYSTEM_PROMPT:</span>
              You are 'LexDefense AI', a senior legal defense consultant specialized in the Bharatiya Nyaya Sanhita (BNS), 2023 and major Indian criminal statutes like the NDPS Act 1985.
              <br/><br/>
              Your objective is to find 'Lucrative', 'Legit', and 'Unseen' loopholes in FIRs to help defense lawyers protect their clients.
              <br/><br/>
              Focus on Actus Reus vs. Mens Rea, Procedural Default, and Chapter III Exceptions.
              <br/><br/>
              <span className="animate-pulse">_</span>
            </div>

            <div className="space-y-4 pt-4">
              <p className="text-[9px] font-black uppercase opacity-50">Optimization_Parameters</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-[#00ff41]/10 rounded bg-black/20">
                  <p className="text-[8px] opacity-50 mb-1">TEMPERATURE</p>
                  <p className="text-sm font-bold text-white">{activeParameters.temp.toFixed(1)}</p>
                </div>
                <div className="p-3 border border-[#00ff41]/10 rounded bg-black/20">
                  <p className="text-[8px] opacity-50 mb-1">TOP_K</p>
                  <p className="text-sm font-bold text-white">{activeParameters.topK}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Logs */}
        <div className="mt-8 lex-card border-[#00ff41]/30 rounded-2xl bg-black/60 overflow-hidden">
          <div className="bg-white/5 px-6 py-3 border-b border-[#00ff41]/10 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest">Live_Kernel_Stream</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-[8px] font-bold uppercase">Recording_Sessions</span>
            </div>
          </div>
          <div className="p-6 h-[200px] font-mono text-[9px] text-[#00ff41]/50 space-y-1 overflow-y-auto custom-scrollbar">
            <p>[{new Date().toISOString()}] Kernel: Initializing neural bridge...</p>
            <p>[{new Date().toISOString()}] Sync: Gemini-3-Flash connected successfully.</p>
            <p>[{new Date().toISOString()}] Security: AES-256 handshake complete.</p>
            <p>[{new Date().toISOString()}] Audit: {activeParameters.tokens.toLocaleString()} tokens cached in session buffer.</p>
            <p className="text-white">[{new Date().toISOString()}] INFO: Model architecture optimized for BNS 2023 / NDPS 1985 legal corpus.</p>
            <p>[{new Date().toISOString()}] Kernel: Awaiting suspect profile linkage...</p>
            <p className="animate-pulse">> _</p>
          </div>
        </div>
      </main>
    </div>
  );
};
