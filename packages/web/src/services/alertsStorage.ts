/**
 * GÖKKALKAN — Nöbet Kuralları ve Uyarı Depolama Servisi (`alertsStorage.ts`)
 * SIFIR EMOJİ KURALI (%100): Profesyonel teknik terminoloji.
 */

export interface SentinelRule {
  id: 'frost' | 'seismic' | 'marine' | 'fire';
  title: string;
  desc: string;
  enabled: boolean;
  thresholdValue: number;
  thresholdUnit: string;
  thresholdLabel: string;
  colorType: 'amber' | 'rose' | 'sky' | 'orange';
}

export interface AlertHistoryItem {
  id: string;
  title: string;
  desc: string;
  category: 'frost' | 'seismic' | 'marine' | 'fire';
  severity: 'critical' | 'warning' | 'info';
  timestampIso: string;
  timeAgoLabel: string;
  locationName: string;
}

const STORAGE_KEY_RULES = 'GOKKALKAN_ALERT_RULES_V1';
const STORAGE_KEY_HISTORY = 'GOKKALKAN_ALERT_HISTORY_V1';

export const DEFAULT_RULES: SentinelRule[] = [
  {
    id: 'frost',
    title: 'Zirai Don Erken Uyarısı',
    desc: 'Gece en düşük sıcaklığı 2.0°C altına indiğinde zirai don riski uyarısı verir.',
    enabled: true,
    thresholdValue: 2.0,
    thresholdUnit: '°C',
    thresholdLabel: 'Gece Min Sıcaklık',
    colorType: 'amber',
  },
  {
    id: 'seismic',
    title: 'Sismik Erken Uyarı Radarı',
    desc: 'Konumunuza 150 km mesafede M 3.0 ve üzeri deprem tespit edildiğinde acil bildirim iletir.',
    enabled: true,
    thresholdValue: 3.0,
    thresholdUnit: 'M',
    thresholdLabel: 'Deprem Büyüklüğü (M ≥ 3.0 / 150 km)',
    colorType: 'rose',
  },
  {
    id: 'marine',
    title: 'Deniz Fırtınası & Hamle',
    desc: 'Rüzgâr hamlesi 25 knot veya dalga boyu 1.8 m üzerine çıktığında denizcilik ikazı üretir.',
    enabled: true,
    thresholdValue: 25,
    thresholdUnit: 'knot',
    thresholdLabel: 'Rüzgâr Hamlesi Eşiği',
    colorType: 'sky',
  },
  {
    id: 'fire',
    title: 'Yangın Hava İndeksi Uyarısı (FWI)',
    desc: 'Hava sıcaklığı, düşük nem ve sert rüzgâr kombinasyonuyla FWI 35 aşıldığında orman yangını nöbeti açar.',
    enabled: false,
    thresholdValue: 35,
    thresholdUnit: 'FWI',
    thresholdLabel: 'Orman Yangın İndeksi',
    colorType: 'orange',
  },
];

export const DEFAULT_HISTORY: AlertHistoryItem[] = [
  {
    id: 'hist-1',
    title: 'Kuzey Ege Sismik Hareketlilik',
    desc: 'EMSC: M 3.4 büyüklüğünde sarsıntı kaydedildi (Derinlik: 9.8 km, Mesafe: 72 km).',
    category: 'seismic',
    severity: 'warning',
    timestampIso: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    timeAgoLabel: '4 saat önce',
    locationName: 'Saros Körfezi',
  },
  {
    id: 'hist-2',
    title: 'Boğaz Hattı Fırtına Hamlesi',
    desc: 'Poyraz rüzgâr hamlesi 28 knot seviyesine ulaştı. Boğaz feribot seferlerinde teyakkuz.',
    category: 'marine',
    severity: 'warning',
    timestampIso: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    timeAgoLabel: '14 saat önce',
    locationName: 'Çanakkale Boğazı',
  },
  {
    id: 'hist-3',
    title: 'Ezine Ovası Zirai Don Tehdidi',
    desc: 'Gece 04:30 civarında yer sıcaklığı 1.2°C seviyesine geriledi. Meyve bahçelerinde don nöbeti.',
    category: 'frost',
    severity: 'critical',
    timestampIso: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    timeAgoLabel: 'Dün gece',
    locationName: 'Ezine Ovası',
  },
  {
    id: 'hist-4',
    title: 'Kaz Dağları Eteği Yangın Risk Nöbeti',
    desc: 'Bağıl nem %22 seviyesine indi, rüzgâr 22 km/sa. FWI 38 olarak hesaplandı.',
    category: 'fire',
    severity: 'info',
    timestampIso: new Date(Date.now() - 42 * 3600 * 1000).toISOString(),
    timeAgoLabel: '2 gün önce',
    locationName: 'Bayramiç / Kaz Dağları',
  },
];

export const getAlertRules = (): SentinelRule[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RULES);
    if (!raw) return DEFAULT_RULES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === DEFAULT_RULES.length) {
      return parsed;
    }
    return DEFAULT_RULES;
  } catch {
    return DEFAULT_RULES;
  }
};

export const saveAlertRules = (rules: SentinelRule[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(rules));
  } catch (err) {
    console.error('Nöbet kuralları kaydedilemedi:', err);
  }
};

export const getAlertHistory = (): AlertHistoryItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(DEFAULT_HISTORY));
      return DEFAULT_HISTORY;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_HISTORY;
  } catch {
    return DEFAULT_HISTORY;
  }
};
