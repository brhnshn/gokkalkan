import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from '../icons/SvgIcons';

export interface DetailBottomSheetProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const DetailBottomSheet: React.FC<DetailBottomSheetProps> = ({
  isOpen,
  title,
  onClose,
  children,
}) => {
  // ESC tuşu ile kapatma desteği
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Çekmece açıkken arka plan kaydırmasını kilitle
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex flex-col justify-end">
      {/* Karartılmış & Bulanık Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-md animate-backdrop"
        aria-hidden="true"
      />

      {/* Alttan Kayarak Açılan Liquid Glass iOS Alt Çekmecesi */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-[70] w-full max-w-[420px] mx-auto max-h-[85vh] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-x border-white/60 dark:border-white/10 rounded-t-[32px] shadow-[0_-15px_45px_rgba(0,0,0,0.35)] px-5 pt-3 pb-[calc(24px+env(safe-area-inset-bottom))] overflow-y-auto no-scrollbar animate-sheet-up"
      >
        {/* iOS Drag Handle Bar */}
        <div className="w-11 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-4 cursor-grab active:cursor-grabbing" />

        {/* Çekmece Başlığı & Kapatma Butonu */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/60 dark:border-slate-800/80">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors active:scale-[0.92]"
            aria-label="Kapat"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Gövde İçeriği */}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
