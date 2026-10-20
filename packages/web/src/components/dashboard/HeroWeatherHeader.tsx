import React, { useState } from 'react';
import {
  SunIcon,
  CloudSunIcon,
  CloudIcon,
  RainIcon,
  CloudLightningIcon,
  WindIcon,
  DropletsIcon,
  EyeIcon,
  ShareIcon,
  CheckIcon,
  RefreshIcon,
  MapPinIcon,
} from '../icons/SvgIcons';

export interface HeroWeatherHeaderProps {
  locationName: string;
  updatedAt?: string;
  temp: number;
  conditionText: string;
  apparentTemp: number;
  high: number;
  low: number;
  windSpeedKmh: number;
  humidityPct: number;
  visibilityKm: number;
  onShare?: () => void;
  onOpenLocationModal?: () => void;
}

export const HeroWeatherHeader: React.FC<HeroWeatherHeaderProps> = ({
  locationName,
  updatedAt,
  temp,
  conditionText,
  apparentTemp,
  high,
  low,
  windSpeedKmh,
  humidityPct,
  visibilityKm,
  onShare,
  onOpenLocationModal,
}) => {
  const [copied, setCopied] = useState(false);

  const formatUpdatedTime = (isoString?: string): string => {
    if (!isoString) return 'Az önce güncellendi';
    try {
      const updateDate = new Date(isoString);
      const now = new Date();
      const diffMinutes = Math.max(1, Math.floor((now.getTime() - updateDate.getTime()) / (1000 * 60)));
      if (diffMinutes < 60) {
        return `${diffMinutes} dk önce güncellendi`;
      }
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} saat önce güncellendi`;
    } catch {
      return '12 dk önce güncellendi';
    }
  };

  const handleShareClick = async () => {
    if (onShare) {
      onShare();
      return;
    }

    const shareData = {
      title: 'GÖKKALKAN Meteoroloji ve Risk Radarı',
      text: `${locationName}: ${temp}°C, ${conditionText}. Hissedilen ${apparentTemp}°C.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Kullanıcı iptal etti
      }
    } else {
      try {
        await navigator.clipboard.writeText(
          `${locationName} · ${temp}°C ${conditionText} · ${window.location.href}`
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Pano erişilemedi
      }
    }
  };

  const renderWeatherIcon = () => {
    const text = conditionText.toLowerCase();
    if (text.includes('şimşek') || text.includes('yıldırım') || text.includes('fırtına')) {
      return <CloudLightningIcon size={52} className="text-amber-500 dark:text-amber-400" />;
    }
    if (text.includes('yağmur') || text.includes('sağanak')) {
      return <RainIcon size={52} className="text-sky-500 dark:text-sky-400" />;
    }
    if (text.includes('parçalı') || text.includes('az bulutlu')) {
      return <CloudSunIcon size={52} className="text-amber-500 dark:text-amber-400" />;
    }
    if (text.includes('bulut') || text.includes('kapalı') || text.includes('sis')) {
      return <CloudIcon size={52} className="text-slate-400 dark:text-slate-300" />;
    }
    return <SunIcon size={52} className="text-amber-500 dark:text-amber-400" />;
  };

  return (
    <div className="px-4 pt-1 animate-view-fade">
      {/* Hero Sıcaklık ve Durum */}
      <div className="text-center py-1">
        {/* Güncelleme Hapı */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-2">
          <RefreshIcon size={11} className="text-emerald-600 dark:text-emerald-400" />
          <span>{formatUpdatedTime(updatedAt)}</span>
        </div>

        {/* Hava Durumu İkonu */}
        <div className="flex items-center justify-center mb-1">
          {renderWeatherIcon()}
        </div>

        {/* Büyük Tipografik Sıcaklık */}
        <div className="flex items-start justify-center gap-0.5 my-1">
          <span className="text-[76px] leading-[0.9] font-extralight tracking-tighter text-slate-900 dark:text-white">
            {Math.round(temp)}
          </span>
          <span className="text-3xl font-light text-slate-400 dark:text-slate-500 mt-1">°</span>
        </div>

        {/* Durum Metni */}
        <div className="text-xl font-medium text-slate-800 dark:text-slate-100 mb-1">
          {conditionText}
        </div>

        {/* İstatiksel Özet Satırı */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Hissedilen {Math.round(apparentTemp)}°</span>
          <span>·</span>
          <span>Y: {Math.round(high)}°</span>
          <span>·</span>
          <span>D: {Math.round(low)}°</span>
        </div>
      </div>

      {/* Mini Rozetler Grid: Rüzgar, Nem, Görüş */}
      <div className="grid grid-cols-3 gap-2.5 mt-3">
        {/* Rüzgâr Rozeti */}
        <div className="liquid-glass rounded-2xl p-2.5 flex flex-col items-center text-center">
          <WindIcon size={18} className="text-sky-500 dark:text-sky-400 mb-1" />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
            {Math.round(windSpeedKmh)} km/sa
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Rüzgâr
          </span>
        </div>

        {/* Bağıl Nem Rozeti */}
        <div className="liquid-glass rounded-2xl p-2.5 flex flex-col items-center text-center">
          <DropletsIcon size={18} className="text-blue-500 dark:text-blue-400 mb-1" />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
            %{Math.round(humidityPct)}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Bağıl Nem
          </span>
        </div>

        {/* Görüş Mesafesi Rozeti */}
        <div className="liquid-glass rounded-2xl p-2.5 flex flex-col items-center text-center">
          <EyeIcon size={18} className="text-slate-500 dark:text-slate-300 mb-1" />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
            {Math.round(visibilityKm)} km
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Görüş
          </span>
        </div>
      </div>
    </div>
  );
};
