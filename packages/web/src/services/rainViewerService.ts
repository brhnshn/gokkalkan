/**
 * RainViewer Meteoroloji Radar Servisi (GÖKKALKAN)
 * 
 * RainViewer API v2 üzerinden canlı radar reflektivite ve nowcasting
 * zaman damgalarını çeker. Çevrimdışı ve hata durumunda güvenli fallback sağlar.
 */

export interface RainViewerFrame {
  time: number; // Unix timestamp (saniye)
  path: string; // e.g. "/v2/radar/1729420800"
}

export interface RainViewerData {
  version: string;
  generated: number;
  host: string;
  radar: {
    past: RainViewerFrame[];
    nowcast: RainViewerFrame[];
  };
}

const RAINVIEWER_API_ENDPOINT = 'https://api.rainviewer.com/public/weather-maps.json';
const DEFAULT_HOST = 'https://tilecache.rainviewer.com';

/**
 * RainViewer Tile URL oluşturucu
 * Şablon: {host}{path}/256/{z}/{x}/{y}/{colorScheme}/{smooth}_{snow}.png
 * colorScheme 2: TITAN renk paleti (standart meteorolojik radar renkleri)
 */
export function getRadarTileUrl(
  host: string,
  path: string,
  colorScheme: number = 2,
  smooth: number = 1,
  snow: number = 1
): string {
  const cleanHost = host.endsWith('/') ? host.slice(0, -1) : host;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanHost}${cleanPath}/256/{z}/{x}/{y}/${colorScheme}/${smooth}_${snow}.png`;
}

/**
 * Güvenli çevrimdışı fallback verisi üretici
 * 10 dakikalık aralıklarla son 2 saat ve gelecek 1 saati modeller.
 */
export function generateFallbackRadarData(): RainViewerData {
  const nowSec = Math.floor(Date.now() / 1000);
  const roundedNow = Math.floor(nowSec / 600) * 600;

  const past: RainViewerFrame[] = [];
  for (let i = 12; i >= 0; i--) {
    const time = roundedNow - i * 600;
    past.push({
      time,
      path: `/v2/radar/${time}`,
    });
  }

  const nowcast: RainViewerFrame[] = [];
  for (let i = 1; i <= 6; i++) {
    const time = roundedNow + i * 600;
    nowcast.push({
      time,
      path: `/v2/radar/nowcast_${time}`,
    });
  }

  return {
    version: '2.0-fallback',
    generated: roundedNow,
    host: DEFAULT_HOST,
    radar: {
      past,
      nowcast,
    },
  };
}

// Bellek içi önbellek (Cache for 2 minutes to avoid API spam)
let cachedData: RainViewerData | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 2 * 60 * 1000;

/**
 * RainViewer radar meta verilerini çeker
 */
export async function fetchRainViewerData(): Promise<RainViewerData> {
  const now = Date.now();
  if (cachedData && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedData;
  }

  try {
    const response = await fetch(RAINVIEWER_API_ENDPOINT, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`RainViewer HTTP error: ${response.status}`);
    }

    const data: RainViewerData = await response.json();
    if (!data.host || !data.radar || !Array.isArray(data.radar.past)) {
      throw new Error('Invalid RainViewer schema');
    }

    cachedData = data;
    lastFetchTime = now;
    return data;
  } catch (error) {
    console.warn('RainViewer verisi çekilemedi, çevrimdışı fallback kullanılıyor:', error);
    return cachedData ?? generateFallbackRadarData();
  }
}

/**
 * timeOffsetMin (-120 ile +60 dakika) değerine göre en uygun radar karesini seçer
 */
export function findFrameByOffset(
  radarData: RainViewerData,
  offsetMin: number
): { frame: RainViewerFrame; tileUrl: string } | null {
  const { host, radar } = radarData;

  if (offsetMin > 0 && radar.nowcast && radar.nowcast.length > 0) {
    // Gelecek tahmin nowcast
    const targetSeconds = (offsetMin) * 60;
    const baseTime = radar.past.length > 0 ? radar.past[radar.past.length - 1].time : Math.floor(Date.now() / 1000);
    const targetTimestamp = baseTime + targetSeconds;

    // Hedefe en yakın nowcast karesini bul
    let best = radar.nowcast[0];
    let minDiff = Math.abs(best.time - targetTimestamp);

    for (const frame of radar.nowcast) {
      const diff = Math.abs(frame.time - targetTimestamp);
      if (diff < minDiff) {
        minDiff = diff;
        best = frame;
      }
    }

    return {
      frame: best,
      tileUrl: getRadarTileUrl(host, best.path),
    };
  }

  // Geçmiş / Canlı radar
  if (!radar.past || radar.past.length === 0) {
    return null;
  }

  if (offsetMin === 0) {
    // En güncel anlık radar karesi
    const latest = radar.past[radar.past.length - 1];
    return {
      frame: latest,
      tileUrl: getRadarTileUrl(host, latest.path),
    };
  }

  // offsetMin < 0: Geçmiş karesi bul
  const latestTime = radar.past[radar.past.length - 1].time;
  const targetTimestamp = latestTime + offsetMin * 60;

  let best = radar.past[0];
  let minDiff = Math.abs(best.time - targetTimestamp);

  for (const frame of radar.past) {
    const diff = Math.abs(frame.time - targetTimestamp);
    if (diff < minDiff) {
      minDiff = diff;
      best = frame;
    }
  }

  return {
    frame: best,
    tileUrl: getRadarTileUrl(host, best.path),
  };
}
