import React from 'react';
import {
  DropletsIcon,
  WindIcon,
  ActivityIcon,
  FlameIcon,
  IconProps,
} from '../icons/SvgIcons';

export type MapLayerType = 'rain' | 'wind' | 'seismic' | 'fire' | 'quake';

interface MapLayerPillsProps {
  activeLayer: MapLayerType;
  onSelectLayer: (layer: MapLayerType) => void;
}

export const MapLayerPills: React.FC<MapLayerPillsProps> = ({
  activeLayer,
  onSelectLayer,
}) => {
  const layers: Array<{
    id: MapLayerType;
    label: string;
    icon: React.FC<IconProps>;
    activeBg: string;
    activeText: string;
  }> = [

    {
      id: 'rain',
      label: 'Yağış Radarı',
      icon: DropletsIcon,
      activeBg: 'bg-blue-600',
      activeText: 'text-white',
    },
    {
      id: 'wind',
      label: 'Rüzgâr Akışı',
      icon: WindIcon,
      activeBg: 'bg-emerald-600',
      activeText: 'text-white',
    },
    {
      id: 'seismic',
      label: 'Sismik Fay & Deprem',
      icon: ActivityIcon,
      activeBg: 'bg-rose-600',
      activeText: 'text-white',
    },
    {
      id: 'fire',
      label: 'Yangın Tehlikesi',
      icon: FlameIcon,
      activeBg: 'bg-orange-600',
      activeText: 'text-white',
    },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
      {layers.map((layer) => {
        const Icon = layer.icon;
        const isActive = activeLayer === layer.id;
        return (
          <button
            key={layer.id}
            type="button"
            onClick={() => onSelectLayer(layer.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 tactile-active ${
              isActive
                ? `${layer.activeBg} ${layer.activeText} shadow-md`
                : 'liquid-glass text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Icon size={14} />
            <span>{layer.label}</span>
          </button>
        );
      })}
    </div>
  );
};
