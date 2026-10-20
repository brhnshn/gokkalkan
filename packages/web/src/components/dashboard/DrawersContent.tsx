import React, { useState } from 'react';
import type { SeismicEvent, AgriRiskReport, MarineRiskReport } from '@gokkalkan/shared';
import {
  SproutIcon,
  AnchorIcon,
  ActivityIcon,
  CheckIcon,
} from '../icons/SvgIcons';

export interface AgriDrawerContentProps {
  agriculture?: AgriRiskReport;
}

export const AgriDrawerContent: React.FC<AgriDrawerContentProps> = ({ agriculture }) => {
  const moisture = agriculture?.soilMoisturePct ?? 42;
  const frost = agriculture?.frostRiskPct ?? 5;
  const soilTemp = agriculture?.soilTempC ?? 16;
  const sprayingSuitable = agriculture?.sprayingSuitable ?? true;
  const recommendation =
    agriculture?.recommendation ||
    'Gece sıcaklıkları don eşiğinin üzerinde. İlaçlama rüzgar penceresi sabah 07:00 - 11:00 arası idealdir.';

  return (
    <div className="space-y-4">
      {/* Üst Durum Kartı */}
      <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          <SproutIcon size={14} />
          <span>Zirai Şartlar</span>
        </div>
        <div className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">
          {agriculture?.status || 'Düşük Risk'} · Tarımsal Şartlar Uygun
        </div>
      </div>

      {/* 4'lü Metrik Kartları */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="liquid-glass rounded-2xl p-3 text-center">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Toprak Nemi</div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
            %{moisture}
          </div>
          <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
            İdeal Seviye
          </div>
        </div>

        <div className="liquid-glass rounded-2xl p-3 text-center">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Zirai Don Riski</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            %{frost}
          </div>
          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Tehlike Saptanmadı
          </div>
        </div>

        <div className="liquid-glass rounded-2xl p-3 text-center">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">İlaçlama Uygunluğu</div>
          <div className="text-lg font-bold text-sky-600 dark:text-sky-400 mt-0.5">
            {sprayingSuitable ? 'Uygun' : 'Rüzgarlı'}
          </div>
          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Hafif rüzgar akışı
          </div>
        </div>

        <div className="liquid-glass rounded-2xl p-3 text-center">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Toprak Sıcaklığı</div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
            {soilTemp}°C
          </div>
          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Kök gelişimi için normal
          </div>
        </div>
      </div>

      {/* Tavsiye Kutusu */}
      <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <strong className="block text-slate-800 dark:text-slate-100 mb-1 font-semibold">
          Zirai Tavsiye:
        </strong>
        {recommendation}
      </div>
    </div>
  );
};

export interface MarineDrawerContentProps {
  marine?: MarineRiskReport;
}

export const MarineDrawerContent: React.FC<MarineDrawerContentProps> = ({ marine }) => {
  const waveHeight = marine?.waveHeightM ?? 0.4;
  const wavePeriod = marine?.wavePeriodS ?? 4.2;
  const windGust = marine?.windGustKnots ?? 8;
  const recommendation =
    marine?.recommendation ||
    'Kıyı ve açık deniz seyri sakin. Çanakkale Boğazı güney geçişinde akıntı ve dalga yüksekliği güvenli sınırlar içinde.';

  return (
    <div className="space-y-4">
      {/* Üst Durum Kartı */}
      <div className="p-3.5 rounded-2xl border border-sky-500/30 bg-sky-500/10">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
          <AnchorIcon size={14} />
          <span>Deniz & Seyir Durumu</span>
        </div>
        <div className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">
          {marine?.status || 'UYGUN'} · Kıyı ve Boğaz Seyri Sakin
        </div>
      </div>

      {/* 4'lü Metrik Kartları */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="liquid-glass rounded-2xl p-3 text-center">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Dalga Boyu</div>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-0.5">
            {waveHeight}m
          </div>
          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            {wavePeriod}s periyot
          </div>
        </div>

        <div className="liquid-glass rounded-2xl p-3 text-center">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Rüzgâr Hamlesi</div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
            {windGust} knot
          </div>
          <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
            Meltem seviyesi
          </div>
        </div>

        <div className="liquid-glass rounded-2xl p-3 text-center">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Su Sıcaklığı</div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
            16°C
          </div>
          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Mevsim normalleri
          </div>
        </div>

        <div className="liquid-glass rounded-2xl p-3 text-center">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Boğaz Akıntısı</div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-0.5">
            1.8 knot
          </div>
          <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
            Güvenli geçiş
          </div>
        </div>
      </div>

      {/* Kaptan Tavsiyesi */}
      <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <strong className="block text-slate-800 dark:text-slate-100 mb-1 font-semibold">
          Kaptan Notu:
        </strong>
        {recommendation}
      </div>
    </div>
  );
};

export interface EarthquakeDrawerContentProps {
  earthquake?: SeismicEvent | null;
  onSave?: () => void;
}

export const EarthquakeDrawerContent: React.FC<EarthquakeDrawerContentProps> = ({
  earthquake,
  onSave,
}) => {
  const [sirenActive, setSirenActive] = useState(true);
  const [radiusKm, setRadiusKm] = useState(150);
  const [saved, setSaved] = useState(false);

  const eq = earthquake || {
    id: 'emsc-demo',
    magnitude: 2.9,
    region: 'Western Turkey (Çanakkale)',
    distanceKm: 24.5,
    hoursAgo: 2,
    depthKm: 7.2,
    source: 'EMSC' as const,
    timeIso: new Date().toISOString(),
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onSave?.();
    }, 800);
  };

  return (
    <div className="space-y-4">
      {/* Deprem Detay Özeti */}
      <div className="p-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/10">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
          <ActivityIcon size={14} />
          <span>Son Kayıt Edilen Deprem</span>
        </div>
        <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
          M {eq.magnitude.toFixed(1)} · {eq.region}
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
          Mesafe: {eq.distanceKm} km · Derinlik: {eq.depthKm} km · {eq.source}
        </div>
      </div>

      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
        Sismik Erken Uyarı Parametreleri
      </div>

      {/* Sesli Siren Toggle */}
      <div className="liquid-glass rounded-2xl p-3.5 flex items-center justify-between">
        <div className="pr-3">
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Sesli Siren Uyarısı
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            M 3.5 üzeri yakın sarsıntılarda kritik alarm çal
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={sirenActive}
            onChange={(e) => setSirenActive(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
        </label>
      </div>

      {/* Alarm Mesafe Yarıçapı */}
      <div className="liquid-glass rounded-2xl p-3.5 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Alarm Mesafe Yarıçapı
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Bulunduğunuz konum merkezli alan
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-sky-600 dark:text-sky-400 focus:outline-none"
          >
            <option value={50}>50 km</option>
            <option value={100}>100 km</option>
            <option value={150}>150 km</option>
            <option value={250}>250 km</option>
          </select>
        </div>
      </div>

      {/* Kaydet Butonu */}
      <button
        type="button"
        onClick={handleSave}
        className="w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all duration-150 active:scale-[0.97] flex items-center justify-center gap-2 shadow-sm"
      >
        {saved ? (
          <>
            <CheckIcon size={16} className="text-emerald-500" />
            <span>Ayarlar Kaydedildi</span>
          </>
        ) : (
          <span>Ayarları Kaydet</span>
        )}
      </button>
    </div>
  );
};
