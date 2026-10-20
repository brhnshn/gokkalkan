import React from 'react';
import { ServerIcon, WifiIcon, ShieldCheckIcon } from '../icons/SvgIcons';

export const SystemArchitectureCard: React.FC = () => {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 flex items-center gap-1.5">
        <ServerIcon size={13} />
        <span>Sistem Mimarisi & Altyapı</span>
      </h3>

      <div className="liquid-glass rounded-card p-3.5 space-y-2.5 border border-slate-300/40 dark:border-white/10 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Aktif Dağıtım Katmanı:</span>
          <span className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Cloudflare Workers Edge v5</span>
          </span>
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/50 dark:border-white/5">
          <span className="text-slate-500 dark:text-slate-400">Yedekli Dağıtım:</span>
          <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
            VDS Node.js (Otomatik Yük Devri)
          </span>
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/50 dark:border-white/5">
          <span className="text-slate-500 dark:text-slate-400">Coğrafi Grid Önbellek:</span>
          <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            ~1.1 km (2 Ondalık Lat/Lon)
          </span>
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/50 dark:border-white/5">
          <span className="text-slate-500 dark:text-slate-400">Ağ & PWA Durumu:</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
            <WifiIcon size={13} />
            <span>Çevrimiçi & Çevrimdışı Hazır</span>
          </span>
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/50 dark:border-white/5">
          <span className="text-slate-500 dark:text-slate-400">Veri Kaynakları:</span>
          <span className="text-[11px] text-slate-700 dark:text-slate-300">
            Open-Meteo ECMWF + EMSC FDSN
          </span>
        </div>
      </div>
    </div>
  );
};
