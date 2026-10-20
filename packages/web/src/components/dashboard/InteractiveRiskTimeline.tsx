import React, { useRef, useState, useEffect } from 'react';
import type { HourlyRiskSlot } from '@gokkalkan/shared';
import { ActivityIcon } from '../icons/SvgIcons';

export interface InteractiveRiskTimelineProps {
  hourly24: HourlyRiskSlot[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
}

export const InteractiveRiskTimeline: React.FC<InteractiveRiskTimelineProps> = ({
  hourly24,
  selectedIndex,
  onSelectIndex,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Veri boşsa fallback 24 saatlik slot listesi
  const slots: HourlyRiskSlot[] = hourly24 && hourly24.length > 0 ? hourly24 : [];

  const currentSlot = slots[selectedIndex] || slots[0];

  // Pointer scrubber takibi: koordinattan en yakın indeksi bul
  const handlePointerAt = (clientX: number, clientY: number) => {
    const el = document.elementFromPoint(clientX, clientY);
    const hourItem = el?.closest('[data-hour-index]');
    if (hourItem) {
      const idxStr = hourItem.getAttribute('data-hour-index');
      if (idxStr !== null) {
        const idx = parseInt(idxStr, 10);
        if (!isNaN(idx) && idx >= 0 && idx < slots.length && idx !== selectedIndex) {
          onSelectIndex(idx);
        }
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    handlePointerAt(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging || e.buttons === 1) {
      handlePointerAt(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Seçili eleman container içinde görünür alanda olsun
  useEffect(() => {
    if (!containerRef.current) return;
    const activeEl = containerRef.current.querySelector(`[data-hour-index="${selectedIndex}"]`) as HTMLElement;
    if (activeEl) {
      const container = containerRef.current;
      const elLeft = activeEl.offsetLeft;
      const elWidth = activeEl.clientWidth;
      const scrollLeft = container.scrollLeft;
      const viewWidth = container.clientWidth;

      if (elLeft < scrollLeft + 40 || elLeft + elWidth > scrollLeft + viewWidth - 40) {
        container.scrollTo({
          left: elLeft - viewWidth / 2 + elWidth / 2,
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex]);

  // Risk rengi ve bar dolgu oranı hesaplayıcı
  const getBarConfig = (slot: HourlyRiskSlot) => {
    let barColor = 'bg-emerald-500';
    let baseHeightPct = 32;

    if (slot.riskLevel === 'HIGH') {
      barColor = 'bg-rose-500 dark:bg-rose-400';
      baseHeightPct = 85;
    } else if (slot.riskLevel === 'MEDIUM') {
      barColor = 'bg-amber-500 dark:bg-amber-400';
      baseHeightPct = 60;
    } else {
      // Hafif varyasyon için yağış ve rüzgâr etkisi
      const extra = Math.min(30, (slot.gauges?.precipitationPct || 0) * 0.2 + (slot.gauges?.windKmh || 0) * 0.3);
      baseHeightPct = Math.min(55, 25 + extra);
    }

    return { barColor, heightPct: baseHeightPct };
  };

  return (
    <div className="px-4">
      {/* Scrubber Üst Bilgi Başlığı ve Durum Hapı */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <ActivityIcon size={14} className="text-emerald-500" />
          <span>24 Saatlik Risk Şeridi</span>
        </div>

        {/* Reaktif Durum Hapı: "Şimdi · 13° · Az Bulutlu" */}
        <div className="px-3 py-1 rounded-full liquid-glass border border-sky-500/30 text-xs font-semibold text-sky-600 dark:text-sky-400 shadow-sm flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          <span>
            {currentSlot
              ? `${currentSlot.hourLabel} · ${Math.round(currentSlot.temp)}° · ${currentSlot.conditionText}`
              : 'Şimdi · 13° · Açık'}
          </span>
        </div>
      </div>

      {/* Sürüklenebilir 24 Saatlik Scrubber Alanı */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="liquid-glass rounded-card p-4 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none touch-pan-x relative"
        title="Saatler arasında kaydırın veya tıklayın"
      >
        <div className="flex items-end gap-3 min-w-max h-24 pb-6 relative">
          {slots.map((slot, index) => {
            const isSelected = index === selectedIndex;
            const { barColor, heightPct } = getBarConfig(slot);

            return (
              <div
                key={slot.timeIso || index}
                data-hour-index={index}
                onClick={() => onSelectIndex(index)}
                onMouseEnter={() => {
                  // Masaüstünde gezinirken anında güncelle
                  if (index !== selectedIndex) {
                    onSelectIndex(index);
                  }
                }}
                className={`flex flex-col items-center gap-1.5 w-7 cursor-pointer relative transition-transform duration-150 ${
                  isSelected ? '-translate-y-1' : 'hover:-translate-y-0.5'
                }`}
              >
                {/* Dikey İmleç / Seçim İndikatörü */}
                {isSelected && (
                  <div className="absolute -top-3 w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
                )}

                {/* Sıcaklık Mini Göstergesi (Seçili ise vurgulu) */}
                <span
                  className={`text-[10px] font-mono leading-none ${
                    isSelected
                      ? 'font-bold text-sky-600 dark:text-sky-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {Math.round(slot.temp)}°
                </span>

                {/* Risk Çubuğu */}
                <div
                  className={`w-2 h-12 rounded-full relative overflow-hidden transition-all duration-200 ${
                    isSelected
                      ? 'ring-2 ring-sky-500 dark:ring-sky-400 bg-sky-500/20'
                      : 'bg-slate-200 dark:bg-slate-700/60'
                  }`}
                >
                  <div
                    className={`absolute bottom-0 left-0 right-0 rounded-full transition-all duration-300 ${barColor}`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>

                {/* Saat Etiketi ("Şimdi", "03:00", "06:00" vb.) */}
                <span
                  className={`text-[10px] whitespace-nowrap absolute -bottom-5 transition-colors ${
                    isSelected
                      ? 'font-bold text-slate-900 dark:text-white'
                      : 'font-medium text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {slot.hourLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
