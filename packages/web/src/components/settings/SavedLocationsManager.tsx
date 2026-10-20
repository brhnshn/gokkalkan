import React from 'react';
import type { SavedLocation } from '../../services/settingsStorage';
import {
  MapPinIcon,
  CheckIcon,
  StarIcon,
  TrashIcon,
  PlusIcon,
  SearchIcon,
} from '../icons/SvgIcons';

interface SavedLocationsManagerProps {
  locations: SavedLocation[];
  currentLocationName: string;
  onSelectLocation: (name: string, lat: number, lon: number) => void;
  onSetDefault: (id: string) => void;
  onRemoveLocation: (id: string) => void;
  onOpenSearchModal: () => void;
}

export const SavedLocationsManager: React.FC<SavedLocationsManagerProps> = ({
  locations,
  currentLocationName,
  onSelectLocation,
  onSetDefault,
  onRemoveLocation,
  onOpenSearchModal,
}) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <MapPinIcon size={13} />
          <span>Kayıtlı İstasyonlar & Konumlar</span>
        </h3>
        <button
          type="button"
          onClick={onOpenSearchModal}
          className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors tactile-active"
        >
          <PlusIcon size={12} />
          <span>Yeni Konum Ekle</span>
        </button>
      </div>

      <div className="space-y-2">
        {locations.map((loc) => {
          const isSelected = currentLocationName.includes(loc.name.split(' ')[0]);

          return (
            <div
              key={loc.id}
              className={`liquid-glass rounded-card p-3 flex items-center justify-between gap-2.5 transition-all duration-200 border ${
                isSelected
                  ? 'border-emerald-500/50 bg-emerald-500/[0.06]'
                  : 'border-slate-300/40 dark:border-white/10'
              }`}
            >
              {/* Konum Seçme Alanı */}
              <button
                type="button"
                onClick={() => onSelectLocation(loc.name, loc.lat, loc.lon)}
                className="flex items-center gap-3 text-left flex-1 min-w-0 tactile-active"
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <MapPinIcon size={16} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {loc.name}
                    </span>
                    {loc.isDefault && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold">
                        Varsayılan
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {loc.desc} · {loc.lat.toFixed(2)}°K, {loc.lon.toFixed(2)}°D
                  </div>
                </div>
              </button>

              {/* Aksiyon Butonları (Varsayılan Yap / Sil) */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onSetDefault(loc.id)}
                  title={loc.isDefault ? 'Varsayılan İstasyon' : 'Varsayılan Yap'}
                  className={`p-1.5 rounded-lg transition-colors tactile-active ${
                    loc.isDefault
                      ? 'text-amber-500 bg-amber-500/10'
                      : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <StarIcon size={14} />
                </button>

                {locations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveLocation(loc.id)}
                    title="Konumu Sil"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors tactile-active"
                  >
                    <TrashIcon size={14} />
                  </button>
                )}

                {isSelected && (
                  <div className="p-1 text-emerald-600 dark:text-emerald-400">
                    <CheckIcon size={15} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
