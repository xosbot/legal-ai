
import React, { useRef } from 'react';
import { FileData } from '../types';

interface FileUploadProps {
  onFileSelect: (file: FileData | null) => void;
  label?: string;
  icon?: string;
  currentFile: FileData | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  label = "Upload Image/PDF", 
  icon = "fa-cloud-upload-alt",
  currentFile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        onFileSelect({
          base64,
          mimeType: file.type,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <div 
        className="relative bg-black/40 border border-[#00ff41]/20 rounded-2xl p-5 hover:border-[#00ff41]/50 hover:bg-[#00ff41]/5 transition-all cursor-pointer group shadow-lg"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="absolute inset-0 glossy-overlay pointer-events-none opacity-50"></div>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={onFileChange}
          accept="image/*,.pdf"
          className="hidden" 
        />
        
        {currentFile ? (
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-12 h-12 bg-[#00ff41]/10 rounded-xl flex items-center justify-center text-[#00ff41] border border-[#00ff41]/20">
              <i className={`fas ${currentFile.mimeType === 'application/pdf' ? 'fa-file-pdf' : 'fa-file-image'} text-xl`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white uppercase tracking-tighter truncate">{currentFile.name || "File Attached"}</p>
              <p className="text-[10px] text-[#00ff41] font-bold uppercase tracking-widest mt-1">ENCRYPTED_LOCAL_LINK</p>
            </div>
            <i className="fas fa-check-circle text-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.4)]"></i>
          </div>
        ) : (
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-12 h-12 bg-black border border-white/10 text-slate-500 rounded-xl flex items-center justify-center group-hover:text-[#00ff41] group-hover:border-[#00ff41]/40 transition-all">
              <i className={`fas ${icon} text-xl`}></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
              <p className="text-[9px] text-slate-600 uppercase mt-1">Select source file</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};