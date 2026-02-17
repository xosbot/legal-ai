
import React, { useState, useRef } from 'react';
import { AnalysisResult, Loophole } from '../types';
import { generateSpeech, decodeBase64, decodeAudioData } from '../services/geminiService';
import { jsPDF } from 'jspdf';

interface AnalysisPanelProps {
  analysis: AnalysisResult;
  suspectName: string;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis, suspectName }) => {
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stopAudio = () => {
    if (currentSourceRef.current) {
      currentSourceRef.current.stop();
      currentSourceRef.current = null;
    }
    setPlayingAudioId(null);
  };

  const playAudio = async (text: string, id: string) => {
    if (playingAudioId === id) {
      stopAudio();
      return;
    }
    stopAudio();
    setLoadingAudioId(id);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const base64 = await generateSpeech(text);
      const bytes = decodeBase64(base64);
      const audioBuffer = await decodeAudioData(bytes, audioContextRef.current);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setPlayingAudioId(null);
      currentSourceRef.current = source;
      source.start();
      setPlayingAudioId(id);
    } catch (error) {
      console.error("Audio playback error:", error);
    } finally {
      setLoadingAudioId(null);
    }
  };

  const sortedLoopholes = [...analysis.loopholes].sort((a, b) => {
    const getPriority = (tags: string[]) => {
      if (tags.includes('Lucrative')) return 1;
      if (tags.includes('Unseen')) return 2;
      if (tags.includes('Legit')) return 3;
      return 4;
    };
    return getPriority(a.tags) - getPriority(b.tags);
  });

  const getLegitimacyIndicator = (level: Loophole['legitimacy']) => {
    switch (level) {
      case 'High':
        return { icon: 'fa-shield-check', color: 'text-[#00ff41]', label: 'HIGH_INTEL' };
      case 'Medium':
        return { icon: 'fa-shield-exclamation', color: 'text-amber-500', label: 'MID_INTEL' };
      default:
        return { icon: 'fa-shield', color: 'text-slate-500', label: 'PROCEDURAL' };
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('LexDefense Strategy Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Subject: ${suspectName}`, 14, 30);
    doc.save(`LexDefense_Strategy_${suspectName}.pdf`);
  };

  return (
    <div className="space-y-8">
      <div className="lex-card rounded-[2.5rem] overflow-hidden border-[#00ff41]/20 relative">
        <div className="absolute inset-0 glossy-overlay pointer-events-none"></div>
        
        <div className="bg-black/80 px-8 py-6 flex items-center justify-between border-b border-[#00ff41]/10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#00ff41]/10 rounded-2xl flex items-center justify-center border border-[#00ff41]/30">
              <i className="fas fa-microchip text-[#00ff41] animate-pulse"></i>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter matrix-title">Strategy_Kernel: {suspectName}</h2>
              <p className="text-[10px] text-[#00ff41] font-bold uppercase tracking-[0.4em] opacity-60 mt-1">Status: Procedural Analysis Complete</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Bail_Probability</p>
            <p className="text-3xl font-black text-[#00ff41] tracking-tighter">{analysis.defenseScore}%</p>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-10 bg-black/40 p-6 rounded-[2rem] border border-[#00ff41]/10 relative group">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black text-[#00ff41]/60 uppercase tracking-[0.3em] flex items-center">
                  <i className="fas fa-terminal mr-2"></i> Narrative_Summary
                </h3>
                <div className="flex space-x-2">
                  <button onClick={() => playAudio(analysis.summary, 'summary')} className="p-2 text-[#00ff41] hover:text-white transition-colors">
                    {loadingAudioId === 'summary' ? <i className="fas fa-sync fa-spin"></i> : <i className={`fas ${playingAudioId === 'summary' ? 'fa-stop' : 'fa-volume-up'}`}></i>}
                  </button>
                  <button onClick={exportToPDF} className="p-2 text-[#00ff41] hover:text-white transition-colors">
                    <i className="fas fa-file-export"></i>
                  </button>
                </div>
             </div>
             <p className="text-slate-300 text-sm leading-relaxed font-medium font-mono">
               {analysis.summary}
             </p>
          </div>

          <div className="mb-10">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Detected_Prosecution_Gaps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.prosecutionGaps.map((gap, i) => (
                <div key={i} className="flex items-center space-x-3 text-[11px] text-red-500/80 bg-red-950/20 px-4 py-3 rounded-xl border border-red-900/30 font-bold uppercase tracking-tighter">
                  <i className="fas fa-radiation text-xs"></i>
                  <span>{gap}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-[10px] font-black text-[#00ff41] uppercase tracking-[0.5em] mb-4 text-center">Procedural_Loopholes_Detected</h3>
            {sortedLoopholes.map((loophole, idx) => {
              const indicator = getLegitimacyIndicator(loophole.legitimacy);
              return (
                <div key={idx} className="lex-card bg-black/50 border-[#00ff41]/10 rounded-[2rem] overflow-hidden group">
                  <div className="bg-[#00ff41]/5 px-6 py-4 border-b border-[#00ff41]/10 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="bg-[#00ff41] text-black text-[9px] font-black px-2 py-0.5 rounded uppercase">{loophole.tags[0] || 'DATA'}</span>
                      <h4 className="font-bold text-white text-lg tracking-tight uppercase">{loophole.title}</h4>
                    </div>
                    <div className={`flex items-center space-x-2 text-[10px] font-black ${indicator.color}`}>
                      <i className={`fas ${indicator.icon}`}></i>
                      <span className="tracking-widest">{indicator.label}</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="px-3 py-1 bg-black border border-[#00ff41]/30 rounded text-[#00ff41] font-mono text-xs">
                        BNS_{loophole.section}
                      </div>
                      <p className="text-slate-400 text-xs italic">"{loophole.description}"</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="bg-black/60 p-5 rounded-2xl border border-white/5">
                        <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest">Procedural_Strategy</p>
                        <p className="text-xs text-white leading-relaxed font-medium">{loophole.strategy}</p>
                      </div>
                      <div className="bg-[#00ff41]/10 p-5 rounded-2xl border border-[#00ff41]/20">
                        <p className="text-[9px] font-black text-[#00ff41] uppercase mb-2 tracking-widest">Counsel_Directive</p>
                        <p className="text-xs text-white leading-relaxed font-bold italic">"{loophole.counselInstructions}"</p>
                      </div>
                    </div>

                    <div className="bg-black border border-[#00ff41]/5 p-5 rounded-2xl">
                       <div className="grid grid-cols-2 gap-8">
                          <div>
                            <p className="text-[8px] font-black text-red-500 uppercase mb-2 tracking-widest">Prosecution_Counter</p>
                            <p className="text-[10px] text-slate-500 font-mono italic leading-relaxed">{loophole.potentialChallenges.prosecution}</p>
                          </div>
                          <div className="border-l border-white/5 pl-8">
                            <p className="text-[8px] font-black text-[#00ff41] uppercase mb-2 tracking-widest">Defense_Rebuttal</p>
                            <p className="text-[10px] text-slate-300 font-bold leading-relaxed">{loophole.potentialChallenges.counter}</p>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};