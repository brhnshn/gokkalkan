/**
 * GÖKKALKAN — Backend API Entegrasyon ve Birim Testleri (`api.test.ts`)
 * Hono `app.request` ile tam döngü HTTP doğrulaması.
 */

import { DashboardResponse, LocationSearchResult } from '@gokkalkan/shared';
import { beforeEach, describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { globalGridCache } from '../src/middleware/geoGridCache.js';

describe('GÖKKALKAN Backend API (/health & /api/v1)', () => {
  beforeEach(() => {
    // Testler arası önbelleği temizle
    globalGridCache.clear();
  });

  describe('GET /health', () => {
    it('200 OK ve geçerli servis durumunu döndürmelidir', async () => {
      const res = await app.request('/health');
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.status).toBe('ok');
      expect(json.service).toBe('gokkalkan-api');
      expect(json.timestamp).toBeDefined();
    });
  });

  describe('GET /api/v1/locations/search', () => {
    it('Boş arama sorgusunda boş dizi döndürmelidir', async () => {
      const res = await app.request('/api/v1/locations/search?q=');
      expect(res.status).toBe(200);

      const json = (await res.json()) as LocationSearchResult[];
      expect(Array.isArray(json)).toBe(true);
      expect(json.length).toBe(0);
    });

    it('Tek harfli sorgularda boş dizi döndürmelidir', async () => {
      const res = await app.request('/api/v1/locations/search?q=a');
      expect(res.status).toBe(200);

      const json = (await res.json()) as LocationSearchResult[];
      expect(json.length).toBe(0);
    });

    it('"Canakkale" araması için geçerli konum sonuçları döndürmelidir', async () => {
      const res = await app.request('/api/v1/locations/search?q=Canakkale');
      expect(res.status).toBe(200);

      const json = (await res.json()) as LocationSearchResult[];
      expect(Array.isArray(json)).toBe(true);
      if (json.length > 0) {
        const first = json[0];
        expect(first.id).toBeDefined();
        expect(first.name).toBeDefined();
        expect(typeof first.lat).toBe('number');
        expect(typeof first.lon).toBe('number');
      }
    });
  });

  describe('GET /api/v1/dashboard', () => {
    it('Varsayılan Türkiye merkezi gösterge panelini eksiksiz şemayla döndürmelidir', async () => {
      const res = await app.request('/api/v1/dashboard');
      expect(res.status).toBe(200);
      expect(res.headers.get('Cache-Control')).toContain('s-maxage=600');
      expect(res.headers.get('X-Cache-Status')).toBe('MISS');

      const data = (await res.json()) as DashboardResponse;

      // 1. Konum doğrulaması
      expect(data.location).toBeDefined();
      expect(data.location.name).toContain('Ankara');
      expect(data.location.lat).toBeCloseTo(39.93, 1);
      expect(data.location.lon).toBeCloseTo(32.86, 1);
      expect(typeof data.location.isCoastal).toBe('boolean');

      // 2. Anlık hava durumu doğrulaması
      expect(data.current).toBeDefined();
      expect(typeof data.current.temp).toBe('number');
      expect(typeof data.current.apparentTemp).toBe('number');
      expect(typeof data.current.high).toBe('number');
      expect(typeof data.current.low).toBe('number');
      expect(typeof data.current.conditionCode).toBe('number');
      expect(typeof data.current.conditionText).toBe('string');
      expect(data.current.conditionText.length).toBeGreaterThan(0);
      expect(typeof data.current.windSpeedKmh).toBe('number');
      expect(typeof data.current.humidityPct).toBe('number');
      expect(typeof data.current.visibilityKm).toBe('number');
      expect(data.current.sunsetTime).toMatch(/^\d{2}:\d{2}$/);
      expect(data.current.sunriseTime).toMatch(/^\d{2}:\d{2}$/);

      // 3. Gökkalkan Sentinel Nöbette doğrulaması
      expect(data.sentinel).toBeDefined();
      expect(['SAFE', 'CAUTION', 'DANGER']).toContain(data.sentinel.level);
      expect(data.sentinel.badgeText).toBe('GÖKKALKAN NÖBETTE');
      expect(typeof data.sentinel.headline).toBe('string');
      expect(typeof data.sentinel.subline).toBe('string');

      // 4. 24 Saatlik zaman çizelgesi doğrulaması
      expect(Array.isArray(data.hourly24)).toBe(true);
      expect(data.hourly24.length).toBeGreaterThanOrEqual(20);
      expect(data.hourly24[0].hourLabel).toBe('Şimdi');

      const firstHour = data.hourly24[0];
      expect(typeof firstHour.temp).toBe('number');
      expect(typeof firstHour.conditionCode).toBe('number');
      expect(['LOW', 'MEDIUM', 'HIGH']).toContain(firstHour.riskLevel);
      expect(firstHour.gauges).toBeDefined();
      expect(firstHour.gauges.precipitationPct).toBeGreaterThanOrEqual(0);
      expect(firstHour.gauges.windKmh).toBeGreaterThanOrEqual(0);
      expect(firstHour.gauges.hailLightningPct).toBeGreaterThanOrEqual(0);
      expect(firstHour.gauges.fireRiskIndex).toBeGreaterThanOrEqual(0);

      // 5. Tarlam zirai risk doğrulaması
      expect(data.agriculture).toBeDefined();
      expect(['DÜŞÜK RİSK', 'ORTA RİSK', 'YÜKSEK RİSK']).toContain(
        data.agriculture.status
      );
      expect(typeof data.agriculture.frostRiskPct).toBe('number');
      expect(typeof data.agriculture.soilMoisturePct).toBe('number');
      expect(typeof data.agriculture.soilTempC).toBe('number');
      expect(typeof data.agriculture.sprayingSuitable).toBe('boolean');
      expect(typeof data.agriculture.recommendation).toBe('string');

      // 6. Denizde uygunluk doğrulaması
      expect(data.marine).toBeDefined();
      expect(typeof data.marine.isAvailable).toBe('boolean');
      expect(['UYGUN', 'DİKKATLİ', 'TEHLİKELİ']).toContain(data.marine.status);
      expect(typeof data.marine.recommendation).toBe('string');

      // 7. 7 Günlük tahmin doğrulaması
      expect(Array.isArray(data.daily7)).toBe(true);
      expect(data.daily7.length).toBeGreaterThanOrEqual(6);
      expect(data.daily7[0].dayName).toBe('Bugün');
      expect(data.daily7[1].dayName).toBe('Yarın');
    });

    it('Aynı grid koordinatında ikinci istekte önbellekten (HIT) yanıt dönmelidir', async () => {
      // 1. İstek: Cache MISS
      const res1 = await app.request('/api/v1/dashboard?lat=40.1467&lon=26.4089');
      expect(res1.status).toBe(200);
      expect(res1.headers.get('X-Cache-Status')).toBe('MISS');

      // 2. İstek: Cache HIT (~1.1 km grid aynı)
      const res2 = await app.request('/api/v1/dashboard?lat=40.1501&lon=26.4102');
      expect(res2.status).toBe(200);
      expect(res2.headers.get('X-Cache-Status')).toBe('HIT');
      expect(res2.headers.get('X-Gokkalkan-Grid')).toBe('grid:40.15:26.41');

      const data2 = await res2.json();
      expect(data2.location).toBeDefined();
    });

    it('Geçersiz koordinatlar verildiğinde Ankara varsayılanına dönmelidir', async () => {
      const res = await app.request('/api/v1/dashboard?lat=invalid&lon=invalid');
      expect(res.status).toBe(200);

      const data = (await res.json()) as DashboardResponse;
      expect(data.location.name).toContain('Ankara');
      expect(data.location.lat).toBeCloseTo(39.93, 1);
      expect(data.location.lon).toBeCloseTo(32.86, 1);
    });

    it('Karasal (iç bölge) koordinatlarda marine.isAvailable false dönmeli ve sistem patlamamalıdır', async () => {
      // Ankara koordinatları (Deniz yok)
      const res = await app.request('/api/v1/dashboard?lat=39.9334&lon=32.8597&name=Ankara');
      expect(res.status).toBe(200);

      const data = (await res.json()) as DashboardResponse;
      expect(data.location.name).toBe('Ankara');
      expect(data.marine.isAvailable).toBe(false);
      expect(data.marine.status).toBe('UYGUN');
      expect(data.agriculture).toBeDefined();
    });
  });

  describe('404 Tanımsız Rota Denetimi', () => {
    it('Bilinmeyen rota için 404 JSON yanıtı döndürmelidir', async () => {
      const res = await app.request('/api/v1/non-existent-route');
      expect(res.status).toBe(404);

      const json = await res.json();
      expect(json.error).toBe('Bulunamadı');
    });
  });
});
