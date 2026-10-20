import React from 'react';
import type { SeismicEvent, AgriRiskReport, MarineRiskReport } from '@gokkalkan/shared';
import {
  ActivityIcon,
  SproutIcon,
  AnchorIcon,
  ChevronRightIcon,
  SlidersIcon,
} from '../icons/SvgIcons';

export interface ActivityBentoCardsProps {
  earthquake?: SeismicEvent | null;
  agriculture?: AgriRiskReport;
  marine?: MarineRiskReport;
  onOpenAgriDetails: () => void;
  onOpenMarineDetails: () => void;
  onOpenEarthquakeDetails: () => void;
}

export const ActivityBentoCards: React.FC<ActivityBentoCardsProps> = ({
  earthquake,
  agriculture,
  marine,
  onOpenAgriDetails,
  onOpenMarineDetails,
  onOpenEarthquakeDetails,
}) => {
  // Varsayılan deprem verisi fallback
  const eq = earthquake || {
    id: 'emsc-demo',
    magnitude: 2.9,
    region: 'Western Turkey (Çanakkale)',
    distanceKm: 24.5,
    hoursAgo: 2,
    depthKm: 7.2,
    source: 'EMSC' as const,
    timeIso: new Date().toISOString(),
  };

  // Zirai ve deniz durum rozetleri
  const agriStatusText = agriculture?.status || 'Düşük Risk';
  const marineStatusText = marine?.status || 'UYGUN';

  return (
    <div className="px-4 space-y-3">
      {/* 1. Son Deprem Bento Kartı (Animasyonlu Sismik Dalgalar) */}
      <div className="relative overflow-hidden rounded-card p-4 transition-all duration-200 liquid-glass border border-rose-500/30 bg-rose-500/[0.06] dark:bg-rose-500/[0.10]">
        {/* Arka Planda Animasyonlu Sismik Radar Halkaları */}
        <svg
          className="absolute -right-6 -top-6 w-36 h-36 pointer-events-none opacity-25 text-rose-500"
          viewBox="0 0 140 140"
          aria-hidden="true"
        >
          <circle
            cx="70"
            cy="70"
            r="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="seismic-wave-ring"
          />
          <circle
            cx="70"
            cy="70"
            r="35"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="seismic-wave-ring"
          />
          <circle
            cx="70"
            cy="70"
            r="55"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            className="seismic-wave-ring"
          />
        </svg>

        {/* Deprem Üst Bilgi Satırı */}
        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <ActivityIcon size={14} />
            <span>Son Deprem</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {eq.hoursAgo ? `${eq.hoursAgo} saat önce` : 'Az önce'}
          </span>
        </div>

        {/* Büyüklük ve Bölge */}
        <div className="flex items-baseline gap-3 mb-3 relative z-10">
          <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight leading-none">
            {eq.magnitude.toFixed(1)}
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {eq.region}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {eq.distanceKm} km mesafe · Derinlik: {eq.depthKm} km · EMSC
            </div>
          </div>
        </div>

        {/* Sismik Eylem Butonu */}
        <div className="flex items-center justify-between pt-2.5 border-t border-rose-500/20 relative z-10">
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
            Sismik Erken Uyarı Radarı
          </span>
          <button
            type="button"
            onClick={onOpenEarthquakeDetails}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/70 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/15 border border-white/60 dark:border-white/10 text-rose-600 dark:text-rose-400 text-xs font-semibold shadow-sm transition-all duration-150 active:scale-[0.96]"
          >
            <SlidersIcon size={13} />
            <span>Deprem Uyarısını Aç</span>
          </button>
        </div>
      </div>

      {/* 2. Tarlam ve Denizde İkili Bento Kart Izgarası */}
      <div className="grid grid-cols-2 gap-3">
        {/* Tarlam Zirai Durum Kartı */}
        <div
          onClick={onOpenAgriDetails}
          className="liquid-glass rounded-card p-3.5 cursor-pointer flex flex-col justify-between h-36 transition-all duration-150 active:scale-[0.97] hover:border-emerald-500/40"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <SproutIcon size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 tracking-wider uppercase">
              {agriStatusText}
            </span>
          </div>

          <div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Tarlam
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Toprak: %{agriculture?.soilMoisturePct ?? 42} · Don: %{agriculture?.frostRiskPct ?? 5}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 mt-2">
              <span>Zirai Detaylar</span>
              <ChevronRightIcon size={12} />
            </div>
          </div>
        </div>

        {/* Denizde Seyir Kartı */}
        <div
          onClick={onOpenMarineDetails}
          className="liquid-glass rounded-card p-3.5 cursor-pointer flex flex-col justify-between h-36 transition-all duration-150 active:scale-[0.97] hover:border-sky-500/40"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <AnchorIcon size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-400 tracking-wider uppercase">
              {marineStatusText}
            </span>
          </div>

          <div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Denizde
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Dalga: {marine?.waveHeightM ?? 0.4}m · Hamle: {marine?.windGustKnots ?? 8} kt
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 mt-2">
              <span>Seyir Analizi</span>
              <ChevronRightIcon size={12} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
