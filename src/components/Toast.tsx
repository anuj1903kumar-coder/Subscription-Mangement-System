import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
            case 'error':
              return <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
            case 'warning':
              return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
            default:
              return <Info className="w-5 h-5 text-indigo-400 shrink-0" />;
          }
        };

        const getBorder = () => {
          switch (toast.type) {
            case 'success':
              return 'border-emerald-500/40 bg-slate-900/95';
            case 'error':
              return 'border-rose-500/40 bg-slate-900/95';
            case 'warning':
              return 'border-amber-500/40 bg-slate-900/95';
            default:
              return 'border-indigo-500/40 bg-slate-900/95';
          }
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 ${getBorder()}`}
          >
            {getIcon()}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-100">{toast.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
