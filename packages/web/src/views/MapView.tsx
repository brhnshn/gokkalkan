import React, { useState } from 'react';
import type { SeismicEvent } from '@gokkalkan/shared';
import { MapLayerPills, MapLayerType } from '../components/map/MapLayerPills';
import { RealLeafletMap } from '../components/map/RealLeafletMap';
import { MapLegend } from '../components/map/MapLegend';
import { MapTimelinePlayer } from '../components/map/MapTimelinePlayer';

interface MapViewProps {
  currentLocationName?: string;
  earthquake?: SeismicEvent | null;
  userCoords?: { lat: number; lon: number } | null;
  onSelectLocation?: (name: string, lat: number, lon: number) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  currentLocationName,
  earthquake,
  userCoords,
  onSelectLocation,
}) => {
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('rain');
  const [timeOffsetMin, setTimeOffsetMin] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  return (
    <div className="relative w-full h-[calc(100dvh-64px)] isolate overflow-hidden select-none">
      {/* 1. Tam Ekran Gerçek Leaflet & RainViewer Harita Motoru */}
      <RealLeafletMap
        activeLayer={activeLayer}
        timeOffsetMin={timeOffsetMin}
        earthquake={earthquake}
        selectedStationName={currentLocationName}
        userCoords={userCoords}
        onSelectLocation={onSelectLocation}
        className="w-full h-full"
      />

      {/* 2. Havada Yüzen Üst Katman Seçici Hapları (Liquid Glass) */}
      <div className="absolute top-3 left-3 right-3 z-30 pointer-events-auto">
        <MapLayerPills
          activeLayer={activeLayer}
          onSelectLayer={(l) => setActiveLayer(l)}
        />
      </div>

      {/* 3. Havada Yüzen Alt Kontrol Paneli (Timeline ve Lejant) */}
      <div className="absolute bottom-24 left-3 right-3 z-30 space-y-2 pointer-events-auto">
        {/* Zaman Çubuğu (Radar ve Simülasyon Oynatıcı) */}
        {activeLayer === 'rain' && (
          <MapTimelinePlayer
            timeOffsetMin={timeOffsetMin}
            onChangeTimeOffset={setTimeOffsetMin}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying((p) => !p)}
          />
        )}

        {/* Dinamik Katman Lejantı */}
        <MapLegend layer={activeLayer} />
      </div>
    </div>
  );
};
