/**
 * GÖKKALKAN — Meteorolojik ve Çevresel Risk Motoru (`riskEngine.ts`)
 * SPEC.md, CONTEXT.md ve Türk tarım/denizcilik pratiklerine uygun formüller.
 * SIFIR EMOJİ KURALI: Tüm durum ve tavsiye metinleri sade, profesyonel teknik Türkçe ile üretilir.
 */

import {
  AgriRiskReport,
  AgriRiskStatus,
  ArcGaugesData,
  GeoGridKey,
  MarineRiskReport,
  MarineSuitabilityStatus,
  RiskLevel,
  SentinelInput,
  SentinelVerdict
} from './types.js';

/**
 * 1. Yangın Tehlike İndeksi (Fire Weather Index - FWI Normalize 0 - 100)
 * 
 * Sıcaklık, bağıl nem ve rüzgar hızının etkileşimini modelleyen bileşik indeks.
 * - Sıcaklık arttıkça ve bağıl nem düştükçe orman/otlak yanıcılığı katlanarak artar.
 * - Rüzgar, alev yayılımını ve oksijen beslemesini hızlandıran çarpan olarak etki eder.
 * 
 * @param tempC 2m hava sıcaklığı (°C)
 * @param humidityPct Bağıl nem (%)
 * @param windSpeedKmh Rüzgar hızı (km/sa)
 * @returns 0 - 100 arası normalize yangın riski puanı (tamsayı)
 */
export function calculateFWI(tempC: number, humidityPct: number, windSpeedKmh: number): number {
  const h = Math.max(0, Math.min(100, humidityPct));
  const w = Math.max(0, windSpeedKmh);
  const t = tempC;

  // Donma noktasının altındaki hava sıcaklıklarında yangın riski oluşmaz
  if (t <= 0) {
    return 0;
  }

  // Sıcaklık faktörü: 5°C altında ihmal edilebilir, 25°C üstünde ivmelenir
  let tempFactor = (t - 5) / 35;
  tempFactor = Math.max(0, Math.min(1, tempFactor));

  // Kuruluk (nem açığı) faktörü: %30 altı nemde yanıcılık katlanır
  const dryness = (100 - h) / 100;
  const drynessFactor = Math.pow(Math.max(0, Math.min(1, dryness)), 1.8);

  // Rüzgar faktörü: 55 km/sa üzeri fırtına yayılım çarpanı
  let windFactor = w / 55;
  windFactor = Math.max(0, Math.min(1.2, windFactor));

  // Temel risk formülü: Sıcaklık ve kuruluk bileşkesi, rüzgar çarpanı ile kuvvetlendirilir
  const baseRisk = (tempFactor * 0.45) + (drynessFactor * 0.55);
  const windMultiplier = 0.4 + (0.6 * windFactor);

  let rawScore = baseRisk * windMultiplier * 100;

  // Aşırı koşul tetikleyicisi (Yüksek sıcaklık + Düşük nem + Kuvvetli rüzgar)
  if (t > 30 && h < 25 && w > 25) {
    const extraBoost = ((t - 30) * 1.2) + ((25 - h) * 1.0) + ((w - 25) * 0.5);
    rawScore += extraBoost;
  }

  // Yüksek nem veya soğuk baskılaması
  if (h > 75) {
    rawScore *= Math.max(0.08, (100 - h) / 25);
  }
  if (t < 12) {
    rawScore *= (t / 12);
  }

  return Math.round(Math.max(0, Math.min(100, rawScore)));
}

/**
 * 2. Tarlam Zirai Risk Analizörü
 * 
 * Toprak sıcaklığı, toprak nemi, gece minimum sıcaklık ve rüzgar hızını harmanlayarak
 * zirai don, kuraklık ve ilaçlama uygunluğunu değerlendirir.
 * 
 * @param soilTempC 0-10 cm toprak sıcaklığı (°C)
 * @param soilMoisturePct Toprak hacimsel nem yüzdesi (%)
 * @param tempMinC Gece beklenen en düşük hava sıcaklığı (°C)
 * @param windSpeedKmh Rüzgar hızı (km/sa)
 */
