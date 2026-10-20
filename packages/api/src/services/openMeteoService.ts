/**
 * GÖKKALKAN — Open-Meteo Dış Servis Entegratörü (`openMeteoService.ts`)
 * Forecast, Soil, Marine ve Geocoding REST API'lerini tüketir.
 */

import { LocationSearchResult } from '@gokkalkan/shared';

export interface OpenMeteoHourlyWeather {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  apparent_temperature: number[];
  precipitation_probability: number[];
  precipitation: number[];
  weather_code: number[];
  wind_speed_10m: number[];
  wind_gusts_10m: number[];
  visibility: number[];
  soil_temperature_0cm?: number[];
  soil_moisture_0_to_1cm?: number[];
}

export interface OpenMeteoDailyWeather {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weather_code: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  sunrise: string[];
  sunset: string[];
}

export interface OpenMeteoWeatherResponse {
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone: string;
  hourly: OpenMeteoHourlyWeather;
  daily: OpenMeteoDailyWeather;
}

export interface OpenMeteoMarineResponse {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    wave_height: (number | null)[];
    wave_direction?: (number | null)[];
    wave_period: (number | null)[];
    wind_wave_height?: (number | null)[];
  };
}

export interface OpenMeteoGeocodingItem {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code: string;
  country: string;
  admin1?: string;
  admin2?: string;
}

export interface OpenMeteoGeocodingResponse {
  results?: OpenMeteoGeocodingItem[];
}

const TIMEOUT_MS = 6000;

/**
 * Open-Meteo Tahmin & Toprak Verilerini Çeker.
 */
export async function fetchWeatherData(lat: number, lon: number): Promise<OpenMeteoWeatherResponse> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat.toString());
  url.searchParams.set('longitude', lon.toString());
  url.searchParams.set(
    'hourly',
    [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'wind_gusts_10m',
      'visibility',
      'soil_temperature_0cm',
      'soil_moisture_0_to_1cm'
    ].join(',')
  );
  url.searchParams.set(
    'daily',
    [
      'temperature_2m_max',
      'temperature_2m_min',
      'weather_code',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'sunrise',
      'sunset'
    ].join(',')
  );
  url.searchParams.set('timezone', 'auto');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`Open-Meteo Forecast API hatası: HTTP ${res.status}`);
    }

    const data = (await res.json()) as OpenMeteoWeatherResponse;
    if (!data.hourly || !data.daily) {
      throw new Error('Open-Meteo eksik veri formatı döndürdü');
    }

    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Open-Meteo Denizcilik Verilerini Çeker.
 * İç bölgelerde veya hata durumunda null döner, asla patlamaz.
 */
export async function fetchMarineData(
  lat: number,
  lon: number
): Promise<OpenMeteoMarineResponse | null> {
  const url = new URL('https://marine-api.open-meteo.com/v1/marine');
  url.searchParams.set('latitude', lat.toString());
  url.searchParams.set('longitude', lon.toString());
  url.searchParams.set(
    'hourly',
    'wave_height,wave_direction,wave_period,wind_wave_height'
  );
  url.searchParams.set('timezone', 'auto');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });

    if (!res.ok) {
      // 400 Bad Request genellikle karasal (iç bölge) koordinatları gösterir
      return null;
    }

    const data = (await res.json()) as OpenMeteoMarineResponse;
    if (!data.hourly?.wave_height || !Array.isArray(data.hourly.wave_height)) {
      return null;
    }

    // Karasal bölgelerde tüm dalga verileri null gelebilir
    const hasValidWaveData = data.hourly.wave_height.some(
      (h) => h !== null && typeof h === 'number' && !isNaN(h)
    );

    if (!hasValidWaveData) {
      return null;
    }

    return data;
  } catch {
    // Ağ kesintisi veya zaman aşımında sessizce null döner
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Open-Meteo Geocoding Arama API'si üzerinden yerleşim yeri arar.
 */
export async function searchLocations(query: string): Promise<LocationSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', trimmed);
  url.searchParams.set('count', '5');
  url.searchParams.set('language', 'tr');
  url.searchParams.set('format', 'json');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });

    if (!res.ok) {
      return [];
    }

    const data = (await res.json()) as OpenMeteoGeocodingResponse;
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((item) => ({
      id: item.id,
      name: item.name,
      admin1: item.admin1 || item.admin2,
      country: item.country || 'Türkiye',
      countryCode: item.country_code || 'TR',
      lat: item.latitude,
      lon: item.longitude,
      elevation: item.elevation
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Koordinatlardan gerçek Türkçe il/ilçe ismini çözer (Tersine Coğrafi Kodlama).
 * BigDataCloud açık istemci API'si (API anahtarsız, ücretsiz ve hızlı).
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=tr`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });
    if (!res.ok) return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    const data = (await res.json()) as any;
    const district = data.locality || data.city || '';
    const city = data.principalSubdivision || data.countryName || '';
    if (district && city && district !== city) {
      return `${district}, ${city}`;
    }
    return city || district || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  } catch {
    return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  } finally {
    clearTimeout(timeoutId);
  }
}
