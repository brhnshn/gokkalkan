import React from 'react';
import type { AlertHistoryItem } from '../../services/alertsStorage';
import {
  ClockIcon,
  SproutIcon,
  ActivityIcon,
  AnchorIcon,
  FlameIcon,
  MapPinIcon,
  ShieldCheckIcon,
  IconProps,
} from '../icons/SvgIcons';

interface AlertHistoryTimelineProps {
  history: AlertHistoryItem[];
}

export const AlertHistoryTimeline: React.FC<AlertHistoryTimelineProps> = ({
  history,
}) => {
  const getCategoryIcon = (category: AlertHistoryItem['category']): React.FC<IconProps> => {
    switch (category) {
      case 'frost':
        return SproutIcon;
      case 'seismic':
        return ActivityIcon;
      case 'marine':
        return AnchorIcon;
      case 'fire':
        return FlameIcon;
      default:
        return ActivityIcon;
    }
  };

  const getSeverityBadge = (severity: AlertHistoryItem['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          label: 'Kritik Alarm',
          className: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30',
        };
      case 'warning':
        return {
          label: 'Dikkat / İkaz',
          className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
        };
      case 'info':
        return {
          label: 'Bilgilendirme',
          className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30',
        };
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <ClockIcon size={13} />
          <span>Bölgesel Uyarı Kayıtları</span>
        </h3>
        <span className="text-[10px] text-slate-400">{history.length} aktif kayıt</span>
      </div>

      {history.length === 0 ? (
        <div className="liquid-glass rounded-card p-4 text-center space-y-1.5 border border-emerald-500/20">
          <ShieldCheckIcon size={24} className="text-emerald-500 mx-auto" />
          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
            Aktif Tehlike veya Alarm Yok
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Seçili bölgede şu an kritik bir zirai don, şiddetli fırtına veya yakın sismik risk tespit edilmedi. Gökkalkan nöbette.
          </p>
        </div>
      ) : (
        <div className="relative pl-4 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700/60">
        {history.map((item) => {
          const Icon = getCategoryIcon(item.category);
          const badge = getSeverityBadge(item.severity);

          return (
            <div key={item.id} className="relative group">
              {/* Zaman Çizelgesi Düğüm Noktası */}
              <div className="absolute -left-[17px] top-3 w-3 h-3 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-400 dark:border-slate-500 group-hover:border-blue-500 transition-colors" />

              <div className="liquid-glass rounded-card p-3 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Icon size={14} className="text-slate-600 dark:text-slate-300" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                      {item.title}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/40 dark:border-white/5 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <MapPinIcon size={11} />
                    <span>{item.locationName}</span>
                  </div>
                  <span>{item.timeAgoLabel}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