export function calculateAgriRisk(
  soilTempC: number,
  soilMoisturePct: number,
  tempMinC: number,
  windSpeedKmh: number
): AgriRiskReport {
  const boundedSoilMoisture = Math.max(0, Math.min(100, Math.round(soilMoisturePct)));
  const boundedWind = Math.max(0, windSpeedKmh);

  // 1. Zirai Don Riski Yüzdesi Hesabı
  let frostRiskPct = 0;
  if (tempMinC <= -3) {
    frostRiskPct = 100;
  } else if (tempMinC <= 0) {
    frostRiskPct = Math.round(80 + ((0 - tempMinC) / 3) * 20);
  } else if (tempMinC <= 2) {
    frostRiskPct = Math.round(45 + ((2 - tempMinC) / 2) * 35);
  } else if (tempMinC <= 4) {
    frostRiskPct = Math.round(15 + ((4 - tempMinC) / 2) * 30);
  } else if (tempMinC <= 6) {
    frostRiskPct = Math.round(((6 - tempMinC) / 2) * 15);
  } else {
    frostRiskPct = 0;
  }

  // Toprak sıcaklığı 2°C ve altındaysa kök seviyesinde don riski tabanı
  if (soilTempC <= 2) {
    frostRiskPct = Math.max(frostRiskPct, 45);
  }

  // 2. İlaçlama ve Gübreleme Uygunluğu:
  // - Zirai mücadele standartlarına göre 15 km/saati aşan rüzgarda ilaç sürüklenir.
  // - Yüksek don riski (> %50) veya aşırı çamur (> %85 nem) durumunda ilaçlama yapılmaz.
  const sprayingSuitable = boundedWind <= 15 && frostRiskPct < 50 && boundedSoilMoisture <= 85;

  // 3. Genel Zirai Durum Derecelendirmesi
  let status: AgriRiskStatus = 'DÜŞÜK RİSK';
  if (frostRiskPct >= 70 || boundedSoilMoisture < 15 || tempMinC <= -1) {
    status = 'YÜKSEK RİSK';
  } else if (
    frostRiskPct >= 30 ||
    !sprayingSuitable ||
    boundedSoilMoisture < 25 ||
    boundedSoilMoisture > 80 ||
    soilTempC < 4
  ) {
    status = 'ORTA RİSK';
  }

  // 4. Tavsiye Metni
  let recommendation = '';
  if (frostRiskPct >= 70) {
    recommendation = `Zirai don tehlikesi: Gece sıcaklığı ${tempMinC}°C seviyesine inecek. Örtü altı sistemlerini kapatın ve aktif dondan koruma önlemlerini devreye alın.`;
  } else if (frostRiskPct >= 30) {
    recommendation = `Hafif zirai don riski: Gece en düşük ${tempMinC}°C bekleniyor; çukur ve vadi tabanlarındaki hassas mahsullerde ayaz takibi önerilir.`;
  } else if (boundedSoilMoisture < 20) {
    recommendation = `Toprak nemi yetersiz (%${boundedSoilMoisture}): Kök bölgesinde kuraklık stresi mevcut; planlı sulama yapılması önerilir.`;
  } else if (!sprayingSuitable && boundedWind > 15) {
    recommendation = `Rüzgar hızı yüksek (${Math.round(boundedWind)} km/sa): Zirai ilaçlama ve yapraktan gübreleme sürüklenme riski nedeniyle ertelenmelidir.`;
  } else if (boundedSoilMoisture > 85) {
    recommendation = `Toprak aşırı doymuş (%${boundedSoilMoisture}): Ağır tarım makineleriyle sahaya girilmesi toprak sıkışmasına neden olabilir.`;
  } else if (sprayingSuitable && frostRiskPct < 20) {
    recommendation = `Tarımsal koşullar elverişli: Rüzgar sakin (${Math.round(boundedWind)} km/sa), toprak nemi ve sıcaklığı ideal; ilaçlama ve saha çalışmaları için uygun.`;
  } else {
    recommendation = `Mevsim normallerinde tarımsal koşullar; rutin saha faaliyetleri güvenle sürdürülebilir.`;
  }

  return {
    status,
    frostRiskPct,
    soilMoisturePct: boundedSoilMoisture,
    soilTempC: Math.round(soilTempC * 10) / 10,
    sprayingSuitable,
    recommendation
  };
}

