import React from 'react';
import type { UnitPreferences } from '../../services/settingsStorage';
import { SlidersIcon, ThermometerIcon, WindIcon } from '../icons/SvgIcons';

interface UnitPreferencesCardProps {
  units: UnitPreferences;
  onChangeUnits: (newUnits: UnitPreferences) => void;
}

export const UnitPreferencesCard: React.FC<UnitPreferencesCardProps> = ({
  units,
  onChangeUnits,
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 flex items-center gap-1.5">
        <SlidersIcon size={13} />
        <span>Ölçüm Birimleri Tercihi</span>
      </h3>

      <div className="liquid-glass rounded-card p-3.5 space-y-3 border border-slate-300/40 dark:border-white/10">
        {/* Sıcaklık Birimi */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ThermometerIcon size={15} className="text-slate-400" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Sıcaklık Birimi
            </span>
          </div>

          <div className="flex p-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onChangeUnits({ ...units, tempUnit: 'C' })}
              className={`px-3 py-1 rounded-full transition-all tactile-active ${
                units.tempUnit === 'C'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              °C
            </button>
            <button
              type="button"
              onClick={() => onChangeUnits({ ...units, tempUnit: 'F' })}
              className={`px-3 py-1 rounded-full transition-all tactile-active ${
                units.tempUnit === 'F'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              °F
            </button>
          </div>
        </div>

        {/* Rüzgâr Hızı Birimi */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-white/5">
          <div className="flex items-center gap-2">
            <WindIcon size={15} className="text-slate-400" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Rüzgâr Hızı
            </span>
          </div>

          <div className="flex p-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onChangeUnits({ ...units, windUnit: 'kmh' })}
              className={`px-2.5 py-1 rounded-full transition-all tactile-active ${
                units.windUnit === 'kmh'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              km/s
            </button>
            <button
              type="button"
              onClick={() => onChangeUnits({ ...units, windUnit: 'knot' })}
              className={`px-2.5 py-1 rounded-full transition-all tactile-active ${
                units.windUnit === 'knot'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              knot
            </button>
            <button
              type="button"
              onClick={() => onChangeUnits({ ...units, windUnit: 'ms' })}
              className={`px-2.5 py-1 rounded-full transition-all tactile-active ${
                units.windUnit === 'ms'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              m/s
            </button>
          </div>
        </div>

        {/* Basınç Birimi */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-400">BARO</span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Atmosfer Basıncı
            </span>
          </div>

          <div className="flex p-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onChangeUnits({ ...units, pressureUnit: 'hPa' })}
              className={`px-3 py-1 rounded-full transition-all tactile-active ${
                units.pressureUnit === 'hPa'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              hPa
            </button>
            <button
              type="button"
              onClick={() => onChangeUnits({ ...units, pressureUnit: 'mmHg' })}
              className={`px-3 py-1 rounded-full transition-all tactile-active ${
                units.pressureUnit === 'mmHg'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              mmHg
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
