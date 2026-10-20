import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeWipeProvider';
import {
  MapPinIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
  ShareIcon,
  CheckIcon,
} from '../icons/SvgIcons';

interface AppHeaderProps {
  locationName: string;
  onOpenLocationModal?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  locationName,
  onOpenLocationModal,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [timeStr, setTimeStr] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: 'GÖKKALKAN Radar',
      text: `${locationName} meteorolojik risk ve erken uyarı durumu.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Kullanıcı paylaşımı iptal etti
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Pano erişim hatası
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full pt-[calc(10px+env(safe-area-inset-top))] pb-3 px-4 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 transition-colors duration-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)]">
      <div className="max-w-[420px] mx-auto flex items-center justify-between">
        {/* Konum Seçici Hap Butonu */}
        <button
          type="button"
          onClick={onOpenLocationModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass text-slate-800 dark:text-slate-100 font-semibold text-xs transition-all duration-200 active:scale-[0.97]"
          aria-label="Konum Değiştir"
        >
          <MapPinIcon size={14} className="text-emerald-600 dark:text-emerald-400" />
          <span className="truncate max-w-[140px] tracking-tight">{locationName}</span>
          <ChevronDownIcon size={12} className="text-slate-400" />
        </button>

        {/* Canlı Saat ve Eylem Butonları */}
        <div className="flex items-center gap-2">
          {/* Canlı Dijital Saat */}
          <div className="px-2.5 py-1 rounded-full bg-slate-200/50 dark:bg-slate-800/50 text-[11px] font-mono font-medium text-slate-600 dark:text-slate-300">
            {timeStr || '--:--'}
          </div>

          {/* Dairesel Perdelemeli Tema Değiştirici Buton */}
          <button
            id="gokThemeToggleBtn"
            type="button"
            onClick={(e) => toggleTheme(e)}
            className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all duration-200 active:scale-[0.94] focus:outline-none"
            title={isDark ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
            aria-label="Temayı Değiştir"
          >
            {isDark ? (
              <SunIcon size={16} className="text-amber-400" />
            ) : (
              <MoonIcon size={16} className="text-slate-700" />
            )}
          </button>

          {/* Web Share / Pano Butonu */}
          <button
            type="button"
            onClick={handleShare}
            className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all duration-200 active:scale-[0.94] focus:outline-none"
            title="Paylaş"
            aria-label="Paylaş"
          >
            {copied ? (
              <CheckIcon size={15} className="text-emerald-500" />
            ) : (
              <ShareIcon size={15} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