/**
 * 3. Denizde Uygunluk Analizörü
 * 
 * Dalga yüksekliği, dalga periyodu ve rüzgar hamlesine göre küçük tekneler ve
 * amatör balıkçılık için seyir güvenliğini değerlendirir.
 * 
 * @param waveHeightM Anlık/tahmin edilen dalga boyu (metre)
 * @param wavePeriodS Dalga periyodu (saniye)
 * @param windGustKnots Rüzgar hamlesi (knot)
 * @param isCoastal Bölgenin kıyı şeridinde olup olmadığı
 */
export function calculateMarineSuitability(
  waveHeightM: number,
  wavePeriodS: number,
  windGustKnots: number,
  isCoastal: boolean
): MarineRiskReport {
  if (!isCoastal) {
    return {
      isAvailable: false,
      status: 'UYGUN',
      waveHeightM: 0,
      wavePeriodS: 0,
      windGustKnots: Math.round(Math.max(0, windGustKnots)),
      recommendation:
        'Bölge kıyı şeridinde yer almadığı için açık deniz verisi izlenmiyor. Gölet ve iç sularda yerel rüzgar hızını dikkate alınız.'
    };
  }

  const wave = Math.max(0, waveHeightM);
  const period = Math.max(0, wavePeriodS);
  const gust = Math.max(0, windGustKnots);

  let status: MarineSuitabilityStatus = 'UYGUN';
  let recommendation = '';

  // Tehlikeli Deniz Koşulları:
  // - Dalga >= 2.0 metre
  // - Rüzgar hamlesi >= 28 knot (7 Beaufort Fırtınamsı rüzgar)
  // - Kısa periyotlu dik çatlayan dalgalar (dalga >= 1.5m ve periyot < 4.5s)
  if (wave >= 2.0 || gust >= 28 || (wave >= 1.5 && period > 0 && period < 4.5)) {
    status = 'TEHLİKELİ';
    recommendation = `Fırtına ve yüksek dalga (${wave.toFixed(1)}m dalga, ${Math.round(gust)} kt rüzgar): Küçük tekne ve balıkçılık için denize açılmak tehlikelidir.`;
  }
  // Dikkatli Seyir Koşulları:
  // - Dalga 1.2m - 2.0m arası
  // - Rüzgar hamlesi 16 - 28 knot arası
  // - Kısa periyotlu çalkantı (dalga >= 0.8m ve periyot < 4s)
  else if (wave >= 1.2 || gust >= 16 || (wave >= 0.8 && period > 0 && period < 4.0)) {
    status = 'DİKKATLİ';
    recommendation = `Çalkantılı deniz ve boğaz esintisi (${wave.toFixed(1)}m dalga, ${Math.round(gust)} kt rüzgar): Küçük teknelerin tedbirli seyretmesi önerilir.`;
  }
  // Uygun Deniz Koşulları:
  else {
    status = 'UYGUN';
    recommendation = `Deniz sakin ve rüzgar elverişli (${wave.toFixed(1)}m dalga, ${Math.round(gust)} kt rüzgar): Seyir ve balıkçılık için elverişli koşullar.`;
  }

  return {
    isAvailable: true,
    status,
    waveHeightM: Math.round(wave * 10) / 10,
    wavePeriodS: Math.round(period * 10) / 10,
    windGustKnots: Math.round(gust),
    recommendation
  };
}

