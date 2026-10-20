import React from 'react';
import type { DashboardResponse } from '@gokkalkan/shared';
import type { SentinelRule } from '../../services/alertsStorage';
import {
  ShieldCheckIcon,
  AlertTriangleIcon,
  BellIcon,
} from '../icons/SvgIcons';

interface ActiveSentinelStatusCardProps {
  rules: SentinelRule[];
  dashboardData?: DashboardResponse;
}

export const ActiveSentinelStatusCard: React.FC<ActiveSentinelStatusCardProps> = ({
  rules,
  dashboardData,
}) => {
  const activeRulesCount = rules.filter((r) => r.enabled).length;

  // Gerçek veriyle kural aşımı denetimi
  let activeAlertTriggered = false;
  let activeAlertTitle = '';

  if (dashboardData) {
    const frostRule = rules.find((r) => r.id === 'frost');
    if (frostRule?.enabled && dashboardData.current.low <= frostRule.thresholdValue) {
      activeAlertTriggered = true;
      activeAlertTitle = `Zirai Don Riski (Gece En Düşük ${dashboardData.current.low}°C)`;
    }

    const seismicRule = rules.find((r) => r.id === 'seismic');
    if (
      seismicRule?.enabled &&
      dashboardData.earthquake &&
      dashboardData.earthquake.magnitude >= seismicRule.thresholdValue &&
      dashboardData.earthquake.distanceKm <= 150
    ) {
      activeAlertTriggered = true;
      activeAlertTitle = `Sismik Alarm: M ${dashboardData.earthquake.magnitude.toFixed(1)} (${dashboardData.earthquake.region})`;
    }

    const marineRule = rules.find((r) => r.id === 'marine');
    if (
      marineRule?.enabled &&
      dashboardData.marine.isAvailable &&
      dashboardData.marine.windGustKnots >= marineRule.thresholdValue
    ) {
      activeAlertTriggered = true;
      activeAlertTitle = `Deniz Fırtınası: ${dashboardData.marine.windGustKnots} knot hamle`;
    }
  }

  return (
    <div
      className={`liquid-glass rounded-card p-4 border transition-all duration-300 ${
        activeAlertTriggered
          ? 'border-rose-500/50 bg-rose-500/[0.08]'
          : 'border-emerald-500/40 bg-emerald-500/[0.05]'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {activeAlertTriggered ? (
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangleIcon size={18} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheckIcon size={18} />
            </div>
          )}
          <div>
            <h2 className="text-xs font-bold tracking-wider uppercase text-slate-800 dark:text-slate-100">
              GÖKKALKAN Nöbet Kalkanı
            </h2>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {activeRulesCount} / {rules.length} kural devrede
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/70 dark:bg-slate-800/80 shadow-sm">
          <BellIcon size={12} className={activeAlertTriggered ? 'text-rose-500' : 'text-emerald-500'} />
          <span className={activeAlertTriggered ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
            {activeAlertTriggered ? 'Alarm Aktif' : 'Nöbette'}
          </span>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300">
        {activeAlertTriggered ? (
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
            <span>Kritik Eşik Aşımı: {activeAlertTitle}</span>
          </div>
        ) : (
          <p className="text-[11px] leading-relaxed">
            Tanımladığınız meteorolojik ve sismik kriterler 7/24 arka planda taranmakta, eşik aşımında anında siren ve titreşim uyarısı gönderilmektedir.
          </p>
        )}
      </div>
    </div>
  );
};
