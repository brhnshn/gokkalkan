/**
 * GÖKKALKAN — Çekirdek Hono Uygulaması (`app.ts`)
 * Cloudflare Worker ve Node.js (VDS) üzerinde %100 taşınabilir REST API.
 */

import {
  calculateAgriRisk,
  calculateFWI,
  calculateHourRiskLevel,
  calculateMarineSuitability,
  calculateSentinelVerdict,
  CurrentWeather,
  DailyForecastSlot,
  DashboardResponse,
  HourlyRiskSlot,
  LocationInfo,
  RiskLevel
} from '@gokkalkan/shared';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getGeoGridKey, globalGridCache, setCacheHeaders } from './middleware/geoGridCache.js';
import { fetchNearbyEarthquakes } from './services/emscService.js';
import {
  fetchMarineData,
  fetchWeatherData,
  reverseGeocode,
  searchLocations
} from './services/openMeteoService.js';
import {
  getConditionText,
  getHailLightningProbability,
  getTurkishDayName
} from './utils/weatherCodeMapper.js';

export const app = new Hono();

// Global CORS Middleware
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposeHeaders: ['X-Gokkalkan-Grid', 'X-Cache-Status']
  })
);

// Global Error Handler
app.onError((err, c) => {
  console.error('[GÖKKALKAN API ERROR]:', err);
  return c.json(
    {
      error: 'İç Sunucu Hatası',
      message: err.message || 'Beklenmeyen bir hata oluştu'
    },
    500
  );
});

// 404 Handler
app.notFound((c) => {
  return c.json(
    {
      error: 'Bulunamadı',
      message: 'İstenen API uç noktası mevcut değil'
    },
    404
  );
});

/**
 * GET /health
 * Sistem sağlık denetimi (Docker & Monitoring için)
 */
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'gokkalkan-api',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/v1/locations/search?q={query}
 * Konum arama uç noktası
 */
app.get('/api/v1/locations/search', async (c) => {
  const query = c.req.query('q') || '';
  if (!query || query.trim().length === 0) {
    return c.json([]);
  }

  const results = await searchLocations(query);
  return c.json(results);
});

/**
 * GET /api/v1/dashboard?lat={lat}&lon={lon}&name={name}
 * Birleşik Gösterge Paneli Uç Noktası
 */
