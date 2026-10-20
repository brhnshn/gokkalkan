import React, { useState } from 'react';
import type { DailyForecastSlot } from '@gokkalkan/shared';
import { DayForecastCard } from '../components/week/DayForecastCard';
import { DayDetailDrawer } from '../components/week/DayDetailDrawer';
import { CalendarIcon, InfoIcon } from '../components/icons/SvgIcons';

interface WeekViewProps {
  daily7?: DailyForecastSlot[];
  currentTemp?: number;
}

export const WeekView: React.FC<WeekViewProps> = ({ daily7, currentTemp }) => {
  const [selectedSlot, setSelectedSlot] = useState<DailyForecastSlot | null>(null);

  // Veri yoksa standart varsayılan 7 gün listesi
  const slots: DailyForecastSlot[] =
    daily7 && daily7.length > 0
      ? daily7
      : [
          { dateIso: '2026-10-20', dayName: 'Bugün', conditionCode: 1, conditionText: 'Açık & Güneşli', tempMin: 14, tempMax: 22, precipitationProbPct: 5, windMaxKmh: 14 },
          { dateIso: '2026-10-21', dayName: 'Çarşamba', conditionCode: 2, conditionText: 'Parçalı Bulutlu', tempMin: 13, tempMax: 21, precipitationProbPct: 15, windMaxKmh: 18 },
          { dateIso: '2026-10-22', dayName: 'Perşembe', conditionCode: 3, conditionText: 'Çok Bulutlu', tempMin: 12, tempMax: 19, precipitationProbPct: 35, windMaxKmh: 24 },
          { dateIso: '2026-10-23', dayName: 'Cuma', conditionCode: 61, conditionText: 'Hafif Yağmurlu', tempMin: 11, tempMax: 17, precipitationProbPct: 70, windMaxKmh: 32 },
          { dateIso: '2026-10-24', dayName: 'Cumartesi', conditionCode: 2, conditionText: 'Parçalı Bulutlu', tempMin: 10, tempMax: 18, precipitationProbPct: 20, windMaxKmh: 19 },
          { dateIso: '2026-10-25', dayName: 'Pazar', conditionCode: 1, conditionText: 'Güneşli', tempMin: 11, tempMax: 20, precipitationProbPct: 10, windMaxKmh: 12 },
          { dateIso: '2026-10-26', dayName: 'Pazartesi', conditionCode: 1, conditionText: 'Açık', tempMin: 12, tempMax: 21, precipitationProbPct: 5, windMaxKmh: 15 },
        ];

  // Haftalık En Düşük ve En Yüksek Sıcaklık (Apple Weather ölçeklemesi)
  const weekMin = Math.min(...slots.map((s) => s.tempMin));
  const weekMax = Math.max(...slots.map((s) => s.tempMax));

  return (
    <div className="space-y-3 px-4 pb-28 pt-2">
      {/* Başlık ve Model Kaynağı */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <CalendarIcon size={13} />
          <span>7 Günlük Bölgesel Tahmin</span>
        </h2>
        <span className="text-[10px] text-slate-400 font-mono">ECMWF / Open-Meteo</span>
      </div>

      {/* 7 Günlük Kart Listesi */}
      <div className="space-y-2">
        {slots.map((slot, idx) => (
          <DayForecastCard
            key={slot.dateIso}
            slot={slot}
            isToday={idx === 0}
            currentTemp={idx === 0 ? currentTemp : undefined}
            weekMin={weekMin}
            weekMax={weekMax}
            onClick={() => setSelectedSlot(slot)}
          />
        ))}
      </div>

      {/* Model Bilgilendirme Notu */}
      <div className="liquid-glass rounded-card p-3 flex items-start gap-2 text-slate-500 dark:text-slate-400">
        <div className="mt-0.5 text-blue-500 shrink-0">
          <InfoIcon size={14} />
        </div>
        <p className="text-[11px] leading-relaxed">
          Tahminler her 6 saatte bir güncellenen yüksek çözünürlüklü ECMWF IFS ve Open-Meteo modelleriyle üretilmektedir.
          Günün üzerine tıklayarak saatlik detay dökümünü ve tarla/deniz analizini inceleyebilirsiniz.
        </p>
      </div>

      {/* Günlük Detay Çekmecesi */}
      <DayDetailDrawer
        slot={selectedSlot}
        onClose={() => setSelectedSlot(null)}
      />
    </div>
  );
};
