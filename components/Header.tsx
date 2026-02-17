
import React from 'react';
import { UserProfile } from '../types';

interface HeaderProps {
  balance?: number;
  isVerified?: boolean;
  userProfile?: UserProfile;
  onBuyClick?: () => void;
  onAdminClick?: () => void;
  onProfileClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  balance = 0, 
  isVerified = false, 
  userProfile,
  onBuyClick, 
  onAdminClick, 
  onProfileClick 
}) => {
  return (
    <header className="bg-black/60 backdrop-blur-xl border-b border-[#00ff41]/10 sticky top-0 z-50">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-black rounded-[1.2rem] flex items-center justify-center shadow-[0_0_15px_rgba(0,255,65,0.2)] border border-[#00ff41]/20 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00ff41]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <i className="fas fa-shield-halved text-[#00ff41] text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter leading-none matrix-title">LOOPHOLES.CLAIMS</h1>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-[9px] text-[#00ff41] uppercase tracking-[0.2em] font-black opacity-80">Kernel v2.5</p>
              {isVerified && (
                <span className="bg-[#00ff41]/10 text-[#00ff41] text-[7px] font-black px-1.5 py-0.5 rounded-full border border-[#00ff41]/20">
                  VERIFIED
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 lg:space-x-8">
          <div className="bg-white/5 border border-white/10 pl-4 pr-1.5 py-1.5 rounded-2xl flex items-center space-x-4">
            <div className="flex flex-col items-end">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Credits</p>
              <p className="text-base font-black text-white tabular-nums tracking-tighter leading-none">{balance.toLocaleString()}</p>
            </div>
            <button 
              onClick={onBuyClick}
              className="w-8 h-8 bg-[#00ff41] text-black rounded-xl flex items-center justify-center hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,65,0.2)] active:scale-90"
            >
              <i className="fas fa-plus text-[10px]"></i>
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={onProfileClick}
              className="w-12 h-12 bg-slate-900 border border-slate-800 text-[#00ff41] rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-all shadow-sm overflow-hidden"
              title="Identity Settings"
            >
              {userProfile?.isLoggedIn && userProfile.avatar ? (
                <img src={userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover" />
              ) : (
                <i className="fas fa-user-gear"></i>
              )}
            </button>
            <button 
              onClick={onAdminClick}
              className="flex h-12 px-5 bg-black text-[#00ff41] text-[9px] font-black rounded-2xl items-center uppercase tracking-[0.2em] border border-[#00ff41]/20 hover:bg-[#00ff41]/10 transition-all active:scale-95"
            >
              <i className="fas fa-terminal mr-2"></i>
              <span className="hidden sm:inline">Kernel HQ</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
