
import React, { useState, useRef, useEffect } from 'react';
import { Message, FileData, Suspect } from '../types';
import { chatWithGemini } from '../services/geminiService';

interface ChatInterfaceProps {
  firFile: FileData | null;
  lawBookFile: FileData | null;
  suspect: Suspect | null;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ firFile, lawBookFile, suspect }) => {
  const getStorageKey = (id: string | undefined) => `lex_chat_history_${id || 'default'}`;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storageKey = getStorageKey(suspect?.id);
    const savedHistory = localStorage.getItem(storageKey);
    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory));
      } catch (e) {
        resetToDefault();
      }
    } else {
      resetToDefault();
    }
  }, [suspect?.id]);

  useEffect(() => {
    const storageKey = getStorageKey(suspect?.id);
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, suspect?.id]);

  const resetToDefault = () => {
    setMessages([{ 
      role: 'assistant', 
      content: `Kernel initialized. Contextual analysis for ${suspect?.name || 'Subject'} active. State your procedural query.` 
    }]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);
    try {
      const response = await chatWithGemini(updatedMessages, userMessage.content, firFile, lawBookFile, suspect);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.text,
        groundingLinks: response.groundingLinks
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "CRITICAL_ERROR: Neural bridge failed." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="lex-card rounded-[2.5rem] border-[#00ff41]/20 flex flex-col h-[650px] overflow-hidden relative shadow-2xl">
      <div className="absolute inset-0 glossy-overlay pointer-events-none opacity-30"></div>
      
      <div className="bg-black/90 px-8 py-5 text-white flex items-center justify-between border-b border-[#00ff41]/10 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-[#00ff41]/10 rounded-xl flex items-center justify-center border border-[#00ff41]/20 shadow-[0_0_15px_rgba(0,255,65,0.2)]">
            <i className="fas fa-brain text-[#00ff41] text-lg"></i>
          </div>
          <div>
            <h2 className="font-black text-white uppercase tracking-tighter text-base matrix-title">Strategy_Bridge</h2>
            <p className="text-[9px] text-[#00ff41] font-bold uppercase tracking-[0.3em] opacity-60 mt-1">
              Active_Link: {suspect?.name || 'Terminal_Wait'}
            </p>
          </div>
        </div>
        <button onClick={() => setMessages([])} className="text-slate-500 hover:text-red-500 transition-colors">
          <i className="fas fa-power-off text-sm"></i>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar relative z-10 bg-black/20">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-2xl text-[13px] leading-relaxed font-medium shadow-xl ${
              m.role === 'user' 
                ? 'bg-[#00ff41] text-black font-bold rounded-tr-none' 
                : 'bg-black/80 border border-[#00ff41]/20 text-slate-300 rounded-tl-none'
            }`}>
              {m.role === 'assistant' && <span className="text-[#00ff41] font-black text-[9px] block mb-2 uppercase tracking-widest">> Model_Response:</span>}
              {m.content}
            </div>
            {m.groundingLinks && m.groundingLinks.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 max-w-[85%]">
                {m.groundingLinks.map((link, li) => (
                  <a key={li} href={link.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-[#00ff41] bg-[#00ff41]/5 px-3 py-1.5 rounded-lg border border-[#00ff41]/20 hover:bg-[#00ff41]/10 transition-colors uppercase">
                    <i className="fas fa-search-nodes mr-2"></i> {link.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-black/80 border border-[#00ff41]/10 p-5 rounded-2xl rounded-tl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-[#00ff41]/40 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#00ff41]/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-[#00ff41]/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t border-[#00ff41]/10 bg-black/60 relative z-10">
        <div className="flex space-x-3">
          <input
            type="text"
            placeholder="PIPING DATA TO KERNEL..."
            className="flex-1 px-6 py-4 bg-black border border-white/10 rounded-2xl outline-none focus:border-[#00ff41]/40 transition-all text-sm font-mono text-white placeholder-slate-700"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-14 h-14 bg-[#00ff41] text-black rounded-2xl hover:bg-white flex items-center justify-center transition-all disabled:opacity-20 shadow-[0_0_20px_rgba(0,255,65,0.3)]"
          >
            <i className="fas fa-bolt-lightning"></i>
          </button>
        </div>
      </div>
    </div>
  );
};