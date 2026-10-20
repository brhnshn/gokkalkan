import React, { useState } from 'react';
import type { DashboardResponse, HourlyRiskSlot } from '@gokkalkan/shared';
import { HeroWeatherHeader } from '../components/dashboard/HeroWeatherHeader';
import { SentinelBanner } from '../components/dashboard/SentinelBanner';
import { InteractiveRiskTimeline } from '../components/dashboard/InteractiveRiskTimeline';
import { RiskArcGauges } from '../components/dashboard/RiskArcGauges';
import { ActivityBentoCards } from '../components/dashboard/ActivityBentoCards';
import { DetailBottomSheet } from '../components/dashboard/DetailBottomSheet';
import {
  AgriDrawerContent,
  MarineDrawerContent,
  EarthquakeDrawerContent,
} from '../components/dashboard/DrawersContent';
import { AlertTriangleIcon, RefreshIcon } from '../components/icons/SvgIcons';

export interface TodayViewProps {
  data: DashboardResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  onRefresh: () => void;
  onNavigateTab?: (tab: 'week' | 'map' | 'alerts' | 'settings') => void;
  onOpenLocationModal?: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  data,
  isLoading,
  isError,
  onRefresh,
  onNavigateTab,
  onOpenLocationModal,
}) => {
  // Canlı 24 Saatlik Scrubber için seçili indeks (varsayılan: 0 - Şimdi)
  const [selectedHourIndex, setSelectedHourIndex] = useState<number>(0);

  // Aktif açılan alt çekmece: 'agri' | 'marine' | 'earthquake' | null
  const [activeDrawer, setActiveDrawer] = useState<'agri' | 'marine' | 'earthquake' | null>(null);

  // 1. Ağ hatası ve yerel önbellek boş ise hata ekranı
  if (isError && !data) {
    return (
      <div className="liquid-glass rounded-card p-6 mx-4 my-8 text-center border border-amber-500/30">
        <AlertTriangleIcon size={36} className="text-amber-500 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">
          Meteoroloji Verisi Alınamadı
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Ağ bağlantısı kurulamadı ve yerel önbellekte kayıtlı istasyon verisi bulunamadı.
        </p>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all tactile-active"
        >
          <RefreshIcon size={14} />
          Tekrar Dene
        </button>
      </div>
    );
  }

  // 2. Yüklenme durumu (Sakin Liquid Glass İskelet Görünümü)
  if (isLoading && !data) {
    return (
      <div className="space-y-4 pb-28 pt-1 animate-pulse px-4">
        {/* Hero İskeleti */}
        <div className="flex justify-between items-center mb-2">
          <div className="h-7 w-36 rounded-full bg-slate-200/60 dark:bg-slate-800/60" />
          <div className="h-8 w-8 rounded-full bg-slate-200/60 dark:bg-slate-800/60" />
        </div>
        <div className="flex flex-col items-center py-4">
          <div className="h-5 w-28 rounded-full bg-slate-200/60 dark:bg-slate-800/60 mb-3" />
          <div className="h-12 w-12 rounded-full bg-slate-200/60 dark:bg-slate-800/60 mb-2" />
          <div className="h-16 w-28 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 mb-2" />
          <div className="h-5 w-32 rounded-full bg-slate-200/60 dark:bg-slate-800/60" />
        </div>
        {/* Rozetler */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="h-20 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
          <div className="h-20 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
          <div className="h-20 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
        </div>
        {/* Banner */}
        <div className="h-32 rounded-card bg-slate-200/60 dark:bg-slate-800/60" />
        {/* Scrubber */}
        <div className="h-28 rounded-card bg-slate-200/60 dark:bg-slate-800/60" />
        {/* Kadranlar */}
        <div className="grid grid-cols-2 gap-3">
          <div className="h-28 rounded-card bg-slate-200/60 dark:bg-slate-800/60" />
          <div className="h-28 rounded-card bg-slate-200/60 dark:bg-slate-800/60" />
        </div>
      </div>
    );
  }

  // 3. Gerçek Veri Ayrıştırması & Scrubber Reaktivitesi
  const current = data?.current;
  const location = data?.location;
  const sentinel = data?.sentinel;
  const hourly24 = data?.hourly24 || [];
  const earthquake = data?.earthquake;
  const agriculture = data?.agriculture;
  const marine = data?.marine;

  // Seçili saat dilimi (scrubber üzerinden kaydırıldıkça değişir)
  const activeSlot: HourlyRiskSlot | undefined = hourly24[selectedHourIndex] || hourly24[0];

  // Reaktif gösterilen sıcaklık ve durum (seçili saat varsa o saati, yoksa anlık hava durumunu gösterir)
  const displayTemp = activeSlot ? activeSlot.temp : (current?.temp ?? 12);
  const displayCondition = activeSlot ? activeSlot.conditionText : (current?.conditionText ?? 'Az bulutlu');
  const displayGauges = activeSlot?.gauges || {
    precipitationPct: 0,
    windKmh: current?.windSpeedKmh ?? 10,
    hailLightningPct: 0,
    fireRiskIndex: 25,
  };

  const handleShare = async () => {
    const locName = location?.name || 'Çanakkale';
    const text = `GÖKKALKAN Radar: ${locName} ${Math.round(displayTemp)}°C, ${displayCondition}. Risk durumu: ${sentinel?.headline || 'Sakin'}.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GÖKKALKAN Radar',
          text,
          url: window.location.href,
        });
      } catch {
        // Kullanıcı iptal etti
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${text} ${window.location.href}`);
      } catch {
        // Pano erişilemedi
      }
    }
  };

  return (
    <div className="space-y-4 pb-28 pt-1">
      {/* 1. Hero Weather Bölümü (Büyük Tipografi, Konum Başlığı, Rozetler) */}
      <HeroWeatherHeader
        locationName={location?.name || 'Barbaros, Çanakkale'}
        updatedAt={location?.updatedAt}
        temp={displayTemp}
        conditionText={displayCondition}
        apparentTemp={current?.apparentTemp ?? displayTemp + 1}
        high={current?.high ?? 22}
        low={current?.low ?? 10}
        windSpeedKmh={current?.windSpeedKmh ?? 2}
        humidityPct={current?.humidityPct ?? 96}
        visibilityKm={current?.visibilityKm ?? 15}
        onShare={handleShare}
        onOpenLocationModal={onOpenLocationModal}
      />

      {/* 2. GÖKKALKAN NÖBETTE Banner'ı (Zümrüt/Kehribar, 3 Hızlı Buton) */}
      <SentinelBanner
        verdict={sentinel}
        sunsetTime={current?.sunsetTime}
        onNavigateTab={onNavigateTab}
        onShare={handleShare}
      />

      {/* 3. 24 Saatlik Canlı Risk Şeridi (Interactive Scrubber) */}
      <InteractiveRiskTimeline
        hourly24={hourly24}
        selectedIndex={selectedHourIndex}
        onSelectIndex={(index) => setSelectedHourIndex(index)}
      />

      {/* 4. 4'lü SVG Yay Kadranları (Scrubber değiştikçe reaktif kayar) */}
      <RiskArcGauges gauges={displayGauges} />

      {/* 5. Alt Bento Kartları (Son Deprem Radar Halkaları, Tarlam ve Denizde) */}
      <ActivityBentoCards
        earthquake={earthquake}
        agriculture={agriculture}
        marine={marine}
        onOpenAgriDetails={() => setActiveDrawer('agri')}
        onOpenMarineDetails={() => setActiveDrawer('marine')}
        onOpenEarthquakeDetails={() => setActiveDrawer('earthquake')}
      />

      {/* 6. iOS Liquid Glass Detay Alt Çekmecesi (Bottom Sheet) */}
      <DetailBottomSheet
        isOpen={activeDrawer !== null}
        title={
          activeDrawer === 'agri'
            ? 'Tarlam (Zirai İzleme)'
            : activeDrawer === 'marine'
            ? 'Denizde (Seyir ve Dalga)'
            : 'Deprem Erken Uyarı Sistemi'
        }
        onClose={() => setActiveDrawer(null)}
      >
        {activeDrawer === 'agri' && <AgriDrawerContent agriculture={agriculture} />}
        {activeDrawer === 'marine' && <MarineDrawerContent marine={marine} />}
        {activeDrawer === 'earthquake' && (
          <EarthquakeDrawerContent
            earthquake={earthquake}
            onSave={() => setActiveDrawer(null)}
          />
        )}
      </DetailBottomSheet>
    </div>
  );
};
