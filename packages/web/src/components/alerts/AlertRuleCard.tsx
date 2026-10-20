import React from 'react';
import type { SentinelRule } from '../../services/alertsStorage';
import {
  SproutIcon,
  ActivityIcon,
  AnchorIcon,
  FlameIcon,
  IconProps,
} from '../icons/SvgIcons';

interface AlertRuleCardProps {
  rule: SentinelRule;
  onToggle: (id: SentinelRule['id']) => void;
  onUpdateThreshold: (id: SentinelRule['id'], delta: number) => void;
}

export const AlertRuleCard: React.FC<AlertRuleCardProps> = ({
  rule,
  onToggle,
  onUpdateThreshold,
}) => {
  const getCategoryIcon = (category: SentinelRule['id']): React.FC<IconProps> => {
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
        return SproutIcon;
    }
  };

  const getThemeColors = (colorType: SentinelRule['colorType']) => {
    switch (colorType) {
      case 'amber':
        return {
          bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
          switchActive: 'bg-amber-500',
          badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
        };
      case 'rose':
        return {
          bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
          switchActive: 'bg-rose-500',
          badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
        };
      case 'sky':
        return {
          bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
          switchActive: 'bg-sky-500',
          badge: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
        };
      case 'orange':
        return {
          bg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
          switchActive: 'bg-orange-500',
          badge: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
        };
    }
  };

  const Icon = getCategoryIcon(rule.id);
  const colors = getThemeColors(rule.colorType);

  return (
    <div
      className={`liquid-glass rounded-card p-3.5 space-y-3 transition-all duration-200 border ${
        rule.enabled
          ? 'border-slate-300/60 dark:border-white/15'
          : 'border-slate-200/40 dark:border-white/5 opacity-75'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colors.bg}`}
          >
            <Icon size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                {rule.title}
              </h4>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${colors.badge}`}
              >
                {rule.thresholdValue} {rule.thresholdUnit}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              {rule.desc}
            </p>
          </div>
        </div>

        {/* Gerçek iOS Tarzı Toggle Switch */}
        <button
          type="button"
          onClick={() => onToggle(rule.id)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none tactile-active ${
            rule.enabled ? colors.switchActive : 'bg-slate-300 dark:bg-slate-700'
          }`}
          role="switch"
          aria-checked={rule.enabled}
          aria-label={rule.title}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              rule.enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Eşik Değeri Hassasiyet Ayarlayıcı */}
      {rule.enabled && (
        <div className="pt-2 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {rule.thresholdLabel}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onUpdateThreshold(rule.id, -1)}
              className="w-6 h-6 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-bold tactile-active hover:bg-slate-300 dark:hover:bg-slate-700"
            >
              -
            </button>
            <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-100 w-12 text-center">
              {rule.thresholdValue} {rule.thresholdUnit}
            </span>
            <button
              type="button"
              onClick={() => onUpdateThreshold(rule.id, 1)}
              className="w-6 h-6 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-bold tactile-active hover:bg-slate-300 dark:hover:bg-slate-700"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
