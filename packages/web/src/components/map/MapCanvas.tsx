import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { SeismicEvent } from '@gokkalkan/shared';
import { MapLayerType } from './MapLayerPills';
import { MapPinIcon, ActivityIcon } from '../icons/SvgIcons';

interface MapCanvasProps {
  layer: MapLayerType;
  timeOffsetMin: number;
  earthquake?: SeismicEvent | null;
  onSelectStation?: (name: string, lat: number, lon: number) => void;
  selectedStationName?: string;
}

interface StationCoord {
  name: string;
  region: string;
  lat: number;
  lon: number;
  type: 'metropol' | 'coastal' | 'inland';
}

// Türkiye Geneli Önemli Bölge İstasyonları (Tıklanabilir)
const TURKEY_STATIONS: StationCoord[] = [
  { name: 'İstanbul', region: 'Marmara / Boğaz', lat: 41.0082, lon: 28.9784, type: 'metropol' },
  { name: 'Ankara', region: 'İç Anadolu', lat: 39.9334, lon: 32.8597, type: 'inland' },
  { name: 'İzmir', region: 'Ege Kıyı', lat: 38.4237, lon: 27.1428, type: 'coastal' },
  { name: 'Bursa', region: 'Güney Marmara', lat: 40.1885, lon: 29.0610, type: 'inland' },
  { name: 'Antalya', region: 'Akdeniz Sahil', lat: 36.8969, lon: 30.7133, type: 'coastal' },
  { name: 'Adana', region: 'Çukurova', lat: 37.0000, lon: 35.3213, type: 'inland' },
  { name: 'Trabzon', region: 'Doğu Karadeniz', lat: 41.0027, lon: 39.7168, type: 'coastal' },
  { name: 'Çanakkale', region: 'Boğaz & Adalar', lat: 40.1553, lon: 26.4142, type: 'coastal' },
  { name: 'Diyarbakır', region: 'Güneydoğu Anadolu', lat: 37.9144, lon: 40.2306, type: 'inland' },
  { name: 'Erzurum', region: 'Doğu Anadolu', lat: 39.9043, lon: 41.2679, type: 'inland' },
  { name: 'Samsun', region: 'Orta Karadeniz', lat: 41.2867, lon: 36.3300, type: 'coastal' },
];

// Türkiye ve Çevresi Coğrafi Bounding Box
const BOUNDS = {
  minLat: 35.6,
  maxLat: 42.4,
  minLon: 25.5,
  maxLon: 44.8,
};

