import React, { useState, useEffect } from 'react';
import type { DashboardResponse } from '@gokkalkan/shared';
import {
  SentinelRule,
  AlertHistoryItem,
  getAlertRules,
  saveAlertRules,
  getAlertHistory,
} from '../services/alertsStorage';
import { ActiveSentinelStatusCard } from '../components/alerts/ActiveSentinelStatusCard';
import { AlertRuleCard } from '../components/alerts/AlertRuleCard';
import { AlertHistoryTimeline } from '../components/alerts/AlertHistoryTimeline';
import { ShieldCheckIcon } from '../components/icons/SvgIcons';

interface AlertsViewProps {
  dashboardData?: DashboardResponse;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ dashboardData }) => {
  const [rules, setRules] = useState<SentinelRule[]>(() => getAlertRules());

  // Gerçek API verisinden canlı uyarı kayıtları üretimi (Sıfır sahte / hardcoded veri)
  const history: AlertHistoryItem[] = React.useMemo(() => {
    if (!dashboardData) return [];
    const items: AlertHistoryItem[] = [];

    // 1. Gerçek EMSC Deprem Kaydı
    if (dashboardData.earthquake) {
      const eq = dashboardData.earthquake;
      items.push({
        id: `eq-${eq.id}`,
        title: `Sismik Aktivite: M ${eq.magnitude} (${eq.region})`,
        desc: `EMSC: Derinlik ${eq.depthKm} km. Konumunuza kuş uçuşu ${eq.distanceKm} km mesafede sarsıntı tespit edildi.`,
        category: 'seismic',
        severity: eq.magnitude >= 4.0 ? 'critical' : eq.magnitude >= 3.0 ? 'warning' : 'info',
        timestampIso: eq.timeIso,
        timeAgoLabel: `${eq.hoursAgo} saat önce`,
        locationName: eq.region,
      });
    }

    // 2. Gerçek Zirai Don / Tarla Riski
    if (dashboardData.agriculture && dashboardData.agriculture.frostRiskPct > 0) {
      const agri = dashboardData.agriculture;
      items.push({
        id: 'agri-frost',
        title: `Zirai Don Riski (%${agri.frostRiskPct})`,
        desc: agri.recommendation || `Toprak sıcaklığı ${agri.soilTempC}°C, nem %${agri.soilMoisturePct}. Don nöbeti devrede.`,
        category: 'frost',
        severity: agri.frostRiskPct >= 50 ? 'critical' : 'warning',
        timestampIso: new Date().toISOString(),
        timeAgoLabel: 'Bugün',
        locationName: dashboardData.location.name,
      });
    }

    // 3. Gerçek Deniz Fırtına Riski (Eğer kıyı bölgesiyse)
    if (dashboardData.marine && dashboardData.marine.isAvailable && dashboardData.marine.status !== 'UYGUN') {
      const m = dashboardData.marine;
      items.push({
        id: 'marine-alert',
        title: `Deniz Durumu: ${m.status}`,
        desc: `Dalga boyu ${m.waveHeightM}m, rüzgâr hamlesi ${m.windGustKnots} knot. ${m.recommendation}`,
        category: 'marine',
        severity: m.status === 'TEHLİKELİ' ? 'critical' : 'warning',
        timestampIso: new Date().toISOString(),
        timeAgoLabel: 'Canlı Uyarı',
        locationName: `${dashboardData.location.name} Açıkları`,
      });
    }

    // 4. Şiddetli Rüzgâr / Fırtına Hamlesi
    if (dashboardData.current && dashboardData.current.windSpeedKmh >= 28) {
      items.push({
        id: 'wind-alert',
        title: `Şiddetli Rüzgâr (${dashboardData.current.windSpeedKmh} km/sa)`,
        desc: 'Bölgede rüzgâr hızı fırtına eşiğinde seyretmektedir. Çatı uçması ve devrilmelere karşı dikkatli olun.',
        category: 'fire',
        severity: dashboardData.current.windSpeedKmh >= 45 ? 'critical' : 'warning',
        timestampIso: new Date().toISOString(),
        timeAgoLabel: 'Şu Anda',
        locationName: dashboardData.location.name,
      });
    }

    return items;
  }, [dashboardData]);

  // Kural Durumu Değiştirme
  const handleToggleRule = (id: SentinelRule['id']) => {
    setRules((prev) => {
      const updated = prev.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      );
      saveAlertRules(updated);
      return updated;
    });
  };

  // Eşik Değeri Hassasiyeti Güncelleme
  const handleUpdateThreshold = (id: SentinelRule['id'], delta: number) => {
    setRules((prev) => {
      const updated = prev.map((r) => {
        if (r.id !== id) return r;
        const step = r.id === 'seismic' || r.id === 'frost' ? 0.5 : 5;
        const newVal = Number((r.thresholdValue + delta * step).toFixed(1));
        return { ...r, thresholdValue: Math.max(0, newVal) };
      });
      saveAlertRules(updated);
      return updated;
    });
  };

  return (
    <div className="space-y-4 px-4 pb-28 pt-2">
      {/* Aktif Nöbet Durumu ve Canlı Değerlendirme Banner'ı */}
      <ActiveSentinelStatusCard rules={rules} dashboardData={dashboardData} />

      {/* 4 Aktif Nöbet Kural Kartları */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheckIcon size={13} />
            <span>Erken Uyarı Eşikleri & Kural Kartları</span>
          </h3>
          <span className="text-[10px] text-slate-400">iOS Liquid Glass</span>
        </div>

        <div className="space-y-2">
          {rules.map((rule) => (
            <AlertRuleCard
              key={rule.id}
              rule={rule}
              onToggle={handleToggleRule}
              onUpdateThreshold={handleUpdateThreshold}
            />
          ))}
        </div>
      </div>

      {/* Geçmiş 48 Saat Uyarı Kayıtları Zaman Çizelgesi */}
      <AlertHistoryTimeline history={history} />
    </div>
  );
};
