import React from 'react';
import type { SentinelVerdict } from '@gokkalkan/shared';
import {
  ShieldCheckIcon,
  AlertTriangleIcon,
  CalendarIcon,
  MapIcon,
  ShareIcon,
} from '../icons/SvgIcons';

export interface SentinelBannerProps {
  verdict?: SentinelVerdict;
  sunsetTime?: string;
  onNavigateTab?: (tabId: 'week' | 'map') => void;
  onShare?: () => void;
}

export const SentinelBanner: React.FC<SentinelBannerProps> = ({
  verdict,
  sunsetTime,
  onNavigateTab,
  onShare,
}) => {
  const level = verdict?.level || 'SAFE';

  const badgeText = verdict?.badgeText || 'GÖKKALKAN NÖBETTE';
  const headline = verdict?.headline || 'Bugün risk yok, keyfini çıkar';
  const subline =
    verdict?.subline ||
    (sunsetTime
      ? `Sonraki 24 saat sakin · Gün batımı ${sunsetTime}`
      : 'Sonraki 24 saat sakin · Gün batımı 18:27');

  const getStyleConfigs = () => {
    switch (level) {
      case 'DANGER':
        return {
          bannerClass:
            'border-rose-500/40 bg-rose-500/[0.12] dark:bg-rose-500/[0.18] shadow-[0_10px_30px_-4px_rgba(239,68,68,0.25)]',
          badgeClass: 'text-rose-700 dark:text-rose-400',
          iconBoxClass:
            'bg-rose-500/20 border-rose-500/40 text-rose-600 dark:text-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.35)]',
          pulseRingClass: 'border-rose-500/40',
          isDanger: true,
        };
      case 'CAUTION':
        return {
          bannerClass:
            'border-amber-500/40 bg-amber-500/[0.12] dark:bg-amber-500/[0.18] shadow-[0_10px_30px_-4px_rgba(245,158,11,0.2)]',
          badgeClass: 'text-amber-700 dark:text-amber-400',
          iconBoxClass:
            'bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
          pulseRingClass: 'border-amber-500/40',
          isDanger: false,
        };
      case 'SAFE':
      default:
        return {
          bannerClass:
            'border-emerald-500/35 bg-emerald-500/[0.10] dark:bg-emerald-500/[0.15] shadow-[0_10px_30px_-4px_rgba(16,185,129,0.2)]',
          badgeClass: 'text-emerald-700 dark:text-emerald-400',
          iconBoxClass:
            'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
          pulseRingClass: 'border-emerald-500/40',
          isDanger: false,
        };
    }
  };

  const config = getStyleConfigs();

  return (
    <div className="px-4">
      <div
        className={`liquid-glass rounded-card p-4 transition-all duration-300 border ${config.bannerClass}`}
      >
        {/* Banner Üst Başlık & Nabız Kalkanı */}
        <div className="flex items-center gap-3 mb-3">
          {/* SVG İkon Çerçevesi ve Animasyonlu Nabız Halkası */}
          <div className="relative">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all ${config.iconBoxClass}`}
            >
              {config.isDanger ? (
                <AlertTriangleIcon size={22} />
              ) : (
                <ShieldCheckIcon size={22} />
              )}
            </div>
            {/* Sürekli hafif nabız vuruşu */}
            <div
              className={`absolute -inset-1 rounded-[18px] border pointer-events-none animate-pulse-shield ${config.pulseRingClass}`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span
                className={`text-[11px] font-bold tracking-wider uppercase ${config.badgeClass}`}
              >
                {badgeText}
              </span>
            </div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate mt-0.5">
              {headline}
            </h2>
          </div>
        </div>

        {/* Alt Satır Açıklaması */}
        <p className="text-xs text-slate-600 dark:text-slate-300 mb-3.5 px-0.5">
          {subline}
        </p>

        {/* 3 Hızlı Eylem Butonu */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab?.('week')}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white/70 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/15 border border-white/60 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm transition-all duration-150 active:scale-[0.96]"
          >
            <CalendarIcon size={14} className="text-sky-600 dark:text-sky-400" />
            <span className="truncate">7 Günü Gör</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab?.('map')}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white/70 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/15 border border-white/60 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm transition-all duration-150 active:scale-[0.96]"
          >
            <MapIcon size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span className="truncate">Harita</span>
          </button>

          <button
            type="button"
            onClick={onShare}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white/70 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/15 border border-white/60 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm transition-all duration-150 active:scale-[0.96]"
          >
            <ShareIcon size={14} className="text-slate-600 dark:text-slate-300" />
            <span className="truncate">Paylaş</span>
          </button>
        </div>
      </div>
    </div>
  );
};
