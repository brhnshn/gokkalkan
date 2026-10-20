/**
 * GÖKKALKAN — EMSC Sismik Portal Dış Servis Entegratörü (`emscService.ts`)
 * European-Mediterranean Seismological Centre (EMSC) FDSN-WS REST API'sini sorgular.
 * Kullanıcı koordinatına göre Haversine formülü ile en yakın depremi tespit eder.
 */

import { calculateHaversineDistance, SeismicEvent } from '@gokkalkan/shared';

export interface EmscFeature {
  id: string;
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number, number]; // [lon, lat, depth]
  };
  properties: {
    source_id?: string;
    time: string;
    flynn_region?: string;
    region?: string;
    lat?: number;
    lon?: number;
    depth?: number;
    mag: number;
    magtype?: string;
    unid?: string;
  };
}

export interface EmscResponse {
  type: string;
  features?: EmscFeature[];
}

const EMSC_TIMEOUT_MS = 6000;

/**
 * Belirtilen koordinat merkezli en yakın depremi getirir.
 * 
 * @param lat Enlem
 * @param lon Boylam
 * @param maxRadiusKm Maksimum arama yarıçapı (varsayılan 500 km)
 */
export async function fetchNearbyEarthquakes(
  lat: number,
  lon: number,
  maxRadiusKm = 500
): Promise<SeismicEvent | null> {
  // EMSC REST API uç noktası
  // 500 km yaklaşık 4.5 derece açısal yarıçapa denk gelir
  const radiusDeg = Math.min(10, Math.max(1, (maxRadiusKm / 111.1)));
  const url = new URL('https://www.seismicportal.eu/fdsnws/event/1/query');
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '30');
  url.searchParams.set('minmagnitude', '2.0');
  url.searchParams.set('lat', lat.toString());
  url.searchParams.set('lon', lon.toString());
  url.searchParams.set('maxradius', radiusDeg.toFixed(2));

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), EMSC_TIMEOUT_MS);

  try {
    let res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });

    // Bölgesel sorgu sonuç vermezse genel son 20 depremi dene
    if (!res.ok) {
      const fallbackUrl = new URL('https://www.seismicportal.eu/fdsnws/event/1/query');
      fallbackUrl.searchParams.set('format', 'json');
      fallbackUrl.searchParams.set('limit', '25');
      fallbackUrl.searchParams.set('minmagnitude', '2.0');

      res = await fetch(fallbackUrl.toString(), {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      });
    }

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as EmscResponse;
    const features = data.features;
    if (!features || !Array.isArray(features) || features.length === 0) {
      return null;
    }

    const now = Date.now();
    let closestEvent: SeismicEvent | null = null;
    let minDistance = Infinity;

    for (const feat of features) {
      const eqLon = feat.geometry?.coordinates?.[0] ?? feat.properties?.lon;
      const eqLat = feat.geometry?.coordinates?.[1] ?? feat.properties?.lat;
      const depth = feat.geometry?.coordinates?.[2] ?? feat.properties?.depth ?? 0;

      if (eqLat === undefined || eqLon === undefined) {
        continue;
      }

      const distanceKm = calculateHaversineDistance(lat, lon, eqLat, eqLon);

      if (distanceKm <= maxRadiusKm) {
        const eventTime = new Date(feat.properties.time).getTime();
        const hoursAgo = Math.max(
          0,
          Math.round(((now - eventTime) / (1000 * 60 * 60)) * 10) / 10
        );

        if (distanceKm < minDistance) {
          minDistance = distanceKm;
          closestEvent = {
            id: feat.id || feat.properties.unid || `eq-${eventTime}`,
            magnitude: Math.round(Number(feat.properties.mag) * 10) / 10,
            region: feat.properties.flynn_region || feat.properties.region || 'Bölge',
            distanceKm: Math.round(distanceKm * 10) / 10,
            hoursAgo,
            depthKm: Math.round(Math.abs(Number(depth))),
            source: 'EMSC',
            timeIso: feat.properties.time,
            lat: eqLat,
            lon: eqLon
          };
        }
      }
    }

    return closestEvent;
  } catch {
    // Sismik veri alınamadığında sistemin kalanını kesintiye uğratmaz
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
