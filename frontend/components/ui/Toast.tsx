'use client';

import { useState, useCallback, createContext, useContext, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  exiting?: boolean;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onClose={() => {
            setToasts(prev => prev.map(t => t.id === toast.id ? { ...t, exiting: true } : t));
            setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toast.id)), 300);
          }} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const icons: Record<ToastType, string> = {
    success: '\u2713',
    error: '\u2717',
    warning: '\u26A0',
  };
  const colors: Record<ToastType, string> = {
    success: 'border-l-4 border-l-success bg-success/10',
    error: 'border-l-4 border-l-danger bg-danger/10',
    warning: 'border-l-4 border-l-warning bg-warning/10',
  };
  const iconColors: Record<ToastType, string> = {
    success: 'text-success',
    error: 'text-danger',
    warning: 'text-warning',
  };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg bg-dark-card ${colors[toast.type]} shadow-xl min-w-[300px] max-w-[420px] ${toast.exiting ? 'animate-slide-out' : 'animate-slide-in'}`}
    >
      <span className={`text-lg font-bold ${iconColors[toast.type]}`}>{icons[toast.type]}</span>
      <p className="text-sm text-white flex-1">{toast.message}</p>
      <button onClick={onClose} className="text-text-muted hover:text-white text-sm ml-2">
        &#x2715;
      </button>
    </div>
  );
}
