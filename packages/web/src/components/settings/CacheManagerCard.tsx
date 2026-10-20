import React, { useState, useEffect } from 'react';
import {
  calculateLocalStorageSize,
  clearAllGokkalkanCache,
} from '../../services/settingsStorage';
import { DatabaseIcon, RefreshIcon, CheckIcon } from '../icons/SvgIcons';

export const CacheManagerCard: React.FC = () => {
  const [cacheSize, setCacheSize] = useState<string>('0 KB');
  const [isCleared, setIsCleared] = useState<boolean>(false);
  const [syncTime, setSyncTime] = useState<string>('Şimdi');

  const updateSize = () => {
    const { formatted } = calculateLocalStorageSize();
    setCacheSize(formatted);
  };

  useEffect(() => {
    updateSize();
    const now = new Date();
    setSyncTime(
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    );
  }, []);

  const handleClear = () => {
    clearAllGokkalkanCache();
    setIsCleared(true);
    updateSize();
    setTimeout(() => {
      setIsCleared(false);
      window.location.reload();
    }, 1200);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 flex items-center gap-1.5">
        <DatabaseIcon size={13} />
        <span>PWA & Çevrimdışı Önbellek Yönetimi</span>
      </h3>

      <div className="liquid-glass rounded-card p-3.5 space-y-3 border border-slate-300/40 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <span>Cihazda Saklanan Veri:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {cacheSize}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Son Senkronizasyon: Bugün, {syncTime}
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            disabled={isCleared}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all tactile-active ${
              isCleared
                ? 'bg-emerald-500 text-white'
                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
            }`}
          >
            {isCleared ? (
              <>
                <CheckIcon size={14} />
                <span>Temizlendi</span>
              </>
            ) : (
              <>
                <RefreshIcon size={13} />
                <span>Önbelleği Sıfırla</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-200/50 dark:border-white/5">
          GÖKKALKAN PWA, internet kesintilerinde radar, sismik ve hava durumu verilerini cihazınızda tutar ve anında offline olarak açılmasını sağlar.
        </p>
      </div>
    </div>
  );
};
