import React from 'react';
import type { DailyForecastSlot } from '@gokkalkan/shared';
import {
  SunIcon,
  CloudSunIcon,
  CloudIcon,
  RainIcon,
  CloudLightningIcon,
  DropletsIcon,
  WindIcon,
  SproutIcon,
  AnchorIcon,
  ChevronRightIcon,
} from '../icons/SvgIcons';
import { TemperatureRangeBar } from './TemperatureRangeBar';

interface DayForecastCardProps {
  slot: DailyForecastSlot;
  isToday: boolean;
  currentTemp?: number;
  weekMin: number;
  weekMax: number;
  onClick: () => void;
}

export const DayForecastCard: React.FC<DayForecastCardProps> = ({
  slot,
  isToday,
  currentTemp,
  weekMin,
  weekMax,
  onClick,
}) => {
  const renderConditionIcon = (code: number) => {
    if (code >= 95) {
      return <CloudLightningIcon size={18} className="text-amber-500" />;
    }
    if (code >= 51 && code <= 67) {
      return <RainIcon size={18} className="text-blue-500" />;
    }
    if (code >= 1 && code <= 3) {
      return <CloudSunIcon size={18} className="text-amber-500" />;
    }
    if (code === 0) {
      return <SunIcon size={18} className="text-amber-500" />;
    }
    return <CloudIcon size={18} className="text-slate-400" />;
  };

  // Zirai & Deniz Risk Değerlendirmesi
  const getAgriBadge = () => {
    if (slot.tempMin <= 2) {
      return { label: 'Don Riski', className: 'text-amber-600 dark:text-amber-400 bg-amber-500/15' };
    }
    if (slot.windMaxKmh <= 15 && slot.precipitationProbPct < 20) {
      return { label: 'İlaçlama Uygun', className: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15' };
    }
    return null;
  };

  const getMarineBadge = () => {
    if (slot.windMaxKmh >= 35) {
      return { label: 'Deniz Fırtınası', className: 'text-rose-600 dark:text-rose-400 bg-rose-500/15' };
    }
    if (slot.windMaxKmh <= 18) {
      return { label: 'Deniz Sakin', className: 'text-sky-600 dark:text-sky-400 bg-sky-500/15' };
    }
    return null;
  };

  const agriBadge = getAgriBadge();
  const marineBadge = getMarineBadge();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left liquid-glass rounded-card p-3 space-y-2.5 transition-all duration-200 border tactile-active ${
        isToday
          ? 'border-blue-500/40 bg-blue-500/[0.04]'
          : 'border-slate-300/40 dark:border-white/10 hover:border-slate-400/50 dark:hover:border-white/20'
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Gün Başlığı ve İkon */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center shrink-0 shadow-sm">
            {renderConditionIcon(slot.conditionCode)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {isToday ? 'Bugün' : slot.dayName}
              </span>
              {isToday && (
                <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-blue-600 text-white">
                  Şimdi
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[110px]">
              {slot.conditionText}
            </div>
          </div>
        </div>

        {/* Min / Max Sıcaklık Çubuğu */}
        <div className="flex items-center gap-1">
          <TemperatureRangeBar
            min={slot.tempMin}
            max={slot.tempMax}
            weekMin={weekMin}
            weekMax={weekMax}
            isToday={isToday}
            currentTemp={currentTemp}
          />
          <ChevronRightIcon size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
        </div>
      </div>

      {/* Alt Bilgi Şeridi: Yağış, Rüzgar ve Zirai/Deniz Uygunluk Etiketleri */}
      <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/50 dark:border-white/5 text-[10px]">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-0.5 text-blue-500 font-medium">
            <DropletsIcon size={11} />
            %{slot.precipitationProbPct}
          </span>
          <span className="flex items-center gap-0.5">
            <WindIcon size={11} />
            {slot.windMaxKmh} km/s
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {agriBadge && (
            <span
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${agriBadge.className}`}
            >
              <SproutIcon size={10} />
              <span>{agriBadge.label}</span>
            </span>
          )}

          {marineBadge && (
            <span
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${marineBadge.className}`}
            >
              <AnchorIcon size={10} />
              <span>{marineBadge.label}</span>
            </span>
          )}
        </div>
      </div>
    </button>
  );
};
