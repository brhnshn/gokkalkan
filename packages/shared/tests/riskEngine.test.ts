import { describe, expect, it } from 'vitest';
import {
  calculateAgriRisk,
  calculateFWI,
  calculateHaversineDistance,
  calculateHourRiskLevel,
  calculateMarineSuitability,
  calculateSentinelVerdict,
  getGeoGridKey,
  SentinelInput
} from '../src/index.js';

describe('GÖKKALKAN Risk Motoru Birim Testleri', () => {
  describe('1. calculateFWI (Yangın Tehlike İndeksi)', () => {
    it('0°C ve altındaki sıcaklıklarda yangın riskini 0 olarak hesaplamalıdır', () => {
      expect(calculateFWI(0, 30, 25)).toBe(0);
      expect(calculateFWI(-5, 10, 40)).toBe(0);
    });

    it('Yüksek nem (%80+) ve serin havalarda çok düşük risk (0-10) üretmelidir', () => {
      const risk = calculateFWI(10, 90, 8);
      expect(risk).toBeGreaterThanOrEqual(0);
      expect(risk).toBeLessThanOrEqual(10);
    });

    it('Mevsim normallerinde (20°C, %55 nem, 15 km/sa rüzgar) düşük/orta dengeli risk üretmelidir', () => {
      const risk = calculateFWI(20, 55, 15);
      expect(risk).toBeGreaterThanOrEqual(10);
      expect(risk).toBeLessThanOrEqual(40);
    });

    it('Aşırı sıcak, kuru ve fırtınalı yaz günlerinde (38°C, %15 nem, 45 km/sa rüzgar) yüksek/kritik risk üretmelidir', () => {
      const risk = calculateFWI(38, 15, 45);
      expect(risk).toBeGreaterThanOrEqual(80);
      expect(risk).toBeLessThanOrEqual(100);
    });

    it('Uç değerleri 0 ile 100 arasında sınırlandırmalıdır (clamping)', () => {
      const extremeRisk = calculateFWI(50, 5, 100);
      expect(extremeRisk).toBeLessThanOrEqual(100);
      expect(extremeRisk).toBeGreaterThanOrEqual(0);

      const negativeWind = calculateFWI(25, -10, -50);
      expect(negativeWind).toBeGreaterThanOrEqual(0);
      expect(negativeWind).toBeLessThanOrEqual(100);
    });
  });

  describe('2. calculateAgriRisk (Tarlam Zirai Analizörü)', () => {
    it('-3°C ve altında %100 don riski ve YÜKSEK RİSK üretmelidir', () => {
      const report = calculateAgriRisk(2, 45, -3, 8);
      expect(report.status).toBe('YÜKSEK RİSK');
      expect(report.frostRiskPct).toBe(100);
      expect(report.recommendation).toContain('Zirai don tehlikesi');
    });

    it('0°C ile 2°C arasında orta/yüksek don riski üretmeli ve ilaçlamayı kısıtlamalıdır', () => {
      const report = calculateAgriRisk(4, 50, 1, 10);
      expect(report.frostRiskPct).toBeGreaterThanOrEqual(45);
      expect(report.frostRiskPct).toBeLessThanOrEqual(80);
      expect(report.status).toBe('ORTA RİSK');
    });

    it('Rüzgar hızı 15 km/saati aştığında ilaçlamaya uygun olmamalıdır', () => {
      const report = calculateAgriRisk(14, 55, 12, 22);
      expect(report.sprayingSuitable).toBe(false);
      expect(report.status).toBe('ORTA RİSK');
      expect(report.recommendation).toContain('Rüzgar hızı yüksek');
    });

    it('Sakin rüzgar, ılıman hava ve dengeli toprak neminde ilaçlamaya uygun ve DÜŞÜK RİSK olmalıdır', () => {
      const report = calculateAgriRisk(14, 50, 11, 8);
      expect(report.sprayingSuitable).toBe(true);
      expect(report.status).toBe('DÜŞÜK RİSK');
      expect(report.frostRiskPct).toBe(0);
      expect(report.recommendation).toContain('Tarımsal koşullar elverişli');
    });

    it('Toprak nemi aşırı düşük olduğunda kuraklık stresi ve YÜKSEK RİSK üretmelidir', () => {
      const report = calculateAgriRisk(24, 10, 18, 5);
      expect(report.status).toBe('YÜKSEK RİSK');
      expect(report.recommendation).toContain('Toprak nemi yetersiz');
    });
  });

  describe('3. calculateMarineSuitability (Denizde Uygunluk Analizörü)', () => {
    it('Kıyı şeridinde olmayan iç bölgelerde açık deniz verisini devre dışı bırakmalıdır', () => {
      const report = calculateMarineSuitability(1.5, 5, 20, false);
      expect(report.isAvailable).toBe(false);
      expect(report.status).toBe('UYGUN');
      expect(report.recommendation).toContain('kıyı şeridinde yer almadığı için');
    });

    it('Sakin denizde (0.5m dalga, 8 knot rüzgar) UYGUN raporu üretmelidir', () => {
      const report = calculateMarineSuitability(0.5, 6, 8, true);
      expect(report.isAvailable).toBe(true);
      expect(report.status).toBe('UYGUN');
      expect(report.recommendation).toContain('Deniz sakin ve rüzgar elverişli');
    });

    it('Orta şiddette çalkantıda (1.4m dalga, 18 knot rüzgar) DİKKATLİ raporu üretmelidir', () => {
      const report = calculateMarineSuitability(1.4, 5, 18, true);
      expect(report.status).toBe('DİKKATLİ');
      expect(report.recommendation).toContain('Çalkantılı deniz ve boğaz esintisi');
    });

    it('2 metre üzeri dalga veya 28 knot üzeri rüzgar hamlesinde TEHLİKELİ raporu üretmelidir', () => {
      const reportHighWave = calculateMarineSuitability(2.4, 6, 15, true);
      expect(reportHighWave.status).toBe('TEHLİKELİ');
      expect(reportHighWave.recommendation).toContain('Fırtına ve yüksek dalga');

      const reportGale = calculateMarineSuitability(1.0, 5, 32, true);
      expect(reportGale.status).toBe('TEHLİKELİ');
    });

    it('Kısa periyotlu dik çatlayan dalgalarda (< 4.5s) güvenliği tehlikeye almalıdır', () => {
      const reportChoppy = calculateMarineSuitability(1.6, 3.5, 15, true);
      expect(reportChoppy.status).toBe('TEHLİKELİ');
    });
  });

  describe('4. calculateHaversineDistance (Kuş Uçuşu Mesafe Hesaplayıcı)', () => {
    it('Aynı koordinatlar için 0 km dönmelidir', () => {
      expect(calculateHaversineDistance(40.1467, 26.4086, 40.1467, 26.4086)).toBe(0);
    });

    it('Çanakkale Merkez ile Bozcaada arasındaki mesafeyi doğru aralıkta (~45-55 km) hesaplamalıdır', () => {
      // Çanakkale Merkez: 40.1467, 26.4086
      // Bozcaada Liman: 39.8353, 26.0683
      const dist = calculateHaversineDistance(40.1467, 26.4086, 39.8353, 26.0683);
      expect(dist).toBeGreaterThanOrEqual(44);
      expect(dist).toBeLessThanOrEqual(52);
    });

    it('Çanakkale ile İstanbul arasındaki mesafeyi doğru aralıkta (~230-250 km) hesaplamalıdır', () => {
      // İstanbul: 41.0082, 28.9784
      const dist = calculateHaversineDistance(40.1467, 26.4086, 41.0082, 28.9784);
      expect(dist).toBeGreaterThanOrEqual(230);
      expect(dist).toBeLessThanOrEqual(250);
    });

    it('Geçersiz (NaN) koordinatlarda 0 dönmelidir', () => {
      expect(calculateHaversineDistance(NaN, 26.4, 40.1, 26.4)).toBe(0);
    });
  });

  describe('5. calculateHourRiskLevel & getGeoGridKey', () => {
    it('Kadran değerlerine göre LOW, MEDIUM, HIGH risk seviyesini doğru sınıflandırmalıdır', () => {
      expect(
        calculateHourRiskLevel({
          precipitationPct: 10,
          windKmh: 12,
          hailLightningPct: 5,
          fireRiskIndex: 15
        })
      ).toBe('LOW');

      expect(
        calculateHourRiskLevel({
          precipitationPct: 50,
          windKmh: 15,
          hailLightningPct: 10,
          fireRiskIndex: 20
        })
      ).toBe('MEDIUM');

      expect(
        calculateHourRiskLevel({
          precipitationPct: 20,
          windKmh: 70,
          hailLightningPct: 10,
          fireRiskIndex: 20
        })
      ).toBe('HIGH');
    });

    it('getGeoGridKey koordinatları ~1.1 km için 2 ondalığa yuvarlamalıdır', () => {
      const key = getGeoGridKey(40.1467, 26.4089);
      expect(key.gridLat).toBe(40.15);
      expect(key.gridLon).toBe(26.41);
      expect(key.cacheKey).toBe('grid:40.15:26.41');
    });
  });

  describe('6. calculateSentinelVerdict (GÖKKALKAN Nöbette Karar Motoru)', () => {
    it('Sakin bir günde SAFE seviyesi ve yatıştırıcı başlık üretmelidir', () => {
      const input: SentinelInput = {
        hourly: [
          {
            temp: 16,
            gauges: { precipitationPct: 0, windKmh: 12, hailLightningPct: 0, fireRiskIndex: 10 }
          },
          {
            temp: 18,
            gauges: { precipitationPct: 5, windKmh: 14, hailLightningPct: 0, fireRiskIndex: 12 }
          }
        ],
        sunsetTime: '18:27'
      };

      const verdict = calculateSentinelVerdict(input);
      expect(verdict.level).toBe('SAFE');
      expect(verdict.badgeText).toBe('GÖKKALKAN NÖBETTE');
      expect(verdict.headline).toContain('Bugün risk yok');
      expect(verdict.subline).toContain('18:27');
    });

    it('Yakın ve hissedilir büyüklükte deprem olduğunda DANGER üretmelidir', () => {
      const input: SentinelInput = {
        hourly: [],
        earthquake: {
          magnitude: 5.2,
          distanceKm: 35,
          hoursAgo: 2,
          region: 'Çanakkale Boğazı'
        }
      };

      const verdict = calculateSentinelVerdict(input);
      expect(verdict.level).toBe('DANGER');
      expect(verdict.headline).toContain('Şiddetli Deprem');
      expect(verdict.subline).toContain('35 km');
    });

    it('75 km/sa üzeri rüzgarda Şiddetli Fırtına Alarmı (DANGER) vermelidir', () => {
      const input: SentinelInput = {
        hourly: [
          {
            temp: 12,
            gauges: { precipitationPct: 40, windKmh: 82, hailLightningPct: 15, fireRiskIndex: 20 }
          }
        ]
      };

      const verdict = calculateSentinelVerdict(input);
      expect(verdict.level).toBe('DANGER');
      expect(verdict.headline).toContain('Şiddetli Fırtına Alarmı');
    });

    it('Dolu ve yıldırım %70 ve üzeri olduğunda DANGER uyarısı vermelidir', () => {
      const input: SentinelInput = {
        hourly: [
          {
            temp: 17,
            gauges: { precipitationPct: 60, windKmh: 35, hailLightningPct: 75, fireRiskIndex: 15 }
          }
        ]
      };

      const verdict = calculateSentinelVerdict(input);
      expect(verdict.level).toBe('DANGER');
      expect(verdict.headline).toContain('Dolu ve Yıldırım');
    });

    it('Şiddetli don riski (%75+) durumunda DANGER uyarısı vermelidir', () => {
      const input: SentinelInput = {
        hourly: [{ temp: -2 }],
        agriculture: {
          status: 'YÜKSEK RİSK',
          frostRiskPct: 85
        }
      };

      const verdict = calculateSentinelVerdict(input);
      expect(verdict.level).toBe('DANGER');
      expect(verdict.headline).toContain('Zirai Don Alarmı');
    });

    it('Orta seviye risklerde (örn. 50 km/sa rüzgar) CAUTION seviyesi üretmelidir', () => {
      const input: SentinelInput = {
        hourly: [
          {
            temp: 15,
            gauges: { precipitationPct: 20, windKmh: 52, hailLightningPct: 10, fireRiskIndex: 25 }
          }
        ]
      };

      const verdict = calculateSentinelVerdict(input);
      expect(verdict.level).toBe('CAUTION');
      expect(verdict.headline).toContain('Kuvvetli Rüzgar');
    });

    it('Tehlikeli deniz fırtınasında kıyı bölgesi için DANGER seviyesi üretmelidir', () => {
      const input: SentinelInput = {
        hourly: [],
        marine: {
          isAvailable: true,
          status: 'TEHLİKELİ',
          waveHeightM: 2.5,
          windGustKnots: 34
        }
      };

      const verdict = calculateSentinelVerdict(input);
      expect(verdict.level).toBe('DANGER');
      expect(verdict.headline).toContain('Denizde Fırtına');
    });
  });
});
