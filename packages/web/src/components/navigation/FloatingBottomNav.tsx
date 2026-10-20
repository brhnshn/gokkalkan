import React from 'react';
import {
  IconProps,
  SunIcon,
  MapIcon,
  BellIcon,
  CalendarIcon,
  SettingsIcon,
} from '../icons/SvgIcons';

export type NavTabId = 'today' | 'map' | 'alerts' | 'week' | 'settings';

interface NavItem {
  id: NavTabId;
  label: string;
  icon: React.FC<IconProps>;
}

const TABS: NavItem[] = [
  { id: 'today', label: 'Bugün', icon: SunIcon },
  { id: 'map', label: 'Harita', icon: MapIcon },
  { id: 'alerts', label: 'Uyarılar', icon: BellIcon },
  { id: 'week', label: '7 Gün', icon: CalendarIcon },
  { id: 'settings', label: 'Ayarlar', icon: SettingsIcon },
];

interface FloatingBottomNavProps {
  activeTab: NavTabId;
  onTabChange: (tab: NavTabId) => void;
}

export const FloatingBottomNav: React.FC<FloatingBottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const activeIdx = Math.max(0, TABS.findIndex((t) => t.id === activeTab));

  return (
    <nav
      aria-label="Ana Gezinti"
      className="fixed bottom-[calc(18px+env(safe-area-inset-bottom))] left-4 right-4 max-w-[420px] mx-auto z-50 select-none"
    >
      <div className="relative h-[64px] rounded-full liquid-nav-glass flex items-center justify-around px-1.5 transition-shadow duration-300">
        {/* Kayan Sıvı Cam Hap (Sliding Pill Indicator) - %100 Senkronize Matematiksel Konumlandırma */}
        <div
          aria-hidden="true"
          className="absolute top-[6px] bottom-[6px] rounded-full pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] bg-slate-900/[0.08] dark:bg-white/[0.14] border border-white/60 dark:border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
          style={{
            left: `calc(${activeIdx * 20}% + 4px)`,
            width: 'calc(20% - 8px)',
          }}
        />

        {/* Sekme Butonları */}
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative z-10 flex-1 h-full flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-[0.94] focus:outline-none ${
                isActive
                  ? 'text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              aria-label={tab.label}
              aria-selected={isActive}
            >
              <span
                className={`transition-transform duration-200 ${
                  isActive ? '-translate-y-0.5 scale-105' : 'translate-y-0'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.1 : 1.8} />
              </span>
              <span className="text-[10px] tracking-tight leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
