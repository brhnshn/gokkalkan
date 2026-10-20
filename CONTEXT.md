# GÖKKALKAN (HavaDurumu) — Etki Alanı ve Sözlük (`CONTEXT.md`)

Bu belge, **Gökkalkan Bölgesel Hava ve Risk Radarı** projesinin etki alanı (domain) kavramlarını, veri kaynaklarını ve taşınabilir mimari sınırlarını tanımlar.

---

## 1. Temel Etki Alanı Terimleri (Ubiquitous Language)

| Terim | Teknik Karşılığı | Açıklama |
| :--- | :--- | :--- |
| **Gökkalkan Nöbette (Sentinel)** | `SentinelVerdict` | Yağış, rüzgâr, dolu/yıldırım, yangın ve deprem verilerini birleştirerek kullanıcıya tek cümlelik eylem durumu (`SAFE`, `CAUTION`, `DANGER`) üreten kural motoru çıktısı. |
| **Coğrafi Grid (Geo-Grid)** | `GeoGridKey` | GPS koordinatlarının 2 ondalık basamağa (`40.15, 26.41` ~ 1.1 km çap) yuvarlanmasıyla elde edilen önbellek anahtarı. Cloudflare ücretsiz kotasını korumak için aynı grid'deki kullanıcılara 10 dakika boyunca ortak önbellekten yanıt döner. |
| **24 Saat Risk Şeridi** | `HourlyRiskSlot[]` | Önümüzdeki 24 saatin her bir saati için sıcaklık, hava kodu ve bileşik risk seviyesini (`LOW`, `MEDIUM`, `HIGH`) tutan interaktif zaman çizelgesi. |
| **Tarlam Modülü** | `AgriRiskReport` | 0-10 cm toprak sıcaklığı, toprak nemi, gece zirai don olasılığı ve rüzgâr hızına göre ilaçlama uygunluğunu hesaplayan tarımsal analiz birimi. |
| **Denizde Modülü** | `MarineRiskReport` | Dalga yüksekliği, dalga periyodu, deniz rüzgâr hamlesi (gust) ve görüş mesafesine göre küçük tekne/balıkçılık uygunluğunu (`UYGUN`, `DİKKATLİ`, `TEHLİKELİ`) belirleyen birim. (Kıyı şeridinde olmayan iç bölgelerde otomatik olarak *İç Su / Rüzgâr Modu*na evrilir). |
| **Sismik Yakınlık** | `SeismicEvent` | EMSC FDSN API üzerinden çekilen depremlerin kullanıcının koordinatına olan **Haversine** kuş uçuşu mesafesi (km) ve büyüklüğü (Mw/ML). |
| **Taşınabilir Çalışma Zamanı** | `DualRuntimeAdapter` | Tek bir Hono + TypeScript backend kodunun hiçbir iş mantığı değiştirilmeden hem **Cloudflare Workers** (Ücretsiz Edge) hem de **VDS (Docker / Node.js)** üzerinde çalışmasını sağlayan adaptör katmanı. |

---

## 2. Dış Veri Kaynakları (Ücretsiz & Anahtarsız)

1. **Open-Meteo Forecast API (`api.open-meteo.com/v1/forecast`):**
   * Sıcaklık, hissedilen sıcaklık, bağıl nem, görüş mesafesi, rüzgâr hızı/hamlesi, yağış olasılığı, CAPE (konvektif yıldırım/dolu potansiyeli), toprak sıcaklığı ve toprak nemi.
2. **Open-Meteo Marine API (`marine-api.open-meteo.com/v1/marine`):**
   * Dalga yüksekliği (`wave_height`), dalga yönü, dalga periyodu.
3. **EMSC SeismicPortal API (`seismicportal.eu/fdsnws/event/1/query`):**
   * Türkiye ve çevresindeki gerçek zamanlı sismik aktiviteler (GeoJSON).
4. **Open-Meteo Geocoding API (`geocoding-api.open-meteo.com/v1/search`):**
   * İl, ilçe, belde ve köy araması.
5. **RainViewer API (`api.rainviewer.com/public/weather-maps.json`):**
   * Harita sekmesi için ücretsiz canlı yağış radarı karo (tile) zaman damgaları.
