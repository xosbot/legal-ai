
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { AnalysisPanel } from './components/AnalysisPanel';
import { ChatInterface } from './components/ChatInterface';
import { SuspectManager } from './components/SuspectManager';
import { CoinStore } from './components/CoinStore';
import { AdminLogin } from './components/AdminLogin';
import { PublicAccess } from './components/PublicAccess';
import { AdminDashboard } from './components/AdminDashboard';
import { NotificationSystem } from './components/NotificationSystem';
import { ProfileSettings } from './components/ProfileSettings';
import { analyzeFIR, findFIRByCrimeNumber } from './services/geminiService';
import { STATUTES_VAULT } from './constants/statutes_vault';
import { AnalysisResult, FileData, Suspect, CreditState, Transaction, AdminConfig, UserProfile, GroundingLink } from './types';

const ANALYSIS_COST = 1500;

function App() {
  const [view, setView] = useState<'user' | 'admin-login' | 'admin-dashboard' | 'landing' | 'public-login'>('landing');
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState<{id: string, message: string, type: 'email' | 'alert'}[]>([]);

  const [suspects, setSuspects] = useState<Suspect[]>(() => {
    const saved = localStorage.getItem('bns_suspects');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);

  const [firFile, setFirFile] = useState<FileData | null>(() => {
    const saved = localStorage.getItem('bns_fir_file');
    return saved ? JSON.parse(saved) : null;
  });

  const [inputMode, setInputMode] = useState<'upload' | 'lookup'>('upload');
  const [crimeNumber, setCrimeNumber] = useState('');
  const [policeStation, setPoliceStation] = useState('');
  const [lookupResult, setLookupResult] = useState<{ text: string, links: GroundingLink[] } | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const [lawBookFile, setLawBookFile] = useState<FileData | null>(() => {
    const saved = localStorage.getItem('bns_lawbook_file');
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedVaultIds, setSelectedVaultIds] = useState<string[]>([]);

  const [credits, setCredits] = useState<CreditState>(() => {
    const saved = localStorage.getItem('lex_credits');
    return saved ? JSON.parse(saved) : { 
      balance: 0, 
      isLawyerVerified: false,
      userProfile: { email: '', notificationsEnabled: true, isLoggedIn: false }
    };
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('lex_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [adminConfig, setAdminConfig] = useState<AdminConfig>(() => {
    const saved = localStorage.getItem('lex_admin_config');
    return saved ? JSON.parse(saved) : {
      isAuthenticated: false,
      gateways: [
        { provider: 'Visa/Master', merchantId: 'MID_12345', apiKey: 'SK_LIVE_XXXX', enabled: true, type: 'fiat' },
        { provider: 'GPay/UPI', merchantId: 'vpa@upi', apiKey: 'UPI_KEY_XXXX', enabled: true, type: 'upi' },
        { provider: 'Bitcoin/Eth', merchantId: 'WALLET_ID', apiKey: 'W_SEC_XXXX', enabled: true, type: 'crypto', walletAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' }
      ],
      totalRevenue: 0
    };
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCoinStore, setShowCoinStore] = useState(false);

  useEffect(() => localStorage.setItem('bns_suspects', JSON.stringify(suspects)), [suspects]);
  useEffect(() => localStorage.setItem('lex_credits', JSON.stringify(credits)), [credits]);
  useEffect(() => localStorage.setItem('lex_transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('lex_admin_config', JSON.stringify(adminConfig)), [adminConfig]);

  useEffect(() => {
    if (credits.userProfile?.isLoggedIn) {
      setView('user');
    }
  }, []);

  const addNotification = (message: string, type: 'email' | 'alert') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handlePurchase = (amount: number, coins: number, method: string) => {
    setCredits(prev => ({ ...prev, balance: prev.balance + coins }));
    const newTx: Transaction = {
      id: `TXN_${Date.now()}`,
      amount,
      coins,
      method,
      timestamp: Date.now(),
      status: 'completed'
    };
    setTransactions([newTx, ...transactions]);
    setAdminConfig(prev => ({ ...prev, totalRevenue: prev.totalRevenue + amount }));
  };

  const verifyLawyer = () => {
    setCredits(prev => ({ ...prev, isLawyerVerified: true }));
  };

  const handleLoginSuccess = (user: { email: string; name: string; avatar: string; googleId: string }) => {
    const newProfile: UserProfile = {
      ...user,
      notificationsEnabled: credits.userProfile?.notificationsEnabled ?? true,
      isLoggedIn: true
    };
    setCredits(prev => ({ ...prev, userProfile: newProfile }));
    setView('user');
    addNotification(`ACCESS GRANTED: Counselor ${user.name.split(' ')[0]}`, 'alert');
  };

  const handleLogout = () => {
    setCredits(prev => ({ ...prev, userProfile: { ...prev.userProfile!, isLoggedIn: false } }));
    setShowProfile(false);
    setView('landing');
    addNotification('Identity Session Terminated', 'alert');
  };

  const selectedSuspect = suspects.find(s => s.id === selectedSuspectId);

  const getLawBookContext = () => {
    let context = "";
    if (lawBookFile) context += `\nMANUAL UPLOAD: ${lawBookFile.name}\nCONTENT: ${lawBookFile.base64}`;
    
    selectedVaultIds.forEach(id => {
      const item = STATUTES_VAULT.find(v => v.id === id);
      if (item) {
        context += `\nVAULT ITEM (${item.category}): ${item.name}\nCONTENT: ${item.content}`;
      }
    });
    
    return context || null;
  };

  const handleLookup = async () => {
    if (!crimeNumber || !policeStation) return;
    setIsLookingUp(true);
    setLookupResult(null);
    try {
      const result = await findFIRByCrimeNumber(crimeNumber, policeStation);
      setLookupResult({ text: result.text, links: result.groundingLinks });
      addNotification("Lookup stream successful.", "alert");
    } catch (e) {
      setError("Lookup Kernel Failure.");
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleAnalysis = async () => {
    if (!credits.userProfile?.isLoggedIn) {
      setView('public-login');
      return;
    }
    if (!credits.isLawyerVerified) {
      setError('Attorney verification required to access procedural intelligence.');
      return;
    }
    
    const contextAvailable = inputMode === 'upload' ? firFile : lookupResult;
    if (!contextAvailable || !selectedSuspect) {
      setError('Provide FIR copy or lookup details and select a suspect.');
      return;
    }
    
    if (credits.balance < ANALYSIS_COST) {
      setError(`Insufficient balance. Analysis requires ${ANALYSIS_COST} LexCoins.`);
      setShowCoinStore(true);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const lawBook = getLawBookContext();
      const firContext = inputMode === 'upload' ? firFile! : lookupResult!.text;
      const result = await analyzeFIR(firContext, lawBook, selectedSuspect);
      setAnalysis(result);
      setCredits(prev => ({ ...prev, balance: prev.balance - ANALYSIS_COST }));
      if (credits.userProfile?.notificationsEnabled && credits.userProfile?.email) {
        addNotification(`Kernel results piped to ${credits.userProfile.email}`, 'email');
      }
    } catch (err) {
      setError('CRITICAL KERNEL ERROR: Check document legibility.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleVaultItem = (id: string) => {
    setSelectedVaultIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (view === 'public-login') {
    return <PublicAccess onSuccess={handleLoginSuccess} onCancel={() => setView('landing')} />;
  }

  if (view === 'admin-login') {
    return <AdminLogin onLogin={() => setView('admin-dashboard')} onCancel={() => setView('landing')} />;
  }

  if (view === 'admin-dashboard') {
    return <AdminDashboard config={adminConfig} transactions={transactions} onSaveConfig={setAdminConfig} onLogout={() => setView('landing')} />;
  }

  if (view === 'landing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black relative">
        <div className="absolute inset-0 opacity-20 pointer-events-none matrix-grid"></div>
        <div className="z-10 text-center mb-16 space-y-4 max-w-2xl">
          <div className="w-24 h-24 bg-black border-2 border-[#00ff41] rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-[0_0_20px_rgba(0,255,65,0.4)]">
            <i className="fas fa-user-secret text-4xl text-[#00ff41]"></i>
          </div>
          <h1 className="text-6xl font-black text-[#00ff41] tracking-tighter uppercase matrix-title flicker">LOOPHOLES.CLAIMS</h1>
          <p className="text-[#00ff41] text-xs font-bold uppercase tracking-[0.5em] opacity-80">Procedural Loophole Kernel v2.5</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl z-10">
          <div className="lex-card p-10 rounded-[2.5rem] flex flex-col items-center text-center space-y-6 group cursor-pointer transition-all hover:scale-[1.02]" onClick={() => setView('public-login')}>
            <div className="w-16 h-16 bg-[#00ff41]/10 rounded-2xl flex items-center justify-center border border-[#00ff41]/20 group-hover:bg-[#00ff41]/20 transition-all">
              <i className="fas fa-magnifying-glass-plus text-3xl text-[#00ff41]"></i>
            </div>
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Public Portal</h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed italic">Access with any gmail account to create account to get the loopholes on your "FIR" number uploaded.</p>
            </div>
            <button className="px-8 py-4 bg-[#00ff41] text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_15px_rgba(0,255,65,0.3)] hover:shadow-[0_0_25px_rgba(0,255,65,0.5)] transition-all">
              Enter Kernel
            </button>
          </div>
          <div className="lex-card p-10 rounded-[2.5rem] flex flex-col items-center text-center space-y-6 group cursor-pointer transition-all hover:scale-[1.02]" onClick={() => setView('admin-login')}>
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 group-hover:bg-slate-700 transition-all">
              <i className="fas fa-terminal text-3xl text-slate-400 group-hover:text-white transition-colors"></i>
            </div>
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">AI CORE</h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">Executive authorization for billing and terminal management.</p>
            </div>
            <button className="px-8 py-4 bg-slate-800 text-slate-300 font-black uppercase tracking-widest text-xs rounded-xl border border-slate-700 hover:text-white hover:bg-slate-700 transition-all">
              Access Core
            </button>
          </div>
        </div>
        <footer className="mt-20 text-[9px] font-black text-[#00ff41]/40 uppercase tracking-[0.3em] z-10">
          &copy; 2025 LOOPHOLES.CLAIMS • AES-256 SECURED • SESSION ENCRYPTED
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        balance={credits.balance} 
        isVerified={credits.isLawyerVerified} 
        userProfile={credits.userProfile}
        onBuyClick={() => setShowCoinStore(true)}
        onAdminClick={() => setView('admin-login')}
        onProfileClick={() => setShowProfile(true)}
      />
      <NotificationSystem notifications={notifications} />
      {showProfile && (
        <ProfileSettings 
          profile={credits.userProfile!} 
          onSave={(p) => setCredits(prev => ({ ...prev, userProfile: p }))}
          onLogout={handleLogout}
          onClose={() => setShowProfile(false)}
        />
      )}
      {showCoinStore && (
        <CoinStore 
          onClose={() => setShowCoinStore(false)} 
          onPurchase={handlePurchase}
          onVerify={verifyLawyer}
          isVerified={credits.isLawyerVerified}
          gateways={adminConfig.gateways}
        />
      )}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in zoom-in-95 duration-500">
          <div className="lg:col-span-4 space-y-6">
            <div className="lex-card rounded-[2rem] p-1 shadow-2xl">
              <div className="p-6 bg-black/40 rounded-[1.8rem]">
                <SuspectManager suspects={suspects} selectedSuspectId={selectedSuspectId} onSelect={setSelectedSuspectId} onAdd={(name, details) => {
                    const newS = { id: crypto.randomUUID(), name, details, addedAt: Date.now() };
                    setSuspects([newS, ...suspects]);
                    setSelectedSuspectId(newS.id);
                  }} onDelete={(id) => {
                    setSuspects(suspects.filter(s => s.id !== id));
                    if (selectedSuspectId === id) setSelectedSuspectId(null);
                  }} />
              </div>
            </div>
            <div className="lex-card rounded-[2rem] p-8 space-y-6 shadow-xl border-[#00ff41]/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-1.5 h-6 bg-[#00ff41] rounded-full shadow-[0_0_10px_rgba(0,255,65,0.5)]"></div>
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Evidence Input</h3>
                </div>
                <div className="flex bg-black/50 p-1 rounded-lg border border-white/10">
                   <button onClick={() => setInputMode('upload')} className={`px-3 py-1 text-[8px] font-black uppercase rounded ${inputMode === 'upload' ? 'bg-[#00ff41] text-black' : 'text-slate-500'}`}>Upload</button>
                   <button onClick={() => setInputMode('lookup')} className={`px-3 py-1 text-[8px] font-black uppercase rounded ${inputMode === 'lookup' ? 'bg-[#00ff41] text-black' : 'text-slate-500'}`}>Lookup</button>
                </div>
              </div>
              
              {inputMode === 'upload' ? (
                <FileUpload onFileSelect={setFirFile} label="Primary FIR Copy" icon="fa-file-shield" currentFile={firFile} />
              ) : (
                <div className="space-y-4 bg-black/40 p-5 rounded-2xl border border-[#00ff41]/10">
                   <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Crime Number</label>
                      <input 
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-[#00ff41]/40 outline-none font-mono"
                        placeholder="e.g. 123/2024"
                        value={crimeNumber}
                        onChange={(e) => setCrimeNumber(e.target.value)}
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Police Station</label>
                      <input 
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-[#00ff41]/40 outline-none font-mono"
                        placeholder="e.g. Colaba PS, Mumbai"
                        value={policeStation}
                        onChange={(e) => setPoliceStation(e.target.value)}
                      />
                   </div>
                   <button 
                     onClick={handleLookup} 
                     disabled={isLookingUp || !crimeNumber || !policeStation}
                     className="w-full py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#00ff41]/10 hover:border-[#00ff41]/40 transition-all flex items-center justify-center space-x-2"
                   >
                     {isLookingUp ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-search"></i>}
                     <span>Sync Records</span>
                   </button>
                   {lookupResult && (
                     <div className="mt-3 p-3 bg-black/60 rounded-xl border border-[#00ff41]/20">
                        <p className="text-[9px] text-[#00ff41] font-bold uppercase tracking-widest mb-1">Records Found</p>
                        <p className="text-[10px] text-slate-400 line-clamp-2 italic">{lookupResult.text}</p>
                     </div>
                   )}
                </div>
              )}

              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2 mb-1">
                   <i className="fas fa-vault text-[10px] text-[#00ff41]/60"></i>
                   <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Statute & Precedent Vault</h4>
                </div>
                
                <div className="bg-black/40 border border-[#00ff41]/10 rounded-2xl p-4 max-h-48 overflow-y-auto custom-scrollbar space-y-2">
                  {STATUTES_VAULT.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => toggleVaultItem(item.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedVaultIds.includes(item.id) 
                        ? 'bg-[#00ff41]/10 border-[#00ff41]/40 text-[#00ff41]' 
                        : 'bg-black border-white/5 text-slate-500 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <i className={`fas ${item.category === 'Statute' ? 'fa-book' : 'fa-gavel'} text-xs`}></i>
                        <span className="text-[10px] font-bold uppercase tracking-tighter">{item.name}</span>
                      </div>
                      {selectedVaultIds.includes(item.id) && <i className="fas fa-check-circle text-[10px]"></i>}
                    </div>
                  ))}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-white/5"></div>
                  </div>
                  <div className="relative flex justify-center text-[8px] uppercase font-black text-slate-600">
                    <span className="bg-black px-2">OR MANUAL PDF</span>
                  </div>
                </div>

                <FileUpload onFileSelect={setLawBookFile} label="Upload Custom Precedent" icon="fa-gavel" currentFile={lawBookFile} />
              </div>
              <button onClick={handleAnalysis} disabled={isAnalyzing || (inputMode === 'upload' ? !firFile : !lookupResult) || !selectedSuspect} className={`w-full mt-6 py-5 rounded-2xl font-black text-black transition-all shadow-xl flex flex-col items-center justify-center space-y-1 group relative overflow-hidden ${isAnalyzing || (inputMode === 'upload' ? !firFile : !lookupResult) || !selectedSuspect ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-60' : 'bg-[#00ff41] hover:shadow-[0_0_25px_rgba(0,255,65,0.4)] active:scale-95'}`}>
                {isAnalyzing ? <span className="flex items-center uppercase tracking-widest text-xs"><i className="fas fa-microchip fa-spin mr-3"></i> Syncing Kernel...</span> : <>
                    <span className="uppercase tracking-[0.15em] text-xs">Analyze Strategy</span>
                    <span className="text-[10px] font-bold opacity-70">DEPLOY {ANALYSIS_COST} LEXCOINS</span>
                  </>}
              </button>
              {error && <div className="p-4 bg-red-900/20 border border-red-900/40 text-red-500 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center">{error}</div>}
            </div>
          </div>
          <div className="lg:col-span-8 space-y-10">
            {analysis ? (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <AnalysisPanel analysis={analysis} suspectName={selectedSuspect?.name || 'Suspect'} />
                <div className="lex-card rounded-[2.5rem] overflow-hidden shadow-2xl border-[#00ff41]/5">
                  <ChatInterface firFile={inputMode === 'upload' ? firFile : (lookupResult?.text || null) as any} lawBookFile={getLawBookContext() as any} suspect={selectedSuspect || null} />
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center lex-card rounded-[3rem] p-12 text-center border-dashed border-2 border-slate-800 group">
                <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner border border-slate-800">
                  <i className="fas fa-scale-balanced text-5xl text-slate-700"></i>
                </div>
                <h3 className="text-3xl font-black text-white tracking-tighter uppercase mb-3 matrix-title">Procedural Terminal</h3>
                <p className="text-slate-500 max-w-md text-sm font-medium leading-relaxed">LexDefense Kernel standby. Provide FIR via upload or lookup and select profile to begin strategy projection.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
