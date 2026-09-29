import React from 'react';
import { useEhr } from '../context/EhrContext';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useEhr();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full no-print">
      {toasts.map(toast => {
        let bg = 'bg-sky-50 border-sky-400 text-sky-950';
        let icon = <Info className="w-5 h-5 text-sky-600 flex-shrink-0" />;

        if (toast.type === 'success') {
          bg = 'bg-emerald-50 border-emerald-400 text-emerald-950';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-50 border-amber-400 text-amber-950';
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />;
        } else if (toast.type === 'error') {
          bg = 'bg-rose-50 border-rose-400 text-rose-950';
          icon = <AlertOctagon className="w-5 h-5 text-rose-600 flex-shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl shadow-xl p-3.5 border transition-all duration-300 transform translate-y-0 ${bg}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2.5">
                {icon}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider">{toast.title}</h4>
                  <p className="text-xs mt-0.5 opacity-90 font-medium leading-relaxed">{toast.message}</p>
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-xs font-bold opacity-50 hover:opacity-100 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
