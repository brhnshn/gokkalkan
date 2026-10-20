import React from 'react';

interface TemperatureRangeBarProps {
  min: number;
  max: number;
  weekMin: number;
  weekMax: number;
  isToday?: boolean;
  currentTemp?: number;
}

export const TemperatureRangeBar: React.FC<TemperatureRangeBarProps> = ({
  min,
  max,
  weekMin,
  weekMax,
  isToday = false,
  currentTemp,
}) => {
  const totalRange = Math.max(1, weekMax - weekMin);
  const leftPct = Math.max(0, Math.min(100, ((min - weekMin) / totalRange) * 100));
  const widthPct = Math.max(8, Math.min(100 - leftPct, ((max - min) / totalRange) * 100));

  let currentDotPct: number | null = null;
  if (isToday && currentTemp !== undefined) {
    currentDotPct = Math.max(0, Math.min(100, ((currentTemp - weekMin) / totalRange) * 100));
  }

  return (
    <div className="flex items-center gap-2 text-xs font-mono font-medium">
      <span className="text-slate-400 dark:text-slate-500 w-6 text-right select-none">
        {Math.round(min)}°
      </span>

      {/* Apple Weather Çubuğu */}
      <div className="w-16 h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700/80 overflow-hidden relative">
        {/* Sıcaklık Gradyanı (Mavi -> Zümrüt -> Amber -> Kırmızı) */}
        <div
          className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 to-amber-500 transition-all duration-300"
          style={{
            left: `${leftPct}%`,
            width: `${widthPct}%`,
          }}
        />

        {/* Bugün İçin Anlık Sıcaklık Gösterge Noktası */}
        {currentDotPct !== null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-md ring-1 ring-slate-900/30 z-10"
            style={{ left: `${currentDotPct}%` }}
            title={`Anlık Sıcaklık: ${currentTemp}°`}
          />
        )}
      </div>

      <span className="text-slate-800 dark:text-slate-100 w-6 select-none font-semibold">
        {Math.round(max)}°
      </span>
    </div>
  );
};
