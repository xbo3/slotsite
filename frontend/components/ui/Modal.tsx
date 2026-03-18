'use client';

import { useEffect, useCallback, ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEsc]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center animate-overlay">
      {/* Overlay */}
      <div className="absolute inset-0 bg-dark-bg/80 backdrop-blur-sm" onClick={onClose} />

      {/* Content: bottom sheet on mobile, centered modal on desktop */}
      <div className={`relative w-full ${sizeClasses[size]} bg-dark-card md:rounded-2xl rounded-t-2xl md:mx-4 border border-white/5 shadow-2xl animate-slide-up md:animate-fade-in max-h-[90vh] flex flex-col`}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
            {/* Mobile drag handle */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/20 rounded-full md:hidden" />
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-colors"
            >
              &#x2715;
            </button>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