/**
 * 4. Haversine Küresel Kuş Uçuşu Mesafe Hesaplayıcı
 * 
 * Kullanıcının koordinatları ile deprem merkez üssü arasındaki gerçek küresel mesafeyi (km) hesaplar.
 * 
 * @param lat1 Başlangıç enlemi (derece)
 * @param lon1 Başlangıç boylamı (derece)
 * @param lat2 Hedef enlemi (derece)
 * @param lon2 Hedef boylamı (derece)
 * @returns Kuş uçuşu mesafe (km, 1 ondalık basamak hassasiyetle)
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (
    Number.isNaN(lat1) ||
    Number.isNaN(lon1) ||
    Number.isNaN(lat2) ||
    Number.isNaN(lon2)
  ) {
    return 0;
  }

  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }

  const R = 6371; // Dünya ortalama yarıçapı (km)
  const toRad = Math.PI / 180;

  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  const phi1 = lat1 * toRad;
  const phi2 = lat2 * toRad;

  const sinHalfLat = Math.sin(dLat / 2);
  const sinHalfLon = Math.sin(dLon / 2);

  const a =
    sinHalfLat * sinHalfLat +
    Math.cos(phi1) * Math.cos(phi2) * sinHalfLon * sinHalfLon;

  const clampedA = Math.min(1, Math.max(0, a));
  const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));

  const distance = R * c;
  return Math.round(distance * 10) / 10;
}

/**
 * Tek bir saatlik dilim için bileşik risk seviyesini hesaplar.
 */
export function calculateHourRiskLevel(gauges: ArcGaugesData): RiskLevel {
  const { precipitationPct, windKmh, hailLightningPct, fireRiskIndex } = gauges;

  if (
    windKmh >= 65 ||
    hailLightningPct >= 65 ||
    fireRiskIndex >= 75 ||
    precipitationPct >= 80
  ) {
    return 'HIGH';
  }

  if (
    windKmh >= 35 ||
    hailLightningPct >= 35 ||
    fireRiskIndex >= 40 ||
    precipitationPct >= 40
  ) {
    return 'MEDIUM';
  }

  return 'LOW';
}

/**
 * Coğrafi Koordinatı 2 ondalık basamaklı (~1.1 km) Grid Anahtarına dönüştürür.
 */
export function getGeoGridKey(lat: number, lon: number): GeoGridKey {
  const gridLat = Math.round(lat * 100) / 100;
  const gridLon = Math.round(lon * 100) / 100;
  return {
    gridLat,
    gridLon,
    cacheKey: `grid:${gridLat.toFixed(2)}:${gridLon.toFixed(2)}`
  };
}

/**
 * 5. Gökkalkan Sentinel Karar Motoru (`calculateSentinelVerdict`)
 * 
 * 24 saatlik hava şeridini, deprem yakınlığını, zirai don ve deniz fırtınası verilerini
 * tek bir "GÖKKALKAN NÖBETTE" eylem durumuna (`SAFE`, `CAUTION`, `DANGER`),
 * başlığa ve açıklayıcı alt metne sentezler.
 */
