import React from 'react';
import type { ArcGaugesData } from '@gokkalkan/shared';

export interface RiskArcGaugesProps {
  gauges?: ArcGaugesData;
}

interface SingleArcGaugeProps {
  title: string;
  value: number;
  unit?: string;
  prefix?: string;
  percentage: number;
  strokeColor: string;
  statusText: string;
}

const SingleArcGauge: React.FC<SingleArcGaugeProps> = ({
  title,
  value,
  unit,
  prefix = '',
  percentage,
  strokeColor,
  statusText,
}) => {
  // Semicircle: r = 28, yay boyutu tam olarak π * 28 ≈ 88px
  const fullDash = 88;
  const clampedPercent = Math.max(0, Math.min(100, percentage));
  const dashOffset = fullDash - (clampedPercent / 100) * fullDash;

  return (
    <div className="liquid-glass rounded-card p-3.5 flex flex-col items-center text-center transition-all duration-200">
      {/* SVG Yay Göstergesi */}
      <div className="relative w-[88px] h-[64px] flex items-center justify-center">
        <svg
          width="88"
          height="80"
          viewBox="0 0 80 80"
          className="overflow-visible block"
          aria-hidden="true"
        >
          {/* Arka Plan Statik Yayı */}
          <path
            d="M 12 40 A 28 28 0 0 1 68 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
            className="text-slate-200/80 dark:text-slate-800/80"
          />
          {/* Canlı Değer Yayı (Reaktif Kayma) */}
          <path
            d="M 12 40 A 28 28 0 0 1 68 40"
            fill="none"
            stroke={strokeColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={fullDash}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.3s ease',
            }}
          />
        </svg>

        {/* Yay İçindeki Merkez Değer */}
        <div className="absolute bottom-2 flex flex-col items-center">
          <div className="flex items-baseline gap-0.5">
            <span className="text-base font-bold text-slate-800 dark:text-slate-100 leading-none">
              {prefix}
              {value}
            </span>
            {unit && (
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                {unit}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Başlık */}
      <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 mt-1">
        {title}
      </div>

      {/* Dinamik Durum Açıklaması */}
      <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[120px]">
        {statusText}
      </div>
    </div>
  );
};

export const RiskArcGauges: React.FC<RiskArcGaugesProps> = ({ gauges }) => {
  const rain = Math.round(gauges?.precipitationPct ?? 0);
  const wind = Math.round(gauges?.windKmh ?? 10);
  const hail = Math.round(gauges?.hailLightningPct ?? 0);
  const fire = Math.round(gauges?.fireRiskIndex ?? 25);

  // 1. Yağış İhtimali Açıklaması
  const getRainStatus = (p: number) => {
    if (p === 0) return 'Kuru ve açık';
    if (p <= 30) return 'Düşük ihtimal';
    if (p <= 65) return 'Hafif yağış';
    return 'Kuvvetli yağış';
  };

  // 2. Rüzgâr Hamlesi Açıklaması
  const getWindStatus = (w: number) => {
    if (w <= 12) return 'Hafif meltem';
    if (w <= 28) return 'Tatlı rüzgâr';
    if (w <= 45) return 'Sert rüzgâr';
    return 'Fırtına hamlesi';
  };

  // 3. Dolu & Yıldırım Açıklaması
  const getHailStatus = (h: number) => {
    if (h === 0) return 'Fırtına riski yok';
    if (h <= 25) return 'İhmal edilebilir';
    if (h <= 55) return 'Gök gürültüsü';
    return 'Dolu tehlikesi';
  };

  // 4. Yangın Riski Açıklaması
  const getFireStatus = (f: number) => {
    if (f <= 25) return 'Düşük tehlike';
    if (f <= 50) return 'Orta teyakkuz';
    if (f <= 75) return 'Yüksek teyakkuz';
    return 'Kritik alarm';
  };

  return (
    <div className="px-4">
      <div className="grid grid-cols-2 gap-3">
        {/* 1. Yağış */}
        <SingleArcGauge
          title="Yağış İhtimali"
          value={rain}
          prefix="%"
          percentage={rain}
          strokeColor="#0284c7"
          statusText={getRainStatus(rain)}
        />

        {/* 2. Rüzgâr */}
        <SingleArcGauge
          title="Rüzgâr Hamlesi"
          value={wind}
          unit="km/sa"
          percentage={(wind / 50) * 100}
          strokeColor="#10b981"
          statusText={getWindStatus(wind)}
        />

        {/* 3. Dolu & Yıldırım */}
        <SingleArcGauge
          title="Dolu & Yıldırım"
          value={hail}
          prefix="%"
          percentage={hail}
          strokeColor="#f59e0b"
          statusText={getHailStatus(hail)}
        />

        {/* 4. Yangın Riski */}
        <SingleArcGauge
          title="Yangın İndeksi"
          value={fire}
          unit="/100"
          percentage={fire}
          strokeColor="#ef4444"
          statusText={getFireStatus(fire)}
        />
      </div>
    </div>
  );
};