export const MapCanvas: React.FC<MapCanvasProps> = ({
  layer,
  timeOffsetMin,
  earthquake,
  onSelectStation,
  selectedStationName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredStation, setHoveredStation] = useState<StationCoord | null>(null);

  // Projeksiyon: Lat/Lon -> Piksel Koordinatları
  const project = useCallback((lat: number, lon: number, width: number, height: number) => {
    const x = ((lon - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon)) * width;
    const y = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * height;
    return { x, y };
  }, []);

  // Vektör rüzgar partikülleri durumu
  const particlesRef = useRef<Array<{ x: number; y: number; speed: number; length: number; opacity: number }>>([]);

  useEffect(() => {
    const count = 90;
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * 400,
        y: Math.random() * 400,
        speed: 1.2 + Math.random() * 2.5,
        length: 8 + Math.random() * 16,
        opacity: 0.2 + Math.random() * 0.6,
      });
    }
    particlesRef.current = particles;
  }, []);

  // 60 FPS Render Döngüsü
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let sweepAngle = 0;
    let pulseRadius = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');
      // Deniz Rengi
      ctx.fillStyle = isDark ? '#061320' : '#e0f2fe';
      ctx.fillRect(0, 0, width, height);

      // 1. TÜRKİYE COĞRAFİ SİLUETİ (Anadolu & Trakya)
      ctx.fillStyle = isDark ? '#112236' : '#f1f5f9';
      ctx.strokeStyle = isDark ? '#1e3857' : '#cbd5e1';
      ctx.lineWidth = 1.5;

      // Anadolu Ana Kütlesi
      ctx.beginPath();
      const anadoluPoints: [number, number][] = [
        [41.25, 29.00], // İstanbul Boğazı Anadolu
        [41.20, 31.80], // Zonguldak
        [42.02, 35.15], // Sinop Burnu
        [41.35, 36.35], // Samsun
        [41.05, 39.75], // Trabzon
        [41.50, 41.55], // Hopa / Gürcistan sınırı
        [41.10, 43.10], // Kars
        [39.70, 44.30], // Ağrı / Iğdır
        [37.55, 44.30], // Hakkari / Yüksekova
        [37.30, 42.45], // Şırnak / Cizre
        [37.05, 40.50], // Mardin Nusaybin
        [36.90, 38.00], // Şanlıurfa Suruç
        [36.80, 36.60], // Kilis / Gaziantep
        [35.90, 36.00], // Hatay Yayladağı
        [36.60, 35.80], // İskenderun Körfezi
        [36.75, 34.60], // Mersin
        [36.20, 32.30], // Anamur Burnu
        [36.85, 30.70], // Antalya Körfezi
        [36.20, 29.60], // Kaş
        [36.70, 28.00], // Marmaris / Datça
        [37.00, 27.40], // Bodrum
        [37.70, 27.20], // Kuşadası
        [38.45, 26.95], // İzmir Çeşme
        [39.30, 26.70], // Ayvalık / Edremit
        [39.50, 26.10], // Bababurnu
        [40.05, 26.25], // Çanakkale Anadolu
        [40.40, 27.30], // Kapıdağ Yarımadası
        [40.75, 29.90], // İzmit Körfezi
      ];

      anadoluPoints.forEach(([lat, lon], idx) => {
        const p = project(lat, lon, width, height);
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Trakya Kütlesi
      ctx.beginPath();
      const trakyaPoints: [number, number][] = [
        [41.80, 26.50], // Edirne Kapıkule
        [41.95, 27.95], // İğneada Karadeniz
        [41.25, 29.00], // Boğaz Avrupa
        [40.98, 28.80], // Marmara Kıyısı
        [40.95, 27.50], // Tekirdağ
        [40.60, 26.90], // Şarköy
        [40.40, 26.65], // Gelibolu Boğaz
        [40.10, 26.20], // Seddülbahir
        [40.60, 26.10], // Saros Körfezi
        [40.75, 26.05], // Enez / Meriç
      ];

      trakyaPoints.forEach(([lat, lon], idx) => {
        const p = project(lat, lon, width, height);
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Van Gölü & Tuz Gölü Çizimi
      const van = project(38.60, 42.85, width, height);
      ctx.fillStyle = isDark ? '#061320' : '#e0f2fe';
      ctx.beginPath();
      ctx.ellipse(van.x, van.y, 10, 6, 0.2, 0, Math.PI * 2);
      ctx.fill();

      const tuz = project(38.80, 33.35, width, height);
      ctx.beginPath();
      ctx.ellipse(tuz.x, tuz.y, 8, 5, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // 2. SİSMİK KATMAN: TÜRKİYE AKTİF FAY HATLARI (KAF & DAF)
      if (layer === 'seismic') {
        ctx.save();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.6;
        ctx.setLineDash([4, 3]);

        // Kuzey Anadolu Fay Hattı (KAF)
        ctx.beginPath();
        const kafPoints: [number, number][] = [
          [40.50, 26.20], // Saros
          [40.75, 27.80], // Marmara Denizi Çukurluğu
          [40.75, 29.90], // İzmit
          [40.75, 31.60], // Bolu / Düzce
          [40.60, 35.80], // Tokat / Amasya
          [39.75, 39.50], // Erzincan
          [39.30, 41.00], // Karlıova Birleşim
        ];
        kafPoints.forEach(([lat, lon], idx) => {
          const p = project(lat, lon, width, height);
          if (idx === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        // Doğu Anadolu Fay Hattı (DAF)
        ctx.beginPath();
        const dafPoints: [number, number][] = [
          [36.20, 36.15], // Hatay
          [37.20, 36.90], // Maraş / Türkoğlu
          [38.30, 38.30], // Malatya
          [38.65, 39.20], // Elazığ Sivrice
          [39.30, 41.00], // Karlıova
        ];
        dafPoints.forEach(([lat, lon], idx) => {
          const p = project(lat, lon, width, height);
          if (idx === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
        ctx.restore();

        // Gerçek EMSC Deprem Episantrı ve Konsantrik Şok Dalgaları
        if (earthquake && earthquake.lat && earthquake.lon) {
          const eqP = project(earthquake.lat, earthquake.lon, width, height);
          pulseRadius = (pulseRadius + 0.4) % 36;

          // Dalgalar
          for (let r = pulseRadius; r < 50; r += 16) {
            ctx.beginPath();
            ctx.arc(eqP.x, eqP.y, r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(239, 68, 68, ${Math.max(0, 1 - r / 50)})`;
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }

          // Merkez Üssü Noktası
          ctx.beginPath();
          ctx.arc(eqP.x, eqP.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#dc2626';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // 3. YAĞIŞ RADARI KATMANI
      if (layer === 'rain') {
        const timeFactor = (timeOffsetMin / 60) * 15;
        const rainBlobs = [
          { lat: 41.10, lon: 29.50 + timeFactor * 0.05, r: 42, color: 'rgba(59, 130, 246, 0.45)' },
          { lat: 40.80, lon: 31.20 + timeFactor * 0.06, r: 36, color: 'rgba(16, 185, 129, 0.42)' },
          { lat: 38.50, lon: 27.30 + timeFactor * 0.04, r: 32, color: 'rgba(56, 189, 248, 0.38)' },
          { lat: 37.10, lon: 35.40 + timeFactor * 0.03, r: 30, color: 'rgba(234, 179, 8, 0.4)' },
          { lat: 41.20, lon: 39.80 + timeFactor * 0.05, r: 45, color: 'rgba(59, 130, 246, 0.5)' },
        ];

        rainBlobs.forEach((b) => {
          const bp = project(b.lat, b.lon, width, height);
          const grad = ctx.createRadialGradient(bp.x, bp.y, 2, bp.x, bp.y, b.r);
          grad.addColorStop(0, b.color);
          grad.addColorStop(1, 'rgba(59, 130, 246, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(bp.x, bp.y, b.r, 0, Math.PI * 2);
          ctx.fill();
        });

        // Dönen Radar Tarama Çizgisi (Türkiye Geneli Sweep)
        sweepAngle = (sweepAngle + 0.015) % (Math.PI * 2);
        const center = project(39.0, 35.0, width, height);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.arc(center.x, center.y, 140, sweepAngle, sweepAngle + 0.35);
        ctx.closePath();
        const sweepGrad = ctx.createRadialGradient(center.x, center.y, 10, center.x, center.y, 140);
        sweepGrad.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
        sweepGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = sweepGrad;
        ctx.fill();
        ctx.restore();
      }

      // 4. RÜZGÂR KATMANI (Vektör Partikülleri)
      if (layer === 'wind') {
        ctx.save();
        ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.65)' : 'rgba(2, 132, 199, 0.6)';
        ctx.lineWidth = 1.3;
        ctx.lineCap = 'round';

        const particles = particlesRef.current;
        for (const p of particles) {
          p.x += p.speed * 0.9;
          p.y += p.speed * 0.4; // Kuzeydoğudan güneybatıya poyraz akışı

          if (p.x > width) p.x = 0;
          if (p.y > height) p.y = 0;

          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.length * 0.8, p.y - p.length * 0.4);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 5. YANGIN TEHLİKESİ KATMANI (Termal Sıcak Noktalar)
      if (layer === 'fire') {
        const fireZones = [
          { lat: 36.90, lon: 28.20, r: 28, label: 'Muğla Ormanları' },
          { lat: 36.80, lon: 30.60, r: 32, label: 'Antalya Sahil' },
          { lat: 39.60, lon: 26.70, r: 25, label: 'Kaz Dağları' },
          { lat: 37.10, lon: 36.20, r: 24, label: 'Amanoslar' },
        ];
        fireZones.forEach((fz) => {
          const fzp = project(fz.lat, fz.lon, width, height);
          const fGrad = ctx.createRadialGradient(fzp.x, fzp.y, 2, fzp.x, fzp.y, fz.r);
          fGrad.addColorStop(0, 'rgba(244, 63, 94, 0.55)');
          fGrad.addColorStop(0.6, 'rgba(251, 146, 60, 0.25)');
          fGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');
          ctx.fillStyle = fGrad;
          ctx.beginPath();
          ctx.arc(fzp.x, fzp.y, fz.r, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 6. TÜRKİYE İSTASYON İĞNELERİ VE SEÇİLİ ŞEHİR BEACON
      for (const st of TURKEY_STATIONS) {
        const p = project(st.lat, st.lon, width, height);
        const isSelected = selectedStationName && selectedStationName.toLowerCase().includes(st.name.toLowerCase());

        if (isSelected) {
          // Seçili Konum Canlı Radar Nabız Halkası
          const beaconRadius = ((Date.now() / 25) % 24);
          ctx.beginPath();
          ctx.arc(p.x, p.y, beaconRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(16, 185, 129, ${Math.max(0, 1 - beaconRadius / 24)})`;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Seçili İğne
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#10b981';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Şehir İsmi Etiketi
          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
          ctx.textAlign = 'center';
          ctx.fillText(st.name, p.x, p.y - 10);
        } else {
          // Normal Şehir Noktası
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
          ctx.fill();

          ctx.font = '9px sans-serif';
          ctx.fillStyle = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
          ctx.textAlign = 'center';
          ctx.fillText(st.name, p.x, p.y - 6);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [layer, timeOffsetMin, earthquake, project, selectedStationName]);

  // Tıklama Yakalama: İstasyon Seçimi
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onSelectStation) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    for (const st of TURKEY_STATIONS) {
      const p = project(st.lat, st.lon, canvas.width, canvas.height);
      const dist = Math.hypot(p.x - clickX, p.y - clickY);
      if (dist < 18) {
        onSelectStation(st.name, st.lat, st.lon);
        return;
      }
    }
  };

  // Fare Gezinme (Hover Tooltip)
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const moveX = e.clientX - rect.left;
    const moveY = e.clientY - rect.top;

    for (const st of TURKEY_STATIONS) {
      const p = project(st.lat, st.lon, canvas.width, canvas.height);
      const dist = Math.hypot(p.x - moveX, p.y - moveY);
      if (dist < 18) {
        setHoveredStation(st);
        return;
      }
    }
    setHoveredStation(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400px] rounded-card overflow-hidden liquid-glass border border-slate-300/40 dark:border-white/10 select-none"
    >
      <canvas
        ref={canvasRef}
        width={388}
        height={400}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={() => setHoveredStation(null)}
        className="w-full h-full cursor-crosshair block"
      />

      {/* Harita Katman Başlığı Rozeti */}
      <div className="absolute top-3 left-3 pointer-events-none">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/60 backdrop-blur-md text-white text-[11px] font-medium shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Türkiye & Bölgesel Erken Uyarı Radarı</span>
        </div>
      </div>

      {/* Sismik Katmanda Aktif Deprem Bilgi Kartı */}
      {layer === 'seismic' && earthquake && (
        <div className="absolute bottom-3 left-3 right-3 bg-rose-950/85 backdrop-blur-md border border-rose-500/40 rounded-xl p-2.5 flex items-center justify-between text-white shadow-lg pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center shrink-0">
              <ActivityIcon size={14} />
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">
                M {earthquake.magnitude.toFixed(1)} · {earthquake.region}
              </div>
              <div className="text-[10px] text-rose-200">
                {earthquake.distanceKm.toFixed(0)} km mesafe · Derinlik: {earthquake.depthKm.toFixed(1)} km
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200">
            EMSC Canlı
          </span>
        </div>
      )}

      {/* Hover İstasyon İpucu */}
      {hoveredStation && (
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl px-2.5 py-1 text-white text-[11px] shadow-lg pointer-events-none">
          <div className="font-semibold flex items-center gap-1">
            <MapPinIcon size={12} className="text-emerald-400" />
            <span>{hoveredStation.name}</span>
          </div>
          <div className="text-[10px] text-slate-300">{hoveredStation.region} (Tıkla ve Seç)</div>
        </div>
      )}
    </div>
  );
};