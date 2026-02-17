
import React, { useState } from 'react';
import { Suspect } from '../types';

interface SuspectManagerProps {
  suspects: Suspect[];
  selectedSuspectId: string | null;
  onSelect: (id: string) => void;
  onAdd: (name: string, details: string) => void;
  onDelete: (id: string) => void;
}

export const SuspectManager: React.FC<SuspectManagerProps> = ({ 
  suspects, 
  selectedSuspectId, 
  onSelect, 
  onAdd, 
  onDelete 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDetails, setNewDetails] = useState('');

  const handleAdd = () => {
    if (newName.trim()) {
      onAdd(newName, newDetails);
      setNewName('');
      setNewDetails('');
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-black text-[#00ff41] uppercase tracking-[0.2em] flex items-center">
          <i className="fas fa-fingerprint mr-2 text-sm"></i>
          Active Subjects
        </h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            isAdding ? 'bg-red-500/10 text-red-500' : 'bg-[#00ff41]/10 text-[#00ff41] hover:bg-[#00ff41]/20'
          }`}
        >
          <i className={`fas ${isAdding ? 'fa-times' : 'fa-plus'} text-xs`}></i>
        </button>
      </div>

      {isAdding && (
        <div className="mb-6 p-5 bg-black border border-slate-800 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
          <div>
            <label className="text-[9px] font-black text-slate-600 uppercase mb-2 block tracking-widest">Full Name</label>
            <input
              type="text"
              autoFocus
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-[#00ff41]/50 outline-none transition-all"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[9px] font-black text-slate-600 uppercase mb-2 block tracking-widest">Profiling Context</label>
            <textarea
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-[#00ff41]/50 outline-none h-20 transition-all custom-scrollbar"
              value={newDetails}
              onChange={(e) => setNewDetails(e.target.value)}
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="w-full py-3 bg-[#00ff41] text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white disabled:opacity-50 transition-all shadow-lg"
          >
            Encrypt Profile
          </button>
        </div>
      )}

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
        {suspects.length === 0 && !isAdding && (
          <p className="text-[10px] text-slate-600 text-center py-6 font-bold uppercase tracking-widest italic opacity-50">Empty Database</p>
        )}
        {suspects.map((s) => (
          <div 
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`group flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
              selectedSuspectId === s.id 
                ? 'bg-[#00ff41]/5 border-[#00ff41]/30 shadow-[0_0_15px_rgba(0,255,65,0.05)]' 
                : 'bg-black border-slate-800/50 hover:border-slate-700 hover:bg-slate-900/50'
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className={`font-black text-[11px] uppercase tracking-tighter truncate ${selectedSuspectId === s.id ? 'text-[#00ff41]' : 'text-slate-400'}`}>
                {s.name}
              </p>
              {s.details && (
                <p className="text-[9px] text-slate-600 truncate font-medium mt-0.5">{s.details}</p>
              )}
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(s.id);
              }}
              className="ml-3 text-slate-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <i className="fas fa-trash-alt text-[10px]"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
