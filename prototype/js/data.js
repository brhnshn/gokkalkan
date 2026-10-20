/**
 * GokKalkan Weather UI - Realistic Turkish Weather & Environmental Mock Data
 * SIFIR EMOJİ: Veri alanlarında veya metinlerde emoji bulunmaz.
 */

const GokData = {
  currentLocation: {
    city: "Çanakkale",
    district: "Barbaros",
    display: "Barbaros, Çanakkale",
    coords: { lat: 40.1467, lng: 26.4086 },
    updatedAt: "12 dakika önce güncellendi",
    currentTemp: 13,
    feelsLike: 11,
    high: 16,
    low: 6,
    condition: "Az Bulutlu",
    conditionDesc: "Gündüz ılıman, akşam saatlerinde hafif boğaz serinliği bekleniyor.",
    icon: "cloudSun",
    windSpeed: 2,
    windDirection: "KD",
    windGust: 8,
    humidity: 96,
    visibility: 15,
    pressure: 1018,
    uvIndex: 2,
    dewPoint: 8
  },

  // 24 Hour Scrubber Data
  hourly: [
    { hour: "00:00", temp: 8, condition: "Sisli", icon: "cloudFog", risk: "safe", riskVal: 10, rain: 0, wind: 4, hail: 0, fire: 5 },
    { hour: "01:00", temp: 7, condition: "Yoğun Sis", icon: "cloudFog", risk: "caution", riskVal: 28, rain: 0, wind: 3, hail: 0, fire: 5 },
    { hour: "02:00", temp: 7, condition: "Yoğun Sis", icon: "cloudFog", risk: "caution", riskVal: 30, rain: 0, wind: 3, hail: 0, fire: 5 },
    { hour: "03:00", temp: 6, condition: "Sisli & Soğuk", icon: "cloudFog", risk: "caution", riskVal: 25, rain: 0, wind: 2, hail: 0, fire: 5 },
    { hour: "04:00", temp: 6, condition: "Sisli & Soğuk", icon: "cloudFog", risk: "caution", riskVal: 25, rain: 0, wind: 2, hail: 0, fire: 5 },
    { hour: "05:00", temp: 7, condition: "Sis Dağılıyor", icon: "cloudFog", risk: "safe", riskVal: 15, rain: 0, wind: 3, hail: 0, fire: 5 },
    { hour: "06:00", temp: 8, condition: "Parçalı Bulutlu", icon: "cloudSun", risk: "safe", riskVal: 10, rain: 0, wind: 4, hail: 0, fire: 8 },
    { hour: "07:00", temp: 9, condition: "Güneş Doğuşu", icon: "sun", risk: "safe", riskVal: 5, rain: 0, wind: 5, hail: 0, fire: 10 },
    { hour: "08:00", temp: 11, condition: "Az Bulutlu", icon: "cloudSun", risk: "safe", riskVal: 5, rain: 0, wind: 6, hail: 0, fire: 12 },
    { hour: "09:00", temp: 12, condition: "Az Bulutlu", icon: "cloudSun", risk: "safe", riskVal: 5, rain: 0, wind: 7, hail: 0, fire: 15 },
    { hour: "10:00", temp: 13, condition: "Açık & Güneşli", icon: "sun", risk: "safe", riskVal: 5, rain: 0, wind: 8, hail: 0, fire: 18 },
    { hour: "11:00", temp: 14, condition: "Ilık Güneş", icon: "sun", risk: "safe", riskVal: 8, rain: 0, wind: 10, hail: 0, fire: 20 },
    { hour: "12:00", temp: 15, condition: "Açık", icon: "sun", risk: "safe", riskVal: 10, rain: 0, wind: 11, hail: 0, fire: 22 },
    { hour: "13:00", temp: 16, condition: "Günün Zirvesi", icon: "sun", risk: "safe", riskVal: 12, rain: 5, wind: 12, hail: 0, fire: 25 },
    { hour: "14:00", temp: 16, condition: "Açık", icon: "sun", risk: "safe", riskVal: 12, rain: 5, wind: 12, hail: 0, fire: 25 },
    { hour: "15:00", temp: 15, condition: "Hafif Esintili", icon: "cloudSun", risk: "safe", riskVal: 10, rain: 0, wind: 14, hail: 0, fire: 24 },
    { hour: "16:00", temp: 14, condition: "Parçalı Bulutlu", icon: "cloudSun", risk: "safe", riskVal: 10, rain: 10, wind: 15, hail: 0, fire: 20 },
    { hour: "17:00", temp: 13, condition: "Gün Batımı", icon: "cloudSun", risk: "safe", riskVal: 8, rain: 10, wind: 12, hail: 0, fire: 18 },
    { hour: "18:00", temp: 12, condition: "Alacakaranlık", icon: "cloud", risk: "safe", riskVal: 10, rain: 15, wind: 10, hail: 0, fire: 15 },
    { hour: "19:00", temp: 11, condition: "Boğaz Rüzgarı", icon: "wind", risk: "caution", riskVal: 22, rain: 10, wind: 18, hail: 0, fire: 12 },
    { hour: "20:00", temp: 10, condition: "Serin", icon: "cloud", risk: "safe", riskVal: 12, rain: 10, wind: 14, hail: 0, fire: 10 },
    { hour: "21:00", temp: 10, condition: "Bulutlu", icon: "cloud", risk: "safe", riskVal: 10, rain: 5, wind: 12, hail: 0, fire: 8 },
    { hour: "22:00", temp: 9, condition: "Sakin Gece", icon: "moon", risk: "safe", riskVal: 8, rain: 0, wind: 8, hail: 0, fire: 5 },
    { hour: "23:00", temp: 8, condition: "Açık Gece", icon: "moon", risk: "safe", riskVal: 5, rain: 0, wind: 6, hail: 0, fire: 5 }
  ],

  // 7 Day Forecast
  daily: [
    {
      day: "Bugün",
      date: "20 Eki",
      condition: "Az Bulutlu",
      icon: "cloudSun",
      min: 6,
      max: 16,
      rainProb: 0,
      wind: "12 km/sa KD",
      agroStatus: "İdeal Koşul",
      marineStatus: "0.4m Sakin",
      hourlySnippet: [
        { time: "09:00", temp: 12, icon: "cloudSun" },
        { time: "12:00", temp: 15, icon: "sun" },
        { time: "15:00", temp: 16, icon: "sun" },
        { time: "18:00", temp: 12, icon: "cloud" },
        { time: "21:00", temp: 10, icon: "moon" }
      ]
    },
    {
      day: "Pazartesi",
      date: "21 Eki",
      condition: "Açık & Güneşli",
      icon: "sun",
      min: 8,
      max: 18,
      rainProb: 5,
      wind: "10 km/sa D",
      agroStatus: "İlaçlamaya Uygun",
      marineStatus: "0.3m Durgun",
      hourlySnippet: [
        { time: "09:00", temp: 13, icon: "sun" },
        { time: "12:00", temp: 17, icon: "sun" },
        { time: "15:00", temp: 18, icon: "sun" },
        { time: "18:00", temp: 14, icon: "sun" },
        { time: "21:00", temp: 11, icon: "moon" }
      ]
    },
    {
      day: "Salı",
      date: "22 Eki",
      condition: "Parçalı Bulutlu",
      icon: "cloudSun",
      min: 9,
      max: 17,
      rainProb: 15,
      wind: "16 km/sa B",
      agroStatus: "Hafif Rüzgar",
      marineStatus: "0.6m Normal",
      hourlySnippet: [
        { time: "09:00", temp: 12, icon: "cloudSun" },
        { time: "12:00", temp: 16, icon: "cloudSun" },
        { time: "15:00", temp: 17, icon: "cloudSun" },
        { time: "18:00", temp: 13, icon: "cloud" },
        { time: "21:00", temp: 11, icon: "cloud" }
      ]
    },
    {
      day: "Çarşamba",
      date: "23 Eki",
      condition: "Kuvvetli Sağanak",
      icon: "cloudRain",
      min: 11,
      max: 14,
      rainProb: 85,
      wind: "28 km/sa GB",
      agroStatus: "Sulama İptal",
      marineStatus: "1.4m Dalgalı",
      hourlySnippet: [
        { time: "09:00", temp: 12, icon: "cloudRain" },
        { time: "12:00", temp: 14, icon: "cloudLightning" },
        { time: "15:00", temp: 13, icon: "cloudRain" },
        { time: "18:00", temp: 12, icon: "cloudRain" },
        { time: "21:00", temp: 11, icon: "cloud" }
      ]
    },
    {
      day: "Perşembe",
      date: "24 Eki",
      condition: "Geçişli Yağmur",
      icon: "cloudRain",
      min: 8,
      max: 13,
      rainProb: 40,
      wind: "22 km/sa K",
      agroStatus: "Toprak Yaş",
      marineStatus: "1.1m Çalkantılı",
      hourlySnippet: [
        { time: "09:00", temp: 9, icon: "cloudRain" },
        { time: "12:00", temp: 12, icon: "cloudSun" },
        { time: "15:00", temp: 13, icon: "cloudSun" },
        { time: "18:00", temp: 10, icon: "cloud" },
        { time: "21:00", temp: 9, icon: "moon" }
      ]
    },
    {
      day: "Cuma",
      date: "25 Eki",
      condition: "Az Bulutlu & Serin",
      icon: "cloudSun",
      min: 5,
      max: 15,
      rainProb: 10,
      wind: "12 km/sa KD",
      agroStatus: "Gece Don Takibi",
      marineStatus: "0.5m Sakin",
      hourlySnippet: [
        { time: "09:00", temp: 8, icon: "cloudSun" },
        { time: "12:00", temp: 13, icon: "sun" },
        { time: "15:00", temp: 15, icon: "sun" },
        { time: "18:00", temp: 10, icon: "cloudSun" },
        { time: "21:00", temp: 7, icon: "moon" }
      ]
    },
    {
      day: "Cumartesi",
      date: "26 Eki",
      condition: "Açık & Berrak",
      icon: "sun",
      min: 7,
      max: 17,
      rainProb: 0,
      wind: "8 km/sa D",
      agroStatus: "Hasat İçin İdeal",
      marineStatus: "0.3m Durgun",
      hourlySnippet: [
        { time: "09:00", temp: 10, icon: "sun" },
        { time: "12:00", temp: 16, icon: "sun" },
        { time: "15:00", temp: 17, icon: "sun" },
        { time: "18:00", temp: 12, icon: "sun" },
        { time: "21:00", temp: 9, icon: "moon" }
      ]
    }
  ],

  // Earthquake Module
  earthquake: {
    magnitude: "2.9",
    location: "Western Turkey (Biga - Çanakkale)",
    distance: "24.5 km",
    depth: "7.2 km",
    time: "Bugün 04:12",
    agency: "EMSC / AFAD",
    intensity: "Hafif / Hissedilmedi",
    coords: { lat: 40.231, lng: 27.242 },
    isWarningActive: true
  },

  // Agricultural Module (Tarlam)
  agriculture: {
    locationName: "Ezine Zeytinliği (Parsel 14)",
    riskStatus: "Düşük Risk",
    soilMoisture: "%42",
    soilMoistureStatus: "Optimum Nem Seviyesi",
    frostRisk: "%5",
    frostRiskStatus: "Zirai don tehlikesi yok (+6°C min)",
    sprayingSuitability: "Çok Uygun",
    sprayingDetail: "Rüzgar < 10 km/sa, yaprak ıslaklığı 0 saat",
    soilTemp: "11.5°C",
    evapotranspiration: "1.8 mm/gün",
    recommendation: "Toprak nem dengesi dengeli seyrediyor. Çarşamba günkü beklenen sağanak öncesi zeytin ve bağ ilaçlaması için Pazartesi ve Salı en uygun pencerelerdir."
  },

  // Marine Module (Denizde)
  marine: {
    locationName: "Çanakkale Boğazı & Bozcaada Hattı",
    suitability: "UYGUN",
    waveHeight: "0.4 m",
    wavePeriod: "3.8 sn",
    seaTemperature: "16.2°C",
    windGust: "8 knot KD",
    waterClarity: "Yüksek",
    currentSpeed: "1.8 knot Güneye Akıntı",
    tideStatus: "Normal (+12 cm)",
    boatingAdvice: "Küçük tekne ve amatör balıkçılık için emniyetli seyir koşulları hakimdir. Boğaz girişindeki akıntıya dikkat ediniz."
  },

  // Gökkalkan Active Sentinel Alert Rules
  alertRules: [
    {
      id: "frost",
      title: "Zirai Don Uyarısı",
      desc: "Toprak veya hava sıcaklığı +2°C altına düştüğünde anında bildirim gönder.",
      active: true,
      threshold: "+2.0°C",
      unit: "°C",
      category: "agro"
    },
    {
      id: "seismic",
      title: "Yakın Deprem Radarı",
      desc: "150 km yarıçapta 3.0 ve üzeri sarsıntılarda erken akustik ikaz.",
      active: true,
      threshold: "M 3.0 / 150 km",
      unit: "Mw",
      category: "seismic"
    },
    {
      id: "marine",
      title: "Deniz Fırtına Uyarısı",
      desc: "Rüzgar 25 knot veya dalga yüksekliği 1.5 metre üzerine çıktığında uyar.",
      active: true,
      threshold: "25 knot / 1.5 m",
      unit: "knot",
      category: "marine"
    },
    {
      id: "precipitation",
      title: "Şiddetli Yağış ve Dolu",
      desc: "Ani sağanak (>20 mm/sa) veya dolu riski %40 aşıldığında siren çal.",
      active: true,
      threshold: "20 mm/sa / %40 Dolu",
      unit: "mm",
      category: "weather"
    },
    {
      id: "uv",
      title: "Yüksek UV & Sıcaklık Dalgalanması",
      desc: "UV İndeksi 8+ veya 5 saatte 8°C üzeri ani sıcaklık düşüşü bildirimleri.",
      active: false,
      threshold: "UV 8.0+",
      unit: "UVI",
      category: "health"
    }
  ],

  // Past Notification Logs
  notificationLogs: [
    {
      time: "Dün 22:30",
      title: "Boğaz Rüzgar Artışı",
      body: "Çanakkale Boğazı kuzey çıkışında hamleli rüzgar 22 knot seviyesine ulaştı.",
      severity: "info",
      icon: "wind"
    },
    {
      time: "18 Eki 04:15",
      title: "Sismik Aktivite Kaydı",
      body: "Biga açıklarında 2.8 büyüklüğünde hafif yer hareketi saptandı (Hasarsız).",
      severity: "warning",
      icon: "activity"
    },
    {
      time: "15 Eki 05:40",
      title: "Gece Don Nöbeti",
      body: "Ezine vadisinde yüzey sıcaklığı +1.8°C'ye indi. Kritik eşik bildirimleri sevk edildi.",
      severity: "alert",
      icon: "thermometer"
    }
  ],

  // Saved Locations
  savedLocations: [
    { id: "1", name: "Barbaros, Çanakkale", tag: "Birincil GPS", temp: "13°", condition: "Az Bulutlu", active: true },
    { id: "2", name: "Ezine Tarla (Parsel 14)", tag: "Zirai Takip", temp: "11°", condition: "Sisli", active: false },
    { id: "3", name: "Bozcaada Liman", tag: "Deniz & Akıntı", temp: "14°", condition: "Açık", active: false },
    { id: "4", name: "Gökçeada Kuzu Limanı", tag: "Balıkçılık", temp: "13°", condition: "Rüzgarlı", active: false }
  ]
};

if (typeof window !== 'undefined') {
  window.GokData = GokData;
}
