import React from 'react';
import { useToastStore } from '../../store/toast.store';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import clsx from 'clsx';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let colorClasses = 'bg-slate-900/90 border-slate-800 text-slate-200';
        let iconColor = 'text-blue-400';

        switch (toast.type) {
          case 'success':
            Icon = CheckCircle2;
            colorClasses = 'bg-emerald-950/90 border-emerald-800/30 text-emerald-100';
            iconColor = 'text-emerald-400';
            break;
          case 'error':
            Icon = AlertCircle;
            colorClasses = 'bg-rose-950/90 border-rose-800/30 text-rose-100';
            iconColor = 'text-rose-400';
            break;
          case 'warning':
            Icon = AlertTriangle;
            colorClasses = 'bg-amber-950/90 border-amber-800/30 text-amber-100';
            iconColor = 'text-amber-400';
            break;
          default:
            Icon = Info;
            colorClasses = 'bg-slate-900/95 border-slate-800 text-slate-200';
            iconColor = 'text-blue-400';
        }

        return (
          <div
            key={toast.id}
            className={clsx(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-slide-in-right',
              colorClasses
            )}
            role="alert"
            aria-live="assertive"
          >
            <Icon className={clsx('w-5 h-5 shrink-0 mt-0.5', iconColor)} />
            <div className="flex-1 text-xs font-semibold leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors shrink-0 p-0.5 hover:bg-white/5 rounded"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