app.get('/api/v1/dashboard', async (c) => {
  // Koordinat kontrolü: Eksikse varsayılan Türkiye merkezi (Ankara)
  let lat = parseFloat(c.req.query('lat') || '');
  let lon = parseFloat(c.req.query('lon') || '');
  let name = c.req.query('name');

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    lat = 39.9334;
    lon = 32.8597;
    name = name || 'Ankara (Merkez)';
  } else if (!name || name === 'Konumum' || name.startsWith('Konum') || /^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(name)) {
    // Koordinatlar var ancak isim belirsizse gerçek tersine coğrafi kodlama ile Türkçe il/ilçe çözümlenir
    name = await reverseGeocode(lat, lon);
  }

  // 1. Coğrafi Grid Önbellek Denetimi (10 dakika TTL)
  const grid = getGeoGridKey(lat, lon);
  const cachedResponse = globalGridCache.get<DashboardResponse>(grid.cacheKey);
  if (cachedResponse) {
    setCacheHeaders(c, grid.cacheKey, true);
    return c.json(cachedResponse);
  }

  // 2. Dış API'leri Paralel Olarak Çek (Hata toleranslı)
  const [weatherResult, marineResult, eqResult] = await Promise.allSettled([
    fetchWeatherData(lat, lon),
    fetchMarineData(lat, lon),
    fetchNearbyEarthquakes(lat, lon, 500)
  ]);

  if (weatherResult.status === 'rejected') {
    throw new Error(
      `Meteoroloji verisi temin edilemedi: ${weatherResult.reason?.message || 'Bilinmeyen hata'}`
    );
  }

  const weather = weatherResult.value;
  const marineData = marineResult.status === 'fulfilled' ? marineResult.value : null;
  const earthquake = eqResult.status === 'fulfilled' ? eqResult.value : null;

  // 3. Zaman Eşleme: Yerel saat dilimine göre anlık saat dilimini bul
  let currentHourIso = '';
  try {
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: weather.timezone || 'auto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    currentHourIso = formatter.format(new Date()).replace(' ', 'T').slice(0, 13) + ':00';
  } catch {
    currentHourIso = new Date().toISOString().slice(0, 13) + ':00';
  }

  let currentIndex = weather.hourly.time.indexOf(currentHourIso);
  if (currentIndex === -1) {
    currentIndex = weather.hourly.time.findIndex((t) => t >= currentHourIso);
    if (currentIndex === -1) {
      currentIndex = 0;
    }
  }

  // 4. Anlık Hava Durumu (`current`)
  const currentTemp = Math.round(weather.hourly.temperature_2m[currentIndex] ?? 15);
  const apparentTemp = Math.round(weather.hourly.apparent_temperature[currentIndex] ?? currentTemp);
  const currentWindSpeed = Math.round(weather.hourly.wind_speed_10m[currentIndex] ?? 10);
  const currentHumidity = Math.round(weather.hourly.relative_humidity_2m[currentIndex] ?? 60);
  const conditionCode = weather.hourly.weather_code[currentIndex] ?? 0;
  const conditionText = getConditionText(conditionCode);

  const rawVis = weather.hourly.visibility[currentIndex] ?? 10000;
  const visibilityKm = Math.round(rawVis / 1000);

  const sunsetTime = weather.daily.sunset[0]?.slice(11, 16) ?? '18:30';
  const sunriseTime = weather.daily.sunrise[0]?.slice(11, 16) ?? '07:00';

  const current: CurrentWeather = {
    temp: currentTemp,
    apparentTemp,
    high: Math.round(weather.daily.temperature_2m_max[0] ?? currentTemp + 3),
    low: Math.round(weather.daily.temperature_2m_min[0] ?? currentTemp - 4),
    conditionCode,
    conditionText,
    windSpeedKmh: currentWindSpeed,
    humidityPct: currentHumidity,
    visibilityKm,
    sunsetTime,
    sunriseTime
  };

  // 5. 24 Saatlik Zaman Çizelgesi (`hourly24`)
  const hourly24: HourlyRiskSlot[] = [];
  const totalHours = weather.hourly.time.length;
  const endHourIndex = Math.min(currentIndex + 24, totalHours);

  for (let i = currentIndex; i < endHourIndex; i++) {
    const timeIso = weather.hourly.time[i];
    const hourLabel = i === currentIndex ? 'Şimdi' : timeIso.slice(11, 16);
    const temp = Math.round(weather.hourly.temperature_2m[i] ?? 15);
    const hCode = weather.hourly.weather_code[i] ?? 0;
    const hConditionText = getConditionText(hCode);

    const precipPct = Math.round(weather.hourly.precipitation_probability[i] ?? 0);
    const windKmh = Math.round(weather.hourly.wind_speed_10m[i] ?? 0);
    const hailLightningPct = getHailLightningProbability(hCode, precipPct);
    const humidity = weather.hourly.relative_humidity_2m[i] ?? 60;
    const fireRiskIndex = calculateFWI(temp, humidity, windKmh);

    const gauges = {
      precipitationPct: precipPct,
      windKmh,
      hailLightningPct,
      fireRiskIndex
    };

    const riskLevel: RiskLevel = calculateHourRiskLevel(gauges);

    hourly24.push({
      timeIso,
      hourLabel,
      temp,
      conditionCode: hCode,
      conditionText: hConditionText,
      riskLevel,
      gauges
    });
  }

  // 6. Tarlam Zirai Risk Raporu (`agriculture`)
  const soilTempC =
    weather.hourly.soil_temperature_0cm?.[currentIndex] ??
    weather.hourly.temperature_2m[currentIndex] ??
    15;
  const soilMoistureRaw = weather.hourly.soil_moisture_0_to_1cm?.[currentIndex] ?? 0.25;
  // Open-Meteo toprak nemi m³/m³ cinsindendir (örn. 0.28 -> %28)
  const soilMoisturePct = Math.round(
    soilMoistureRaw <= 1.0 ? soilMoistureRaw * 100 : soilMoistureRaw
  );
  const tempMinC = weather.daily.temperature_2m_min[0] ?? 5;

  const agriculture = calculateAgriRisk(
    soilTempC,
    soilMoisturePct,
    tempMinC,
    currentWindSpeed
  );

  // 7. Denizde Uygunluk Raporu (`marine`)
  const windGustKnots = Math.round(
    (weather.hourly.wind_gusts_10m[currentIndex] || currentWindSpeed * 1.3) * 0.539957
  );

  let marine;
  if (marineData?.hourly?.wave_height) {
    const waveHeight = Number(marineData.hourly.wave_height[currentIndex] ?? 0);
    const wavePeriod = Number(marineData.hourly.wave_period?.[currentIndex] ?? 0);
    marine = calculateMarineSuitability(waveHeight, wavePeriod, windGustKnots, true);
  } else {
    marine = calculateMarineSuitability(0, 0, windGustKnots, false);
  }

  // 8. 7 Günlük Tahmin Dilimi (`daily7`)
  const daily7: DailyForecastSlot[] = [];
  const maxDays = Math.min(7, weather.daily.time.length);

  for (let d = 0; d < maxDays; d++) {
    const dateIso = weather.daily.time[d];
    const dCode = weather.daily.weather_code[d] ?? 0;

    daily7.push({
      dateIso,
      dayName: getTurkishDayName(dateIso, d),
      conditionCode: dCode,
      conditionText: getConditionText(dCode),
      tempMin: Math.round(weather.daily.temperature_2m_min[d] ?? 10),
      tempMax: Math.round(weather.daily.temperature_2m_max[d] ?? 20),
      precipitationProbPct: Math.round(
        weather.daily.precipitation_probability_max[d] ?? 0
      ),
      windMaxKmh: Math.round(weather.daily.wind_speed_10m_max[d] ?? 15)
    });
  }

  // 9. Gökkalkan Sentinel Karar Motoru (`sentinel`)
  const sentinel = calculateSentinelVerdict({
    hourly: hourly24,
    earthquake,
    agriculture,
    marine,
    sunsetTime
  });

  // 10. Konum Bilgisi (`location`)
  const location: LocationInfo = {
    name,
    lat: Math.round(lat * 10000) / 10000,
    lon: Math.round(lon * 10000) / 10000,
    isCoastal: marine.isAvailable,
    updatedAt: new Date().toISOString()
  };

  const responseData: DashboardResponse = {
    location,
    current,
    sentinel,
    hourly24,
    earthquake,
    agriculture,
    marine,
    daily7
  };

  // 11. Önbelleğe Kaydet ve Yanıt Başlıklarını Ayarla
  globalGridCache.set(grid.cacheKey, responseData);
  setCacheHeaders(c, grid.cacheKey, false);

  return c.json(responseData);
});
