
import React, { useState } from 'react';
import { PaymentGatewayConfig } from '../types';

interface CoinStoreProps {
  onClose: () => void;
  onPurchase: (amount: number, coins: number, method: string) => void;
  onVerify: () => void;
  isVerified: boolean;
  gateways: PaymentGatewayConfig[];
}

type CheckoutStep = 'selection' | 'payment' | 'processing' | 'success';

export const CoinStore: React.FC<CoinStoreProps> = ({ onClose, onPurchase, onVerify, isVerified }) => {
  const [step, setStep] = useState<CheckoutStep>('selection');
  const [selectedPack, setSelectedPack] = useState<{coins: number, price: number} | null>(null);

  const packs = [
    { coins: 1500, price: 1500, label: "Starter_Kernel", popular: false },
    { coins: 5000, price: 4500, label: "Pro_Counsel", popular: true },
    { coins: 20000, price: 15000, label: "Enterprise_Vault", popular: false },
  ];

  const handleSelectPack = (pack: typeof packs[0]) => {
    setSelectedPack(pack);
    setStep('payment');
  };

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      if (selectedPack) onPurchase(selectedPack.price, selectedPack.coins, 'upi');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative bg-black w-full max-w-2xl rounded-[3rem] overflow-hidden border border-[#00ff41]/20 shadow-[0_0_100px_rgba(0,255,65,0.1)]">
        <div className="absolute inset-0 glossy-overlay pointer-events-none opacity-40"></div>
        
        <div className="bg-black/90 p-10 border-b border-[#00ff41]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="w-14 h-14 bg-[#00ff41]/10 rounded-2xl flex items-center justify-center border border-[#00ff41]/30">
                <i className="fas fa-coins text-[#00ff41] text-2xl shadow-[0_0_10px_#00ff41]"></i>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter matrix-title">Lex_Vault</h2>
                <p className="text-[#00ff41] text-[10px] font-bold uppercase tracking-[0.4em] opacity-60">Session_Credits_Auth</p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-slate-500 hover:text-[#00ff41]">
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>
        </div>

        <div className="p-10">
          {!isVerified ? (
            <div className="text-center py-12 space-y-8">
               <div className="w-20 h-20 bg-black border border-red-500/30 rounded-[2rem] flex items-center justify-center mx-auto text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                  <i className="fas fa-fingerprint text-3xl"></i>
               </div>
               <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Identity_Required</h3>
                  <p className="text-slate-500 text-sm mt-3 font-mono">Kernel billing access restricted to verified counselors only.</p>
               </div>
               <button onClick={onVerify} className="w-full max-w-sm py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-[#00ff41] transition-all">
                  AUTHORIZE_ID
               </button>
            </div>
          ) : (
            <>
              {step === 'selection' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {packs.map((pack, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleSelectPack(pack)}
                      className={`lex-card p-8 rounded-[2rem] border-2 transition-all cursor-pointer flex flex-col text-center ${pack.popular ? 'border-[#00ff41] bg-[#00ff41]/5' : 'border-white/5 bg-black'}`}
                    >
                      <p className="text-[10px] font-black text-[#00ff41] uppercase tracking-widest mb-4">{pack.label}</p>
                      <p className="text-4xl font-black text-white tracking-tighter">{pack.coins.toLocaleString()}</p>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">LexCoins</p>
                      <div className="mt-8 pt-8 border-t border-white/5">
                         <p className="text-xl font-bold text-white">₹{pack.price.toLocaleString()}</p>
                         <button className="w-full mt-4 py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase">DEPLOY</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {step === 'payment' && (
                <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                  <div className="bg-[#00ff41]/5 p-6 rounded-[2rem] border border-[#00ff41]/20 flex items-center justify-between">
                     <p className="text-sm font-black text-white uppercase">{selectedPack?.coins.toLocaleString()} LexCoins</p>
                     <p className="text-2xl font-black text-[#00ff41]">₹{selectedPack?.price.toLocaleString()}</p>
                  </div>
                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Protocol: Secure_GPay/UPI</p>
                     <button onClick={handlePay} className="w-full py-6 bg-[#00ff41] text-black rounded-[2rem] font-black text-sm uppercase tracking-[0.4em] shadow-[0_0_30px_rgba(0,255,65,0.4)] hover:bg-white transition-all">
                        INITIATE_TXN
                     </button>
                  </div>
                </div>
              )}

              {step === 'processing' && (
                <div className="flex flex-col items-center justify-center py-20 space-y-8">
                   <div className="w-20 h-20 border-4 border-white/5 border-t-[#00ff41] rounded-full animate-spin"></div>
                   <p className="text-[#00ff41] text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Syncing_Gateway...</p>
                </div>
              )}

              {step === 'success' && (
                <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in zoom-in-95 duration-500">
                   <div className="w-24 h-24 bg-[#00ff41] text-black rounded-[2rem] flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(0,255,65,0.5)]">
                      <i className="fas fa-check"></i>
                   </div>
                   <div className="text-center">
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Credits_Synced</h3>
                      <p className="text-slate-500 text-xs font-mono mt-2">Vault balance updated successfully.</p>
                   </div>
                   <button onClick={onClose} className="px-12 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest">RETURN_TO_KERNEL</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};