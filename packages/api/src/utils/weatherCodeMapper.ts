/**
 * GÖKKALKAN — WMO Hava Durumu Kodu Haritalayıcısı (`weatherCodeMapper.ts`)
 * Dünya Meteoroloji Örgütü (WMO) kodlarını teknik Türkçe ifadelere
 * ve dolu / yıldırım olasılık yüzdelerine dönüştürür.
 * SIFIR EMOJİ KURALI: Sadece profesyonel meteorolojik metinler.
 */

export interface WeatherCodeDetails {
  conditionText: string;
  hailLightningPct: number;
}

const WMO_MAP: Record<number, WeatherCodeDetails> = {
  0: { conditionText: 'Açık', hailLightningPct: 0 },
  1: { conditionText: 'Çoğunlukla Açık', hailLightningPct: 0 },
  2: { conditionText: 'Parçalı Bulutlu', hailLightningPct: 0 },
  3: { conditionText: 'Kapalı', hailLightningPct: 5 },
  45: { conditionText: 'Sisli', hailLightningPct: 0 },
  48: { conditionText: 'Kırağılı Yoğun Sis', hailLightningPct: 0 },
  51: { conditionText: 'Hafif Çisenti', hailLightningPct: 5 },
  53: { conditionText: 'Orta Çisenti', hailLightningPct: 5 },
  55: { conditionText: 'Yoğun Çisenti', hailLightningPct: 10 },
  56: { conditionText: 'Hafif Dondurucu Çisenti', hailLightningPct: 10 },
  57: { conditionText: 'Yoğun Dondurucu Çisenti', hailLightningPct: 15 },
  61: { conditionText: 'Hafif Yağmur', hailLightningPct: 10 },
  63: { conditionText: 'Orta Şiddette Yağmur', hailLightningPct: 20 },
  65: { conditionText: 'Kuvvetli Yağmur', hailLightningPct: 35 },
  66: { conditionText: 'Hafif Dondurucu Yağmur', hailLightningPct: 20 },
  67: { conditionText: 'Kuvvetli Dondurucu Yağmur', hailLightningPct: 35 },
  71: { conditionText: 'Hafif Kar Yağışı', hailLightningPct: 5 },
  73: { conditionText: 'Orta Şiddette Kar', hailLightningPct: 10 },
  75: { conditionText: 'Yoğun Kar Yağışı', hailLightningPct: 15 },
  77: { conditionText: 'Kar Taneleri', hailLightningPct: 5 },
  80: { conditionText: 'Hafif Sağanak Yağış', hailLightningPct: 25 },
  81: { conditionText: 'Orta Şiddette Sağanak', hailLightningPct: 40 },
  82: { conditionText: 'Kuvvetli Sağanak Yağış', hailLightningPct: 55 },
  85: { conditionText: 'Hafif Kar Sağanağı', hailLightningPct: 20 },
  86: { conditionText: 'Kuvvetli Kar Sağanağı', hailLightningPct: 35 },
  95: { conditionText: 'Gök Gürültülü Fırtına', hailLightningPct: 70 },
  96: { conditionText: 'Hafif Dolulu Fırtına', hailLightningPct: 85 },
  99: { conditionText: 'Şiddetli Dolulu Fırtına', hailLightningPct: 95 }
};

/**
 * WMO kodunu Türkçe durum metnine dönüştürür.
 */
export function getConditionText(code: number): string {
  return WMO_MAP[code]?.conditionText ?? 'Değişken Bulutlu';
}

/**
 * WMO kodu ve yağış olasılığına bağlı olarak dolu/yıldırım risk yüzdesini hesaplar.
 */
export function getHailLightningProbability(code: number, precipProbPct: number): number {
  const base = WMO_MAP[code]?.hailLightningPct ?? 0;
  if (base >= 70) {
    // Fırtına kodlarında taban doğrudan kullanılır
    return base;
  }
  // Sağanak kodlarında yüksek yağış olasılığı riski artırır
  if (base > 0 && precipProbPct > 60) {
    return Math.min(65, Math.round(base * (1 + (precipProbPct - 60) / 100)));
  }
  return base;
}

/**
 * ISO tarihini Türkçe gün adına dönüştürür.
 */
export function getTurkishDayName(dateIso: string, dayIndex: number): string {
  if (dayIndex === 0) return 'Bugün';
  if (dayIndex === 1) return 'Yarın';

  const date = new Date(dateIso);
  const day = date.getDay(); // 0 = Pazar, 1 = Pazartesi ...

  const days = [
    'Pazar',
    'Pazartesi',
    'Salı',
    'Çarşamba',
    'Perşembe',
    'Cuma',
    'Cumartesi'
  ];

  return days[day] ?? 'Gün';
}
