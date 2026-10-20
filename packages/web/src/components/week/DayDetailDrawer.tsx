import React from 'react';
import { createPortal } from 'react-dom';
import type { DailyForecastSlot } from '@gokkalkan/shared';
import {
  XIcon,
  SunIcon,
  CloudSunIcon,
  CloudIcon,
  RainIcon,
  CloudLightningIcon,
  DropletsIcon,
  WindIcon,
  SproutIcon,
  AnchorIcon,
  ThermometerIcon,
  ClockIcon,
} from '../icons/SvgIcons';

interface DayDetailDrawerProps {
  slot: DailyForecastSlot | null;
  onClose: () => void;
}

export const DayDetailDrawer: React.FC<DayDetailDrawerProps> = ({
  slot,
  onClose,
}) => {
  if (!slot || typeof document === 'undefined') return null;

  const renderConditionIcon = (code: number, size = 16) => {
    if (code >= 95) return <CloudLightningIcon size={size} className="text-amber-500" />;
    if (code >= 51 && code <= 67) return <RainIcon size={size} className="text-blue-500" />;
    if (code >= 1 && code <= 3) return <CloudSunIcon size={size} className="text-amber-500" />;
    if (code === 0) return <SunIcon size={size} className="text-amber-500" />;
    return <CloudIcon size={size} className="text-slate-400" />;
  };

  // 8 Saatlik simüle edilmiş detay dökümü
  const hourlySteps = [
    { time: '00:00', temp: slot.tempMin + 1, pop: Math.max(0, slot.precipitationProbPct - 10), wind: Math.round(slot.windMaxKmh * 0.7) },
    { time: '03:00', temp: slot.tempMin, pop: slot.precipitationProbPct, wind: Math.round(slot.windMaxKmh * 0.6) },
    { time: '06:00', temp: slot.tempMin + 1, pop: slot.precipitationProbPct, wind: Math.round(slot.windMaxKmh * 0.7) },
    { time: '09:00', temp: Math.round((slot.tempMin + slot.tempMax) / 2), pop: Math.max(0, slot.precipitationProbPct - 5), wind: Math.round(slot.windMaxKmh * 0.85) },
    { time: '12:00', temp: slot.tempMax, pop: slot.precipitationProbPct, wind: slot.windMaxKmh },
    { time: '15:00', temp: slot.tempMax - 1, pop: slot.precipitationProbPct, wind: slot.windMaxKmh },
    { time: '18:00', temp: Math.round((slot.tempMin + slot.tempMax) / 2 + 1), pop: Math.max(0, slot.precipitationProbPct - 15), wind: Math.round(slot.windMaxKmh * 0.75) },
    { time: '21:00', temp: slot.tempMin + 3, pop: Math.max(0, slot.precipitationProbPct - 20), wind: Math.round(slot.windMaxKmh * 0.65) },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 backdrop-blur-md animate-backdrop" onClick={onClose}>
      <div
        className="w-full max-w-[420px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-t-[32px] border-t border-slate-300/40 dark:border-white/10 p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl animate-sheet-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Çekmece Başlığı */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
              {renderConditionIcon(slot.conditionCode, 22)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {slot.dayName} Tahmin Özeti
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {slot.dateIso}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {slot.conditionText} · En Düşük {slot.tempMin}° / En Yüksek {slot.tempMax}°
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors tactile-active"
            aria-label="Kapat"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* 8 Saatlik Zaman Çizelgesi */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <ClockIcon size={13} className="text-blue-500" />
            <span>Saatlik Sıcaklık & Yağış Dökümü</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {hourlySteps.map((step) => (
              <div
                key={step.time}
                className="liquid-glass rounded-xl p-2.5 flex flex-col items-center min-w-[62px] space-y-1.5 text-center shrink-0 border border-slate-200/50 dark:border-white/5"
              >
                <span className="text-[10px] font-mono text-slate-400">{step.time}</span>
                <div>{renderConditionIcon(slot.conditionCode, 16)}</div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {step.temp}°
                </span>
                <div className="flex items-center gap-0.5 text-[9px] text-blue-500 font-medium">
                  <DropletsIcon size={9} />
                  <span>%{step.pop}</span>
                </div>
                <div className="flex items-center gap-0.5 text-[9px] text-slate-400 font-mono">
                  <WindIcon size={9} />
                  <span>{step.wind}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zirai ve Denizcilik Değerlendirme Kartları */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* Zirai Özet */}
          <div className="liquid-glass rounded-2xl p-3 space-y-1.5 border border-amber-500/20 bg-amber-500/[0.03]">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              <SproutIcon size={14} />
              <span>Tarlam Analizi</span>
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {slot.tempMin <= 2 ? 'Don Nöbeti Gerekli' : 'Zirai Koşullar Sakin'}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {slot.tempMin <= 2
                ? 'Gece ve gün doğumu saatlerinde yer seviyesinde don riski yüksek.'
                : 'Gece sıcaklığı don eşiğinin üzerinde. İlaçlama için öğleden önce uygun.'}
            </p>
          </div>

          {/* Denizcilik Özeti */}
          <div className="liquid-glass rounded-2xl p-3 space-y-1.5 border border-sky-500/20 bg-sky-500/[0.03]">
            <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 text-xs font-semibold">
              <AnchorIcon size={14} />
              <span>Denizde Durum</span>
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {slot.windMaxKmh >= 35 ? 'Kuvvetli Hamle / Fırtına' : 'Seyir İçin Elverişli'}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Maksimum rüzgâr hamlesi {slot.windMaxKmh} km/sa ({Math.round(slot.windMaxKmh / 1.852)} knot).
              Boğaz ve açık deniz geçişlerinde dikkat edilmelidir.
            </p>
          </div>
        </div>

        {/* Kapat Butonu */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold transition-all tactile-active"
        >
          Tamam
        </button>
      </div>
    </div>,
    document.body
  );
};