export function calculateSentinelVerdict(input: SentinelInput): SentinelVerdict {
  const BADGE = 'GÖKKALKAN NÖBETTE';
  const sunsetSuffix = input.sunsetTime ? ` · Gün batımı ${input.sunsetTime}` : '';

  // 1. 24 Saatlik Maksimum Parametreleri Tara
  const hourly = input.hourly || [];
  let maxWindKmh = 0;
  let maxPrecipPct = 0;
  let maxHailLightningPct = 0;
  let maxFireRiskIndex = 0;
  let minTemp = 999;

  for (const h of hourly) {
    if (h.temp !== undefined && h.temp < minTemp) {
      minTemp = h.temp;
    }
    if (h.gauges) {
      if ((h.gauges.windKmh || 0) > maxWindKmh) maxWindKmh = h.gauges.windKmh || 0;
      if ((h.gauges.precipitationPct || 0) > maxPrecipPct)
        maxPrecipPct = h.gauges.precipitationPct || 0;
      if ((h.gauges.hailLightningPct || 0) > maxHailLightningPct)
        maxHailLightningPct = h.gauges.hailLightningPct || 0;
      if ((h.gauges.fireRiskIndex || 0) > maxFireRiskIndex)
        maxFireRiskIndex = h.gauges.fireRiskIndex || 0;
    }
  }

  const eq = input.earthquake;
  const agri = input.agriculture;
  const marine = input.marine;

  // --- KRİTİK TEHLİKE (DANGER) KONTROLLERİ ---

  // A. Deprem Alarmı: Yakın ve hissedilir büyüklükte son 12 saatteki deprem
  if (eq && eq.hoursAgo <= 12) {
    if (eq.magnitude >= 5.0 && eq.distanceKm <= 80) {
      return {
        level: 'DANGER',
        badgeText: BADGE,
        headline: `Bölgede Şiddetli Deprem Aktivitesi (M${eq.magnitude.toFixed(1)})`,
        subline: `${eq.region || 'Bölge'} merkezli ${Math.round(eq.distanceKm)} km mesafede son ${Math.round(eq.hoursAgo)} saatte kaydedildi. Güvenli alanlarda bulununuz.`
      };
    }
    if (eq.magnitude >= 6.0 && eq.distanceKm <= 200) {
      return {
        level: 'DANGER',
        badgeText: BADGE,
        headline: `Bölgesel Büyük Deprem Hissedildi (M${eq.magnitude.toFixed(1)})`,
        subline: `${eq.region || 'Yakın bölge'} merkezli ${Math.round(eq.distanceKm)} km mesafede hissedilen sismik hareket.`
      };
    }
  }

  // B. Fırtına Alarmı (>= 75 km/sa)
  if (maxWindKmh >= 75) {
    return {
      level: 'DANGER',
      badgeText: BADGE,
      headline: `Şiddetli Fırtına Alarmı (${Math.round(maxWindKmh)} km/sa)`,
      subline: `Önümüzdeki 24 saat içinde yıkıcı rüzgar hamleleri bekleniyor. Açık alanlarda ve çatılarda tedbir alınız.`
    };
  }

  // C. Dolu ve Yıldırım Alarmı (>= 70)
  if (maxHailLightningPct >= 70) {
    return {
      level: 'DANGER',
      badgeText: BADGE,
      headline: 'Kuvvetli Dolu ve Yıldırım Uyarısı',
      subline: 'Konvektif fırtına hücreleri bekleniyor; araçları ve tarım alanlarını dolu riskine karşı koruyunuz.'
    };
  }

  // D. Aşırı Yangın Alarmı (>= 80)
  if (maxFireRiskIndex >= 80) {
    return {
      level: 'DANGER',
      badgeText: BADGE,
      headline: 'Aşırı Orman Yangını Tehlikesi',
      subline: 'Yüksek sıcaklık, kuraklık ve sert rüzgar orman yangını riskini kritik seviyeye taşıdı. Açıkta ateş yakmayınız.'
    };
  }

  // E. Şiddetli Zirai Don Alarmı
  if (agri && agri.status === 'YÜKSEK RİSK' && agri.frostRiskPct >= 75) {
    return {
      level: 'DANGER',
      badgeText: BADGE,
      headline: `Şiddetli Zirai Don Alarmı (%${agri.frostRiskPct})`,
      subline: `Gece sıcaklığı donma noktasının altına inecek. Seralarda ısıtma ve mahsul koruma sistemlerini aktif ediniz.`
    };
  }

  // F. Tehlikeli Deniz Koşulları
  if (marine && marine.isAvailable && marine.status === 'TEHLİKELİ') {
    return {
      level: 'DANGER',
      badgeText: BADGE,
      headline: `Denizde Fırtına ve Yüksek Dalga (${marine.waveHeightM ?? 2}m)`,
      subline: `${marine.recommendation || 'Küçük teknelerin denize açılması tehlikelidir.'}${sunsetSuffix}`
    };
  }

  // --- DİKKAT (CAUTION) KONTROLLERİ ---

  // G. Deprem Takibi
  if (eq && eq.hoursAgo <= 12 && eq.magnitude >= 4.0 && eq.distanceKm <= 100) {
    return {
      level: 'CAUTION',
      badgeText: BADGE,
      headline: `Yakın Çevrede Deprem Hissedildi (M${eq.magnitude.toFixed(1)})`,
      subline: `${eq.region || 'Yakın bölge'} merkezli, ${Math.round(eq.distanceKm)} km mesafede son ${Math.round(eq.hoursAgo)} saatte kaydedildi.`
    };
  }

  // H. Kuvvetli Rüzgar (45 - 74 km/sa)
  if (maxWindKmh >= 45) {
    return {
      level: 'CAUTION',
      badgeText: BADGE,
      headline: `Kuvvetli Rüzgar ve Hamleler (${Math.round(maxWindKmh)} km/sa)`,
      subline: `Gün içinde sert esintiler ve anlık rüzgar hamleleri etkili olacak.${sunsetSuffix}`
    };
  }

  // I. Dolu / Yıldırım Olasılığı (40 - 69)
  if (maxHailLightningPct >= 40) {
    return {
      level: 'CAUTION',
      badgeText: BADGE,
      headline: 'Gök Gürültülü Sağanak İhtimali',
      subline: `Yerel fırtına hücreleri ve kısa süreli yıldırım aktivitesi bekleniyor.${sunsetSuffix}`
    };
  }

  // J. Belirgin Yağış (>= 50%)
  if (maxPrecipPct >= 50) {
    return {
      level: 'CAUTION',
      badgeText: BADGE,
      headline: 'Yağış Geçişleri Bekleniyor',
      subline: `Günün belirli saatlerinde yağmur ihtimali yüksek (%${Math.round(maxPrecipPct)}). Şemsiye bulundurunuz.${sunsetSuffix}`
    };
  }

  // K. Yangın Riski Dikkat (50 - 79)
  if (maxFireRiskIndex >= 50) {
    return {
      level: 'CAUTION',
      badgeText: BADGE,
      headline: 'Yüksek Yangın Hassasiyeti',
      subline: `Kuru hava ve esintili koşullar nedeniyle ormanlık ve kırsal alanlarda dikkatli olunmalıdır.${sunsetSuffix}`
    };
  }

  // L. Zirai Don veya Tarım Uyarısı
  if (agri && (agri.status === 'ORTA RİSK' || agri.frostRiskPct >= 35)) {
    return {
      level: 'CAUTION',
      badgeText: BADGE,
      headline: 'Hafif Zirai Don ve Ayaz Riski',
      subline: `${agri.recommendation || 'Hassas mahsullerde ayaz takibi önerilir.'}${sunsetSuffix}`
    };
  }

  // M. Denizde Dikkatli Seyir
  if (marine && marine.isAvailable && marine.status === 'DİKKATLİ') {
    return {
      level: 'CAUTION',
      badgeText: BADGE,
      headline: 'Denizde Çalkantı ve Esinti',
      subline: `${marine.recommendation || 'Küçük teknelerin tedbirli seyretmesi önerilir.'}${sunsetSuffix}`
    };
  }

  // --- SAKİN VE GÜVENLİ (SAFE) ---
  return {
    level: 'SAFE',
    badgeText: BADGE,
    headline: 'Bugün risk yok, hava sakin',
    subline: `Sonraki 24 saat boyunca olağandışı bir meteorolojik risk beklenmiyor.${sunsetSuffix}`
  };
}
