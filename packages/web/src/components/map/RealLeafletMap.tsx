import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { SeismicEvent } from '@gokkalkan/shared';
import { MapLayerType } from './MapLayerPills';
import { useTheme } from '../layout/ThemeWipeProvider';
import { fetchRainViewerData, findFrameByOffset } from '../../services/rainViewerService';
import { LocateFixedIcon } from '../icons/SvgIcons';

export interface RealLeafletMapProps {
  activeLayer: MapLayerType;
  timeOffsetMin: number;
  earthquake?: SeismicEvent | null;
  selectedStationName?: string;
  userCoords?: { lat: number; lon: number } | null;
  onSelectLocation?: (name: string, lat: number, lon: number) => void;
  className?: string;
}

// Türkiye KAF ve DAF Aktif Fay Hatları Hassas Koordinatları
const FAULT_LINES = {
  // Kuzey Anadolu Fayı (Saros Körfezi'nden Karlıova'ya)
  kaf: [
    [40.50, 26.20],
    [40.65, 27.10],
    [40.75, 27.85],
    [40.78, 29.20],
    [40.75, 29.95],
    [40.75, 30.65],
    [40.75, 31.60],
    [40.82, 32.80],
    [40.85, 33.65],
    [40.90, 34.80],
    [40.60, 36.80],
    [40.35, 38.20],
    [39.75, 39.50],
    [39.45, 40.40],
    [39.30, 41.00],
  ] as [number, number][],

  // Doğu Anadolu Fayı (Antakya / Maraş'tan Karlıova'ya)
  daf: [
    [36.15, 36.10],
    [36.80, 36.55],
    [37.20, 36.90],
    [37.55, 37.30],
    [37.85, 37.75],
    [38.25, 38.30],
    [38.45, 38.90],
    [38.65, 39.30],
    [38.88, 40.20],
    [39.05, 40.65],
    [39.30, 41.00],
  ] as [number, number][],
};

// Gerçek ve Önemli Deprem Episantrları Örnekleri
const SAMPLE_QUAKES = [
  { id: 'q1', title: 'Marmara Denizi (Silivri Açıkları)', mag: 4.1, depthKm: 8.4, lat: 40.85, lon: 28.18, timeAgo: '24 dk önce' },
  { id: 'q2', title: 'Kahramanmaraş (Pazarcık)', mag: 3.8, depthKm: 7.0, lat: 37.49, lon: 37.29, timeAgo: '1 sa önce' },
  { id: 'q3', title: 'Ege Denizi (Gökova Körfezi)', mag: 4.4, depthKm: 11.2, lat: 36.98, lon: 27.85, timeAgo: '2 sa önce' },
  { id: 'q4', title: 'Bingöl (Karlıova Kavşağı)', mag: 3.6, depthKm: 5.6, lat: 39.32, lon: 41.02, timeAgo: '3 sa önce' },
];

// Rüzgar Gözlem İstasyonları (Kritik Koridorlar)
const WIND_STATIONS = [
  { name: 'İstanbul Boğazı', lat: 41.12, lon: 29.08, speedKn: 24, deg: 45, direction: 'Poyraz' },
  { name: 'Çanakkale Boğazı', lat: 40.18, lon: 26.40, speedKn: 28, deg: 35, direction: 'Yıldız-Poyraz' },
  { name: 'İzmir Çeşme', lat: 38.32, lon: 26.30, speedKn: 20, deg: 330, direction: 'Karayel' },
  { name: 'Antalya Körfezi', lat: 36.80, lon: 30.70, speedKn: 12, deg: 180, direction: 'Kıble' },
  { name: 'Sinop Burnu', lat: 42.02, lon: 35.15, speedKn: 22, deg: 65, direction: 'Gündoğusu' },
  { name: 'Bodrum Açıkları', lat: 36.95, lon: 27.55, speedKn: 19, deg: 315, direction: 'Karayel' },
  { name: 'Trabzon Kıyısı', lat: 41.02, lon: 39.75, speedKn: 15, deg: 80, direction: 'Gündoğusu' },
  { name: 'İskenderun Körfezi', lat: 36.60, lon: 35.85, speedKn: 16, deg: 210, direction: 'Lodos' },
];

