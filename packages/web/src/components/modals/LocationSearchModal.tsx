import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { LocationSearchResult } from '@gokkalkan/shared';
import { searchLocations } from '../../api/client';
import {
  SearchIcon,
  XIcon,
  MapPinIcon,
  ChevronRightIcon,
} from '../icons/SvgIcons';

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (name: string, lat: number, lon: number) => void;
}

const REGIONAL_PRESETS = [
  { name: 'İstanbul', admin1: 'Marmara', lat: 41.0082, lon: 28.9784 },
  { name: 'Ankara', admin1: 'İç Anadolu', lat: 39.9334, lon: 32.8597 },
  { name: 'İzmir', admin1: 'Ege', lat: 38.4237, lon: 27.1428 },
  { name: 'Bursa', admin1: 'Marmara', lat: 40.1885, lon: 29.0610 },
  { name: 'Antalya', admin1: 'Akdeniz', lat: 36.8969, lon: 30.7133 },
  { name: 'Adana', admin1: 'Çukurova', lat: 37.0000, lon: 35.3213 },
  { name: 'Trabzon', admin1: 'Karadeniz', lat: 41.0027, lon: 39.7168 },
  { name: 'Çanakkale', admin1: 'Boğaz Hattı', lat: 40.1553, lon: 26.4142 },
  { name: 'Gaziantep', admin1: 'Güneydoğu', lat: 37.0662, lon: 37.3833 },
  { name: 'Diyarbakır', admin1: 'Güneydoğu', lat: 37.9144, lon: 40.2306 },
];

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      alert('Cihazınızda GPS desteği bulunamadı.');
      return;
    }
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGpsLoading(false);
        const { latitude, longitude } = pos.coords;
        onSelectLocation('Konumum Alınıyor...', Number(latitude.toFixed(4)), Number(longitude.toFixed(4)));
        onClose();
      },
      (err) => {
        setIsGpsLoading(false);
        alert('GPS konumu alınamadı: ' + err.message);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await searchLocations(query);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-backdrop"
    >
      <div
        className="w-full max-w-[420px] max-h-[85vh] rounded-t-[32px] sm:rounded-card liquid-glass flex flex-col overflow-hidden shadow-2xl border border-white/60 dark:border-white/10 animate-sheet-up sm:animate-modal-pop"
        role="dialog"
        aria-modal="true"
      >
        {/* Üst Başlık & Kapat */}
        <div className="p-4 border-b border-slate-200/50 dark:border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <MapPinIcon size={16} className="text-emerald-500" />
            Konum Seç / Ara
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* GPS Otomatik Konum Butonu */}
        <div className="px-3 pt-3">
          <button
            type="button"
            onClick={handleUseGps}
            disabled={isGpsLoading}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition-all active:scale-[0.98]"
          >
            <MapPinIcon size={14} className={isGpsLoading ? 'animate-bounce' : ''} />
            <span>{isGpsLoading ? 'GPS Uydularına Bağlanılıyor...' : 'Mevcut Konumumu Kullan (GPS)'}</span>
          </button>
        </div>

        {/* Arama Girdisi */}
        <div className="p-3">
          <div className="relative flex items-center">
            <SearchIcon size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="İlçe, köy veya mevki adı yazın..."
              className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 text-slate-400 hover:text-slate-600"
              >
                <XIcon size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Arama Sonuçları veya Hazır İstasyonlar */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 max-h-[50vh] no-scrollbar">
          {isSearching && (
            <div className="py-6 text-center text-xs text-slate-500">
              Konumlar taranıyor...
            </div>
          )}

          {!isSearching && query.length >= 2 && results.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-500">
              &quot;{query}&quot; için sonuç bulunamadı.
            </div>
          )}

          {results.length > 0 &&
            results.map((r) => (
              <button
                key={`${r.name}-${r.lat}-${r.lon}`}
                type="button"
                onClick={() => {
                  onSelectLocation(r.name, r.lat, r.lon);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-2xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 flex items-center justify-between transition-colors tactile-active"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                    {r.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {r.admin1 || r.country} · {r.lat.toFixed(2)}°K, {r.lon.toFixed(2)}°D
                  </div>
                </div>
                <ChevronRightIcon size={14} className="text-slate-400" />
              </button>
            ))}

          {query.length < 2 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase px-2 py-1 tracking-wider">
                Bölgesel İstasyonlar
              </div>
              {REGIONAL_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    onSelectLocation(preset.name, preset.lat, preset.lon);
                    onClose();
                  }}
                  className="w-full text-left p-2.5 rounded-2xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 flex items-center justify-between transition-colors tactile-active"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPinIcon size={14} className="text-emerald-500" />
                    <div>
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-100">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {preset.admin1} · {preset.lat.toFixed(2)}°K, {preset.lon.toFixed(2)}°D
                      </div>
                    </div>
                  </div>
                  <ChevronRightIcon size={14} className="text-slate-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
