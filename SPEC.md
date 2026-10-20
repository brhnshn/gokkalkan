# GÖKKALKAN (HavaDurumu) — Teknik Şartname (`SPEC.md`)

Bu belge, **Gökkalkan PWA + Çift Ortamlı (Cloudflare Worker / VDS) Hono Backend** sisteminin mimari topolojisini, veri akışlarını, sayfa hiyerarşisini ve API sözleşmelerini tanımlar.

---

## 1. Sistem ve Çift Ortamlı (Dual-Runtime) Dağıtım Mimarisi

Backend katmanı **Hono + TypeScript** ile tek bir kod tabanında yazılır. İlk aşamada ücretsiz **Cloudflare Workers** üzerinde (100.000 istek/gün + CDN Edge Cache) çalışır; kota aşımı veya tercih durumunda **tek bir satır iş mantığı değiştirilmeden** doğrudan **VDS (Docker / Node.js)** üzerine alınabilir.

```mermaid
graph TD
    User([Kullanıcı: iOS / Android PWA]) -->|HTTPS| CF_Pages[Cloudflare Pages - React PWA]
    User -->|API İsteği: /api/v1/*| EdgeCache[Cloudflare CDN Edge Cache - 10dk GeoGrid]
    
    EdgeCache -->|Cache Miss| RuntimeSwitch{Aktif Çalışma Zamanı}
    RuntimeSwitch -->|Mod 1: Ücretsiz Bulut| CF_Worker[Cloudflare Worker - index.worker.ts]
    RuntimeSwitch -->|Mod 2: Kendi Sunucun| VDS_Node[VDS Docker Node.js - index.node.ts]
    
    CF_Worker --> CoreApp[Hono Core App & Risk Engine - src/app.ts]
    VDS_Node --> CoreApp
    
    CoreApp -->|Paralel Fetch| OpenMeteo[Open-Meteo: Hava + Tarım + Deniz]
    CoreApp -->|GeoJSON Fetch| EMSC[EMSC SeismicPortal: Son Depremler]
    CoreApp -->|Geocoding| GeoAPI[Open-Meteo Geocoding API]
```

---

## 2. Coğrafi Grid Önbellekleme (Geo-Grid Cache) ve Veri Birleştirme Akışı

Cloudflare ücretsiz kotasını (100k/gün) korumak ve istemciye 0ms'ye yakın yanıt dönmek için koordinatlar 2 ondalık basamağa (`~1.1 km` çaplı grid) yuvarlanır:

```mermaid
sequenceDiagram
    autonumber
    actor U as Kullanıcı (PWA)
    participant SW as Service Worker / TanStack Persist
    participant CDN as Cloudflare Edge Cache
    participant API as Hono Backend (Worker / VDS)
    participant EXT as Open-Meteo & EMSC API

    U->>SW: Uygulamayı Açar (lat: 40.1467, lon: 26.4089)
    SW-->>U: Son Önbellek Verisini Anında Göster (0ms Stale)
    SW->>CDN: GET /api/v1/dashboard?lat=40.15&lon=26.41
    alt Grid Önbellekte Varsa (10 dk içinde başka biri sorduysa)
        CDN-->>SW: 200 OK (Kotadan Düşmeden Edge Cache Yanıtı)
    else Grid Önbellekte Yoksa (Cache Miss)
        CDN->>API: İsteği İletir
        par Paralel Dış Servis Sorguları
            API->>EXT: Open-Meteo Forecast & Soil (Hava + Tarlam)
            API->>EXT: Open-Meteo Marine (Denizde Dalga/Rüzgar)
            API->>EXT: EMSC FDSN (Son 48 Saat Depremler)
        end
        EXT-->>API: Ham JSON Yanıtları
        Note over API: riskEngine.ts: FWI Yangın, Don, Deniz ve Gökkalkan Puanı Hesaplar
        API-->>CDN: 200 OK + Cache-Control: public, s-maxage=600
        CDN-->>SW: Birleştirilmiş Dashboard JSON
    end
    SW-->>U: Arayüzü ve Kadranları Canlı Güncelle
```

---

## 3. Ekran & Sayfa Hiyerarşisi (Site Map & Çekmeceler)

