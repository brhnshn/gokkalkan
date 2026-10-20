import React from 'react';
import { MapLayerType } from './MapLayerPills';

interface MapLegendProps {
  layer: MapLayerType;
}

export const MapLegend: React.FC<MapLegendProps> = ({ layer }) => {
  if (layer === 'rain') {
    return (
      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 px-2 py-1 bg-white/40 dark:bg-slate-900/40 rounded-lg backdrop-blur-sm border border-slate-200/50 dark:border-white/5">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Yağış (dBZ):</span>
        <div className="flex items-center gap-1">
          <span className="w-3 h-2 rounded bg-sky-300 inline-block" title="Hafif" />
          <span>Hafif</span>
          <span className="w-3 h-2 rounded bg-emerald-400 inline-block ml-1" title="Orta" />
          <span>Orta</span>
          <span className="w-3 h-2 rounded bg-amber-400 inline-block ml-1" title="Kuvvetli" />
          <span>Kuvvetli</span>
          <span className="w-3 h-2 rounded bg-rose-600 inline-block ml-1" title="Fırtına" />
          <span className="font-bold text-rose-500">Dolu/Fırtına</span>
        </div>
      </div>
    );
  }

  if (layer === 'wind') {
    return (
      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 px-2 py-1 bg-white/40 dark:bg-slate-900/40 rounded-lg backdrop-blur-sm border border-slate-200/50 dark:border-white/5">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Rüzgâr (knot):</span>
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-emerald-500 font-medium">0-10</span>
          <span>·</span>
          <span className="text-teal-500 font-medium">10-20</span>
          <span>·</span>
          <span className="text-amber-500 font-medium">20-30</span>
          <span>·</span>
          <span className="text-rose-500 font-bold">&gt;30 Fırtına</span>
        </div>
      </div>
    );
  }

  if (layer === 'seismic' || (layer as string) === 'quake') {
    return (
      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 px-2 py-1 bg-white/40 dark:bg-slate-900/40 rounded-lg backdrop-blur-sm border border-slate-200/50 dark:border-white/5">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Sismik (EMSC):</span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
            <span className="text-rose-600 dark:text-rose-400 font-semibold">Episantr</span>
          </span>
          <span className="text-slate-400">|</span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-rose-500 inline-block" />
            <span>KAF Fay Hattı</span>
          </span>
        </div>
      </div>
    );
  }

  // fire
  return (
    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 px-2 py-1 bg-white/40 dark:bg-slate-900/40 rounded-lg backdrop-blur-sm border border-slate-200/50 dark:border-white/5">
      <span className="font-semibold text-slate-700 dark:text-slate-300">FWI Yangın İndeksi:</span>
      <div className="flex items-center gap-1.5">
        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium">
          Düşük (&lt;15)
        </span>
        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium">
          Orta (15-35)
        </span>
        <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold">
          Yüksek (&gt;35)
        </span>
      </div>
    </div>
  );
};
