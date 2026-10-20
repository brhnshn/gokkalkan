/**
 * GÖKKALKAN — Ortak Tip Tanımları (`types.ts`)
 * SPEC.md ve CONTEXT.md belgelerine tam uyumlu veri modelleri ve arayüzler.
 * SIFIR EMOJİ KURALI: Tüm metinler profesyonel teknik Türkçe ile tanımlanır.
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type SentinelLevel = 'SAFE' | 'CAUTION' | 'DANGER';
export type AgriRiskStatus = 'DÜŞÜK RİSK' | 'ORTA RİSK' | 'YÜKSEK RİSK';
export type MarineSuitabilityStatus = 'UYGUN' | 'DİKKATLİ' | 'TEHLİKELİ';

/**
 * Konum Bilgisi
 */
export interface LocationInfo {
  name: string;
  admin1?: string;
  lat: number;
  lon: number;
  isCoastal: boolean;
  updatedAt: string;
}

/**
 * Anlık Hava Durumu
 */
export interface CurrentWeather {
  temp: number;
  apparentTemp: number;
  high: number;
  low: number;
  conditionCode: number;
  conditionText: string;
  windSpeedKmh: number;
  humidityPct: number;
  visibilityKm: number;
  sunsetTime: string;
  sunriseTime: string;
}

/**
 * 4'lü SVG Yay Kadran Verileri
 */
export interface ArcGaugesData {
  precipitationPct: number;
  windKmh: number;
  hailLightningPct: number;
  fireRiskIndex: number; // 0 - 100 FWI normalize
}

/**
 * Gökkalkan Nöbette Durum Özeti
 */
export interface SentinelVerdict {
  level: SentinelLevel;
  badgeText: string;      // Örn: "GÖKKALKAN NÖBETTE"
  headline: string;       // Örn: "Bugün risk yok, hava sakin"
  subline: string;        // Örn: "Sonraki 24 saat sakin · Gün batımı 18:27"
}

/**
 * 24 Saatlik Zaman Çizelgesi Dilimi
 */
export interface HourlyRiskSlot {
  timeIso: string;
  hourLabel: string;      // "Şimdi", "03:00", "06:00"...
  temp: number;
  conditionCode: number;
  conditionText: string;
  riskLevel: RiskLevel;
  gauges: ArcGaugesData;
}

/**
 * EMSC Sismik Olay Kaydı
 */
export interface SeismicEvent {
  id: string;
  magnitude: number;
  region: string;
  distanceKm: number;
  hoursAgo: number;
  depthKm: number;
  source: 'EMSC';
  timeIso: string;
  lat?: number;
  lon?: number;
}

/**
 * Tarlam Zirai Risk Raporu
 */
export interface AgriRiskReport {
  status: AgriRiskStatus;
  frostRiskPct: number;
  soilMoisturePct: number;
  soilTempC: number;
  sprayingSuitable: boolean;
  recommendation: string;
}

/**
 * Denizde Uygunluk Raporu
 */
export interface MarineRiskReport {
  isAvailable: boolean;
  status: MarineSuitabilityStatus;
  waveHeightM: number;
  wavePeriodS: number;
  windGustKnots: number;
  recommendation: string;
}

/**
 * 7 Günlük Tahmin Dilimi
 */
export interface DailyForecastSlot {
  dateIso: string;
  dayName: string;
  conditionCode: number;
  conditionText: string;
  tempMin: number;
  tempMax: number;
  precipitationProbPct: number;
  windMaxKmh: number;
}

/**
 * Ana Gösterge Paneli Birleşik Yanıtı (GET /api/v1/dashboard)
 */
export interface DashboardResponse {
  location: LocationInfo;
  current: CurrentWeather;
  sentinel: SentinelVerdict;
  hourly24: HourlyRiskSlot[];
  earthquake: SeismicEvent | null;
  agriculture: AgriRiskReport;
  marine: MarineRiskReport;
  daily7: DailyForecastSlot[];
}

/**
 * Konum Arama Sonucu (GET /api/v1/locations/search)
 */
export interface LocationSearchResult {
  id: number;
  name: string;
  admin1?: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  elevation?: number;
  isCoastal?: boolean;
}

/**
 * Sentinel Karar Motoru Girdi Modeli
 */
export interface SentinelInput {
  hourly?: Array<{
    temp?: number;
    conditionCode?: number;
    riskLevel?: RiskLevel;
    gauges?: Partial<ArcGaugesData>;
  }>;
  earthquake?: {
    magnitude: number;
    distanceKm: number;
    hoursAgo: number;
    region?: string;
  } | null;
  agriculture?: {
    status: AgriRiskStatus;
    frostRiskPct: number;
    recommendation?: string;
  } | null;
  marine?: {
    isAvailable: boolean;
    status: MarineSuitabilityStatus;
    waveHeightM?: number;
    windGustKnots?: number;
    recommendation?: string;
  } | null;
  sunsetTime?: string;
}

/**
 * Coğrafi Grid Anahtarı (~1.1 km çözünürlük)
 */
export interface GeoGridKey {
  gridLat: number; // 2 ondalık basamak (örn. 40.15)
  gridLon: number; // 2 ondalık basamak (örn. 26.41)
  cacheKey: string; // "grid:40.15:26.41"
}