```mermaid
graph TD
    Root[Gökkalkan PWA Kabuğu] --> TopBar[Üst Bar: Konum Seçici + Gündüz/Gece Tema Perdesi + Paylaş]
    Root --> FloatingNav[Havada Yüzen Liquid Glass Bottom Navbar]

    FloatingNav --> Tab1[1. Bugün - Ana Gösterge Paneli]
    FloatingNav --> Tab2[2. Harita - Canlı Radar & Katmanlar]
    FloatingNav --> Tab3[3. Uyarılar - Gökkalkan Nöbet Kuralları]
    FloatingNav --> Tab4[4. 7 Gün - Haftalık Tahmin]
    FloatingNav --> Tab5[5. Ayarlar - Konumlar & Birimler]

    Tab1 --> Hero[Anlık Sıcaklık, Hissedilen, Rüzgar/Nem/Görüş Hapları]
    Tab1 --> SentinelCard[Gökkalkan Nöbette Durum Kartı]
    Tab1 --> Timeline24[24 Saatlik Sürüklenebilir Risk Şeridi]
    Tab1 --> Gauges4[4'lü SVG Yay Kadranlar: Yağış, Rüzgar, Dolu/Yıldırım, Yangın]
    Tab1 --> QuakeCard[Son Deprem Kartı -> Sismik Uyarı Çekmecesi]
    Tab1 --> AgriCard[Tarlam Kartı -> Toprak Nemi, Don ve İlaçlama Çekmecesi]
    Tab1 --> MarineCard[Denizde Kartı -> Dalga Boyu, Su Sıcaklığı ve Akıntı Çekmecesi]
```

---

## 4. Animasyon, Tema Perdelemesi ve Mikro Etkileşim Haritası

```mermaid
stateDiagram-v2
    [*] --> LightMode_Day: Varsayılan Gündüz / Açık Tema (#f4f6fa)
    LightMode_Day --> DarkMode_Night: Tema Butonu Tıklaması -> clip-path circle(0% to 150%)
    DarkMode_Night --> LightMode_Day: Tema Butonu Tıklaması -> clip-path circle(0% to 150%)

    state "24 Saat Scrubber Etkileşimi" as Scrubber {
        Idle: Şu Anki Saat Seçili
        Dragging: Parmak/Fare Barlar Üzerinde Kayıyor
        Idle --> Dragging: pointerdown / pointermove
        Dragging --> UpdateUI: Sıcaklık + Durum Hapı + 4 Yay Kadranı Anlık Güncellenir
        UpdateUI --> Idle: pointerup
    }
```

---

## 5. REST API Sözleşmeleri (Hono Backend)

### `GET /api/v1/dashboard?lat={number}&lon={number}&name={string}`
Tek bir istekte tüm ana ekranı, 24 saatlik şeridi, 7 günü, tarla/deniz analizini ve en yakın depremi döner.

```typescript
export interface DashboardResponse {
  location: {
    name: string;
    admin1?: string;
    lat: number;
    lon: number;
    isCoastal: boolean;
    updatedAt: string;
  };
  current: {
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
  };
  sentinel: {
    level: 'SAFE' | 'CAUTION' | 'DANGER';
    badgeText: string;      // Örn: "GÖKKALKAN NÖBETTE"
    headline: string;       // Örn: "Bugün risk yok, keyfini çıkar"
    subline: string;        // Örn: "Sonraki 24 saat sakin · Gün batımı 18:27"
  };
  hourly24: Array<{
    timeIso: string;
    hourLabel: string;      // "Şimdi", "03:00", "06:00"...
    temp: number;
    conditionCode: number;
    conditionText: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    gauges: {
      precipitationPct: number;
      windKmh: number;
      hailLightningPct: number;
      fireRiskIndex: number; // 0 - 100 FWI normalize
    };
  }>;
  earthquake: {
    id: string;
    magnitude: number;
    region: string;
    distanceKm: number;
    hoursAgo: number;
    depthKm: number;
    source: 'EMSC';
    timeIso: string;
  } | null;
  agriculture: {
    status: 'DÜŞÜK RİSK' | 'ORTA RİSK' | 'YÜKSEK RİSK';
    frostRiskPct: number;
    soilMoisturePct: number;
    soilTempC: number;
    sprayingSuitable: boolean;
    recommendation: string;
  };
  marine: {
    isAvailable: boolean;
    status: 'UYGUN' | 'DİKKATLİ' | 'TEHLİKELİ';
    waveHeightM: number;
    wavePeriodS: number;
    windGustKnots: number;
    recommendation: string;
  };
  daily7: Array<{
    dateIso: string;
    dayName: string;
    conditionCode: number;
    conditionText: string;
    tempMin: number;
    tempMax: number;
    precipitationProbPct: number;
    windMaxKmh: number;
  }>;
}
```

### `GET /api/v1/locations/search?q={string}`
Open-Meteo Geocoding API üzerinden Türkiye ve dünya konumlarını arar, koordinat ve il/ilçe bilgisini döner.
