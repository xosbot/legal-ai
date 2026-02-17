
import React from 'react';

interface Notification {
  id: string;
  message: string;
  type: 'email' | 'alert';
}

interface NotificationSystemProps {
  notifications: Notification[];
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications }) => {
  return (
    <div className="fixed top-20 right-4 z-[100] space-y-3 w-80 pointer-events-none">
      {notifications.map((n) => (
        <div 
          key={n.id}
          className={`p-4 rounded-2xl shadow-2xl border flex items-start space-x-3 animate-in slide-in-from-right duration-300 pointer-events-auto bg-white ${
            n.type === 'email' ? 'border-indigo-100 shadow-indigo-100/50' : 'border-amber-100 shadow-amber-100/50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            n.type === 'email' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
          }`}>
            <i className={`fas ${n.type === 'email' ? 'fa-envelope-circle-check' : 'fa-bell'}`}></i>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400">
              {n.type === 'email' ? 'External Notification' : 'System Alert'}
            </p>
            <p className="text-xs font-bold text-slate-800 leading-tight">
              {n.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
