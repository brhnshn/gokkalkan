import React, { useEffect } from 'react';
import { PlayIcon, PauseIcon, RefreshIcon, ClockIcon } from '../icons/SvgIcons';

interface MapTimelinePlayerProps {
  timeOffsetMin: number; // -120 to +60
  onChangeTimeOffset: (offset: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const MapTimelinePlayer: React.FC<MapTimelinePlayerProps> = ({
  timeOffsetMin,
  onChangeTimeOffset,
  isPlaying,
  onTogglePlay,
}) => {
  // Playback animasyonu: Her 1.2 saniyede bir 15 dakika ileri al, +60 olunca -120'ye sar
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      onChangeTimeOffset((prevOffset => (prevOffset >= 60 ? -120 : prevOffset + 15))(timeOffsetMin));
    }, 1200);

    return () => clearInterval(interval);
  }, [isPlaying, timeOffsetMin, onChangeTimeOffset]);

  const formatOffsetLabel = (mins: number) => {
    if (mins === 0) return 'Canlı (Şimdi)';
    if (mins < 0) return `${Math.abs(mins)} dk Önce (Geçmiş)`;
    return `+${mins} dk İleri (Tahmin)`;
  };

  return (
    <div className="liquid-glass rounded-card p-3 space-y-2 border border-slate-300/40 dark:border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Durdur' : 'Oynat'}
            className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-transform tactile-active shadow-sm"
          >
            {isPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
          </button>

          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100">
              <ClockIcon size={13} className="text-blue-500" />
              <span>{formatOffsetLabel(timeOffsetMin)}</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              {timeOffsetMin <= 0 ? 'Radar Reflektivite Arşivi' : 'Nowcasting Yakın Gelecek Simülasyonu'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onChangeTimeOffset(0)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all tactile-active ${
            timeOffsetMin === 0
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <RefreshIcon size={11} />
          <span>Canlı</span>
        </button>
      </div>

      {/* Zaman Kaydırıcı (Timeline Slider) */}
      <div className="space-y-1 pt-1">
        <div className="relative flex items-center">
          <input
            type="range"
            min="-120"
            max="60"
            step="15"
            value={timeOffsetMin}
            onChange={(e) => onChangeTimeOffset(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Zaman Çentik Etiketleri */}
        <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500 px-0.5">
          <span>-2 sa</span>
          <span>-1 sa</span>
          <span className={timeOffsetMin === 0 ? 'font-bold text-emerald-500' : ''}>Şimdi</span>
          <span>+30 dk</span>
          <span>+1 sa</span>
        </div>
      </div>
    </div>
  );
};