// FWI Orman Yangın Tehlikesi Sıcak Noktaları
const FIRE_HOTSPOTS = [
  { name: 'Muğla / Marmaris', lat: 36.85, lon: 28.27, fwi: 42.4, risk: 'Aşırı', temp: 37, humidity: 18, windKm: 34 },
  { name: 'Antalya / Manavgat', lat: 36.78, lon: 31.44, fwi: 45.1, risk: 'Aşırı', temp: 39, humidity: 14, windKm: 38 },
  { name: 'İzmir / Seferihisar', lat: 38.20, lon: 26.84, fwi: 32.8, risk: 'Yüksek', temp: 34, humidity: 24, windKm: 28 },
  { name: 'Çanakkale / Kaz Dağları', lat: 39.70, lon: 26.80, fwi: 26.4, risk: 'Orta', temp: 31, humidity: 29, windKm: 22 },
  { name: 'Adana / Amanoslar', lat: 37.05, lon: 36.35, fwi: 35.0, risk: 'Yüksek', temp: 36, humidity: 19, windKm: 30 },
  { name: 'Aydın / Kuşadası', lat: 37.86, lon: 27.26, fwi: 33.2, risk: 'Yüksek', temp: 35, humidity: 21, windKm: 26 },
];

export const RealLeafletMap: React.FC<RealLeafletMapProps> = ({
  activeLayer,
  timeOffsetMin,
  earthquake,
  selectedStationName,
  userCoords,
  onSelectLocation,
  className = '',
}) => {
  const { isDark } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseLayerRef = useRef<L.TileLayer | null>(null);
  const radarLayerRef = useRef<L.TileLayer | null>(null);

  // Vektör Katman Grupları
  const seismicGroupRef = useRef<L.LayerGroup | null>(null);
  const windGroupRef = useRef<L.LayerGroup | null>(null);
  const fireGroupRef = useRef<L.LayerGroup | null>(null);
  const interactiveGroupRef = useRef<L.LayerGroup | null>(null);

  const [isMapReady, setIsMapReady] = useState(false);
  const [radarTimestampText, setRadarTimestampText] = useState<string>('');

  // 1. Leaflet Haritasının İlk Kurulumu (Mounting)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Kullanıcının seçili şehri/koordinatı varsa doğrudan ilçe düzeyinde (Zoom 9), yoksa Çanakkale merkezli başla
    const initialLat = userCoords?.lat ?? 40.1553;
    const initialLon = userCoords?.lon ?? 26.4142;
    const defaultCenter: L.LatLngExpression = [initialLat, initialLon];
    const defaultZoom = 9; // Zoom 9: Tüm ilçeler (Biga, Çan, Ezine, Gelibolu vb.) net okunur

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false, // Liquid glass özel butonlarla yöneteceğiz
      attributionControl: false, // Minimalist temiz arayüz
    });

    // Vektör Katman Gruplarını Başlat
    const seismicGroup = L.layerGroup().addTo(map);
    const windGroup = L.layerGroup().addTo(map);
    const fireGroup = L.layerGroup().addTo(map);
    const interactiveGroup = L.layerGroup().addTo(map);

    seismicGroupRef.current = seismicGroup;
    windGroupRef.current = windGroup;
    fireGroupRef.current = fireGroup;
    interactiveGroupRef.current = interactiveGroup;

    mapInstanceRef.current = map;
    setIsMapReady(true);

    // Haritaya Tıklama Dinleyicisi: "Bu Konumu Seç" Liquid Glass Popover
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const formattedLat = lat.toFixed(4);
      const formattedLng = lng.toFixed(4);

      interactiveGroup.clearLayers();

      const clickPinHtml = `
        <div class="relative -translate-x-1/2 -translate-y-full flex flex-col items-center pointer-events-none">
          <div class="w-7 h-7 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-400 flex items-center justify-center shadow-lg animate-bounce">
            <div class="w-3 h-3 rounded-full bg-blue-500"></div>
          </div>
          <div class="w-1 h-3 bg-blue-500/80"></div>
        </div>
      `;

      const pinIcon = L.divIcon({
        html: clickPinHtml,
        className: 'custom-click-pin',
        iconSize: [28, 40],
        iconAnchor: [14, 40],
      });

      const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(interactiveGroup);

      const popupContent = document.createElement('div');
      popupContent.className = 'liquid-glass rounded-xl p-3 text-slate-800 dark:text-slate-100 min-w-[210px] space-y-2 select-none shadow-xl border border-white/30 dark:border-white/10';
      popupContent.innerHTML = `
        <div class="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
          <span>Seçilen Koordinat</span>
        </div>
        <div class="text-[11px] font-mono text-slate-600 dark:text-slate-300">
          ${formattedLat}° K, ${formattedLng}° D
        </div>
        <button id="btnSelectMapCoord" class="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Bu Konumu Seç</span>
        </button>
      `;

      const popup = L.popup({
        offset: [0, -36],
        closeButton: false,
        className: 'liquid-glass-leaflet-popup',
      })
        .setLatLng([lat, lng])
        .setContent(popupContent)
        .openOn(map);

      // Buton tıklama olayı
      setTimeout(() => {
        const btn = document.getElementById('btnSelectMapCoord');
        if (btn) {
          btn.onclick = () => {
            const locName = `Konum (${formattedLat}, ${formattedLng})`;
            if (onSelectLocation) {
              onSelectLocation(locName, Number(formattedLat), Number(formattedLng));
            }
            map.closePopup(popup);
            interactiveGroup.clearLayers();
          };
        }
      }, 50);
    });

    // Yeniden boyutlandırma düzeltmesi
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [onSelectLocation]);

  // 2. Açık / Koyu Tema Altlık Harita (OpenStreetMap — Tüm İlçeler, Köyler ve Yollar %100 Detaylı)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapReady) return;

    if (baseLayerRef.current) {
      map.removeLayer(baseLayerRef.current);
    }

    // OpenStreetMap yüksek çözünürlüklü Türkçe yerleşim ve ilçe döşemeleri
    const osmUrl = 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png';

    const newBaseLayer = L.tileLayer(osmUrl, {
      subdomains: ['a', 'b', 'c'],
      maxZoom: 19,
      opacity: isDark ? 0.90 : 0.98,
      className: isDark ? 'osm-dark-tiles' : '',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    baseLayerRef.current = newBaseLayer;
  }, [isDark, isMapReady]);

  // Konum değiştiğinde haritayı o şehre/ilçeye pürüzsüzce uçur (flyTo)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapReady || !userCoords?.lat || !userCoords?.lon) return;
    map.flyTo([userCoords.lat, userCoords.lon], 9, { duration: 1.2 });
  }, [userCoords?.lat, userCoords?.lon, isMapReady]);

  // 3. Yağış Radarı Katmanı (RainViewer API)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapReady) return;

    if (activeLayer !== 'rain') {
      if (radarLayerRef.current) {
        map.removeLayer(radarLayerRef.current);
        radarLayerRef.current = null;
      }
      setRadarTimestampText('');
      return;
    }

    let isCancelled = false;

    async function loadRadar() {
      const data = await fetchRainViewerData();
      if (isCancelled || !mapInstanceRef.current) return;

      const frameMatch = findFrameByOffset(data, timeOffsetMin);
      if (!frameMatch) return;

      if (radarLayerRef.current) {
        mapInstanceRef.current.removeLayer(radarLayerRef.current);
      }

      // RainViewer Tile Layer (%75 yarı saydamlık)
      // RainViewer ücretsiz API'si maksimum zoom 7 destekler.
      // maxNativeZoom: 7 ile Leaflet zoom 8+ seviyelerinde tile'ları istemcide pürüzsüz büyütür
      // ve RainViewer'ın "Zoom Level Not Supported" filigranını basmasını engeller.
      const radarLayer = L.tileLayer(frameMatch.tileUrl, {
        opacity: 0.75,
        zIndex: 250,
        maxNativeZoom: 7,
        maxZoom: 18,
      }).addTo(mapInstanceRef.current);

      radarLayerRef.current = radarLayer;

      // Zaman damgası metni
      const date = new Date(frameMatch.frame.time * 1000);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      setRadarTimestampText(`${hours}:${minutes}`);
    }

    loadRadar();

    return () => {
      isCancelled = true;
    };
  }, [activeLayer, timeOffsetMin, isMapReady]);

  // 4. Sismik Katman (KAF & DAF Fay Hatları + EMSC Deprem Episantrları)
  useEffect(() => {
    const group = seismicGroupRef.current;
    if (!group || !isMapReady) return;

    group.clearLayers();

    if (activeLayer !== 'seismic' && (activeLayer as string) !== 'quake') return;

    // KAF Hattı Çizimi (Neon Kırmızı-Turuncu Çizgi)
    const kafGlow = L.polyline(FAULT_LINES.kaf, {
      color: '#ef4444',
      weight: 5,
      opacity: 0.35,
      lineCap: 'round',
    }).addTo(group);

    const kafLine = L.polyline(FAULT_LINES.kaf, {
      color: '#dc2626',
      weight: 2.2,
      dashArray: '8, 6',
      opacity: 0.95,
      lineCap: 'round',
    }).addTo(group);

    kafLine.bindTooltip('Kuzey Anadolu Fay Hattı (KAF) — Aktif Doğrultu Atımlı Fay', {
      sticky: true,
      className: 'liquid-glass-tooltip',
    });

    // DAF Hattı Çizimi (Neon Turuncu Çizgi)
    const dafGlow = L.polyline(FAULT_LINES.daf, {
      color: '#f97316',
      weight: 5,
      opacity: 0.35,
      lineCap: 'round',
    }).addTo(group);

    const dafLine = L.polyline(FAULT_LINES.daf, {
      color: '#ea580c',
      weight: 2.2,
      dashArray: '8, 6',
      opacity: 0.95,
      lineCap: 'round',
    }).addTo(group);

    dafLine.bindTooltip('Doğu Anadolu Fay Hattı (DAF) — Aktif Sol Yanal Doğrultu Atımlı Fay', {
      sticky: true,
      className: 'liquid-glass-tooltip',
    });

    // Deprem Episantrları Listesi
    const quakesToRender = [...SAMPLE_QUAKES];
    if (earthquake && earthquake.lat && earthquake.lon) {
      quakesToRender.unshift({
        id: 'real-current',
        title: earthquake.region,
        mag: earthquake.magnitude,
        depthKm: earthquake.depthKm,
        lat: earthquake.lat,
        lon: earthquake.lon,
        timeAgo: 'En Son Algılanan',
      });
    }

    quakesToRender.forEach((q) => {
      const isStrong = q.mag >= 4.0;
      const colorBg = isStrong ? 'bg-rose-600' : 'bg-amber-600';
      const ringColor = isStrong ? 'rgba(239, 68, 68, 0.65)' : 'rgba(245, 158, 11, 0.65)';

      const quakeIconHtml = `
        <div class="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer">
          <div class="absolute w-10 h-10 rounded-full border-2 border-rose-500 animate-ping opacity-75"></div>
          <div class="relative w-8 h-8 rounded-full ${colorBg} border-2 border-white text-white font-bold text-xs flex items-center justify-center shadow-lg transition-transform hover:scale-110">
            ${q.mag.toFixed(1)}
          </div>
        </div>
      `;

      const quakeIcon = L.divIcon({
        html: quakeIconHtml,
        className: 'custom-quake-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([q.lat, q.lon], { icon: quakeIcon }).addTo(group);

      const popupHtml = `
        <div class="liquid-glass rounded-xl p-3 text-slate-800 dark:text-slate-100 min-w-[200px] space-y-1.5 shadow-xl border border-rose-500/30">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400">
              EMSC Sismik portal
            </span>
            <span class="text-[10px] text-slate-500 dark:text-slate-400">${q.timeAgo}</span>
          </div>
          <div class="text-sm font-bold leading-snug">
            M ${q.mag.toFixed(1)} — ${q.title}
          </div>
          <div class="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between pt-1 border-t border-slate-200/40 dark:border-white/10">
            <span>Derinlik: <b>${q.depthKm.toFixed(1)} km</b></span>
            <span>Enlem: <b>${q.lat.toFixed(2)}°</b></span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'liquid-glass-leaflet-popup',
        closeButton: false,
        offset: [0, -12],
      });
    });
  }, [activeLayer, earthquake, isMapReady]);

  // 5. Rüzgâr Katmanı (Vektör SVG Okları & Knot Etiketleri)
  useEffect(() => {
    const group = windGroupRef.current;
    if (!group || !isMapReady) return;

    group.clearLayers();

    if (activeLayer !== 'wind') return;

    WIND_STATIONS.forEach((ws) => {
      const isHighWind = ws.speedKn >= 25;
      const badgeBg = isHighWind ? 'bg-rose-500 text-white' : ws.speedKn >= 18 ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white';

      const windIconHtml = `
        <div class="relative -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
          <!-- Döndürülen Yön Oku -->
          <div class="w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110" style="transform: rotate(${ws.deg}deg);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-cyan-400">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </div>
          <!-- Hız Rozeti -->
          <div class="mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${badgeBg} shadow-sm whitespace-nowrap">
            ${ws.speedKn} kn
          </div>
        </div>
      `;

      const windIcon = L.divIcon({
        html: windIconHtml,
        className: 'custom-wind-marker',
        iconSize: [44, 52],
        iconAnchor: [22, 26],
      });

      const marker = L.marker([ws.lat, ws.lon], { icon: windIcon }).addTo(group);

      const popupHtml = `
        <div class="liquid-glass rounded-xl p-3 text-slate-800 dark:text-slate-100 min-w-[190px] space-y-1.5 shadow-xl border border-cyan-500/30">
          <div class="text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>
            <span>${ws.name}</span>
          </div>
          <div class="text-sm font-semibold">
            ${ws.speedKn} knot (${(ws.speedKn * 1.852).toFixed(0)} km/s)
          </div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400">
            Yön: <b>${ws.deg}° (${ws.direction})</b>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'liquid-glass-leaflet-popup',
        closeButton: false,
        offset: [0, -20],
      });
    });
  }, [activeLayer, isMapReady]);

  // 6. Yangın Tehlikesi (FWI) Katmanı (Akdeniz & Ege Ormanları)
  useEffect(() => {
    const group = fireGroupRef.current;
    if (!group || !isMapReady) return;

    group.clearLayers();

    if (activeLayer !== 'fire') return;

    FIRE_HOTSPOTS.forEach((fz) => {
      const isExtreme = fz.fwi >= 40;
      const isHigh = fz.fwi >= 30;
      const badgeColor = isExtreme ? 'bg-rose-600' : isHigh ? 'bg-orange-500' : 'bg-amber-500';

      const fireIconHtml = `
        <div class="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer group">
          <div class="absolute w-9 h-9 rounded-full ${badgeColor} opacity-30 animate-ping"></div>
          <div class="relative flex items-center gap-1 px-2 py-1 rounded-full ${badgeColor} text-white font-bold text-[11px] shadow-lg border border-white/40 transition-transform group-hover:scale-110">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
            <span>FWI ${fz.fwi.toFixed(0)}</span>
          </div>
        </div>
      `;

      const fireIcon = L.divIcon({
        html: fireIconHtml,
        className: 'custom-fire-marker',
        iconSize: [60, 30],
        iconAnchor: [30, 15],
      });

      const marker = L.marker([fz.lat, fz.lon], { icon: fireIcon }).addTo(group);

      const popupHtml = `
        <div class="liquid-glass rounded-xl p-3 text-slate-800 dark:text-slate-100 min-w-[210px] space-y-1.5 shadow-xl border border-orange-500/40">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
              <span>${fz.name}</span>
            </span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${isExtreme ? 'bg-rose-500/20 text-rose-600' : 'bg-orange-500/20 text-orange-600'}">
              ${fz.risk} Risk
            </span>
          </div>
          <div class="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 pt-1 border-t border-slate-200/40 dark:border-white/10">
            <div class="flex justify-between">
              <span>Sıcaklık:</span>
              <b>${fz.temp} °C</b>
            </div>
            <div class="flex justify-between">
              <span>Bağıl Nem:</span>
              <b>%${fz.humidity}</b>
            </div>
            <div class="flex justify-between">
              <span>Rüzgâr Hamlesi:</span>
              <b>${fz.windKm} km/s</b>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'liquid-glass-leaflet-popup',
        closeButton: false,
        offset: [0, -12],
      });
    });
  }, [activeLayer, isMapReady]);

  // 7. Kullanıcı Konumuna Git (flyTo GPS)
  const handleFlyToUser = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userCoords && userCoords.lat && userCoords.lon) {
      map.flyTo([userCoords.lat, userCoords.lon], 9, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          map.flyTo([latitude, longitude], 9, {
            duration: 1.5,
            easeLinearity: 0.25,
          });
        },
        () => {
          // Fallback: İstanbul / Merkez
          map.flyTo([41.0082, 28.9784], 9, { duration: 1.5 });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      map.flyTo([39.0, 35.2], 6, { duration: 1.5 });
    }
  }, [userCoords]);

  return (
    <div className={`relative w-full h-full overflow-hidden select-none ${className}`}>
      {/* Leaflet DOM Harita Taşıyıcısı */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* RainViewer Canlı Zaman Damgası Rozeti */}
      {activeLayer === 'rain' && radarTimestampText && (
        <div className="absolute top-16 left-4 z-[400] pointer-events-none">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-lg border border-white/30 dark:border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Radar Saati: {radarTimestampText}</span>
          </div>
        </div>
      )}

      {/* Sağ Taraf: 'Konumuma Git' Havada Yüzen Liquid Glass Butonu */}
      <div className="absolute right-4 bottom-28 z-[400]">
        <button
          type="button"
          onClick={handleFlyToUser}
          aria-label="Konumuma Git"
          title="Konumuma Git"
          className="w-11 h-11 rounded-2xl liquid-glass text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center justify-center shadow-glass border border-white/40 dark:border-white/15 transition-all duration-200 tactile-active hover:scale-105"
        >
          <LocateFixedIcon size={20} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
};
