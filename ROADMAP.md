# GÖKKALKAN — Dikey Dilim Geliştirme Planı (`ROADMAP.md`)

Her bilet tüm katmanlardan (Ortak Tipler -> Hono Backend -> React PWA -> Doğrulama) geçen, tek başına çalıştırılıp test edilebilir bir **Tracer Bullet (İzli Mermi)** dilimidir.

---

## Bilet 01: Monorepo İskeleti, Ortak Tipler (`shared`) ve GÖKKALKAN Risk Motoru [x] TAMAMLANDI (28/28 Test Başarılı)
* **Önkoşul:** Yok (Hemen Başlatılabilir)
* **Kapsam:**
  1. `C:\Users\sahin\Desktop\Projeler\HavaDurumu` altında `packages/shared`, `packages/api` (Hono) ve `packages/web` (Vite + React + TS + Tailwind) çalışma alanı (workspace) kurulumu.
  2. `packages/shared/src/types.ts`: `SPEC.md` içindeki `DashboardResponse`, `HourlyRiskSlot`, `SeismicEvent`, `AgriRiskReport`, `MarineRiskReport` tip sözleşmeleri.
  3. `packages/shared/src/riskEngine.ts`:
     * **FWI Yangın İndeksi Hesabı:** Sıcaklık, bağıl nem ve rüzgâr hızından 0-100 arası yangın riski hesaplama.
     * **Tarlam Analizörü:** Toprak sıcaklığı, nemi ve gece minimum sıcaklığından zirai don ve ilaçlama uygunluğu hesabı.
     * **Denizde Analizörü:** Dalga boyu ve rüzgâr hamlesinden (knot) deniz uygunluğu hesabı.
     * **Haversine Mesafe Hesaplayıcı:** Kullanıcı koordinatı ile deprem merkez üssü arasındaki gerçek kuş uçuşu km hesabı.
* **Doğrulama:** Birim testleri (`vitest`) ile risk motorunun örnek Çanakkale verisiyle doğru kararlar ürettiğinin kanıtlanması.

---

## Bilet 02: Taşınabilir Hono Backend (`packages/api`) — CF Worker & VDS Çift Giriş Noktası [x] TAMAMLANDI (9/9 Test Başarılı, Canlı API Doğrulandı) [TAMAMLANDI]
* **Önkoşul:** Bilet 01
* **Kapsam:**
  1. `src/services/openMeteoService.ts`: Open-Meteo Forecast, Soil ve Marine API'lerini paralel sorgulayan servis.
  2. `src/services/emscService.ts`: EMSC SeismicPortal FDSN API'sinden Türkiye ve çevresi son depremleri çeken servis.
  3. `src/middleware/geoGridCache.ts`: Koordinatları 2 ondalığa (`~1.1 km` çap) yuvarlayan, Cloudflare üzerinde Edge Cache (`s-maxage=600`), VDS üzerinde Bellek İçi (In-Memory) önbellek çalıştıran adaptör.
  4. **Çift Çalışma Zamanı Girişleri:**
     * `src/index.worker.ts` + `wrangler.toml`: Cloudflare Workers ücretsiz dağıtım girişi.
     * `src/index.node.ts` + `Dockerfile` + `docker-compose.yml`: VDS / Node.js dağıtım girişi (Sıfır kod değişikliğiyle).
  5. Uç Noktalar: `GET /health`, `GET /api/v1/dashboard` ve `GET /api/v1/locations/search`.
* **Doğrulama:** `GET /api/v1/dashboard?lat=40.15&lon=26.41` çağrıldığında gerçek canlı Çanakkale hava, tarım, deniz ve EMSC deprem verisinin birleşmiş JSON olarak dönmesi (Vitest ile 9/9 test geçti, canli boot testi yapildi).

---

## Bilet 03: React PWA Kabuğu, Liquid Glass Yüzen Navbar ve Tema Perdelemesi (`packages/web`) [x] TAMAMLANDI (PWA Build & Typecheck Başarılı)
* **Önkoşul:** Bilet 01
* **Kapsam:**
  1. Vite + React + TypeScript + Tailwind CSS + `vite-plugin-pwa` (iOS & Android "Ana Ekrana Ekle" manifest, ikonlar, `standalone` görünüm, safe-area-inset desteği).
  2. `src/api/client.ts`: TanStack Query + `localStorage` persister (çevrimdışı dayanıklılık) ve CF Worker / VDS otomatik yedekli (failover) istemci.
  3. `src/components/icons/SvgIcons.tsx`: Sıfır emojili özel vektörel SVG ikon kütüphanesi.
  4. `src/components/navigation/FloatingBottomNav.tsx`: Havada yüzen iOS Liquid Glass alt bar ve aktif sekme arkasında kayan hap (`sliding pill`).
  5. `src/components/layout/ThemeWipeProvider.tsx`: Açık (Gündüz) ve Koyu (Gece) modları arasında tıklanan noktadan büyüyen `circle(...)` perdeleme.
* **Doğrulama:** Uygulama kabuğunun derlenmesi, 5 sekme geçişinin ve dairesel tema perdelemesinin taranıp `npm run build` ve `npm run typecheck` ile sıfır hatayla başarıyla üretilmesi.

---

## Bilet 04: "Bugün" Ana Gösterge Paneli, Canlı 24s Scrubber, Yay Kadranlar ve Detay Çekmeceleri [x] TAMAMLANDI (Build & Typecheck Başarılı)
* **Önkoşul:** Bilet 02, Bilet 03
* **Kapsam:**
  1. `HeroWeatherHeader.tsx`: Konum seçici, canlı sıcaklık, hissedilen/Y/D, rüzgâr/nem/görüş rozetleri ve Web Share API (`navigator.share`) paylaş butonu.
  2. `SentinelBanner.tsx`: Gökkalkan Nöbette zümrüt/kehribar/kırmızı durum kartı ve hızlı eylem butonları (7 Günü Gör, Harita, Paylaş).
  3. `InteractiveRiskTimeline.tsx`: 24 saatlik yeşil/sarı/kırmızı risk barları; parmakla/fareyle kaydırıldıkça seçili saatin sıcaklığını ve 4 kadranı canlı güncelleyen scrubber.
  4. `RiskArcGauges.tsx`: Yağış, Rüzgâr, Dolu & Yıldırım, Yangın Riski SVG yarım yay (`stroke-dasharray="88"` ve `stroke-dashoffset`) kadranları.
  5. `ActivityBentoCards.tsx` + `DetailBottomSheet.tsx` + `DrawersContent.tsx`: Son Deprem (animasyonlu sismik radar halkalı), Tarlam ve Denizde kartları ile tıklanınca açılan Liquid Glass alt çekmeceler.
* **Doğrulama:** Canlı API verisiyle ana ekranın eksiksiz çalışması, 24 saatlik çubuk kaydırıldığında tüm kadranların anlık tepki vermesi, `npm run typecheck` ve `npm run build` ile sıfır hatayla doğrulanması.

---

## Bilet 05: Harita (Canlı Yağış Radarı & Deprem), Uyarılar, 7 Gün ve Ayarlar Sekmeleri [x] TAMAMLANDI (Tüm Sekmeler, Radar/Canvas Motoru, Depolama Servisleri Eksiksiz & 0 Hata)
* **Önkoşul:** Bilet 04
* **Kapsam:**
  1. `MapView.tsx`:
     - 4 Katman seçici hapları (`MapLayerPills.tsx`): Yağış Radarı, Rüzgâr Akışı, Sismik Fay & Deprem, Yangın Tehlikesi.
     - 60 FPS Retina Canvas Harita Motoru (`MapCanvas.tsx`): Çanakkale Boğazı, Gelibolu, Saros Körfezi, Bozcaada, Gökçeada kıyı poligonları; hareketli fırtına kütleleri, 110 partiküllü poyraz rüzgâr akıntısı, KAF fay hattı ve EMSC episantr konsantrik sismik dalgaları, Kaz Dağları FWI termal ısı alanları.
     - Zaman Oynatıcı Kontrol Çubuğu (`MapTimelinePlayer.tsx`): Play / Pause, -120dk'den +60dk'ye dinamik zaman kaydırıcı.
     - Katman Lejantı (`MapLegend.tsx`): Yağış dBZ, Rüzgâr knot, Sismik M/fay, Yangın FWI skalası.
  2. `AlertsView.tsx`:
     - Gökkalkan Nöbet Kalkanı Durum Kartı (`ActiveSentinelStatusCard.tsx`): Gerçek canlı API verisiyle eşik aşımı denetimi.
     - 4 Aktif Nöbet Kural Kartı (`AlertRuleCard.tsx`): Zirai Don (<2°C), Sismik Alarm (<150km, M≥3.0), Deniz Fırtınası (>25 knot), Yangın İndeksi (FWI>35); iOS switch butonları ve eşik hassasiyet düğmeleriyle `localStorage` kalıcılığı (`alertsStorage.ts`).
     - Geçmiş Uyarı Kayıtları (`AlertHistoryTimeline.tsx`): Son 48 saatin zaman damgalı olay zaman çizelgesi (Kritik, Dikkat, Bilgilendirme rozetleri).
  3. `WeekView.tsx`:
     - Apple Weather Tarzı Sıcaklık Aralık Çubukları (`TemperatureRangeBar.tsx`): Haftalık min/max aralığına göre renkli gradyan çubuklar ve bugünün anlık sıcaklık gösterge noktası.
     - Günlük Tahmin Kartları (`DayForecastCard.tsx`): Yağış ihtimali, rüzgâr hızı, zirai don / ilaçlama ve deniz uygunluk etiketleri.
     - Günlük Detay Çekmecesi (`DayDetailDrawer.tsx`): Tıklanan gün için 8 saatlik detaylı sıcaklık/yağış/rüzgâr simülasyonu ve tarla/deniz analiz özeti.
  4. `SettingsView.tsx`:
     - Kayıtlı İstasyonlar & Konumlar (`SavedLocationsManager.tsx`): Çanakkale, Ezine, Bozcaada, Assos, Saros listeleme, arama modalından yeni ekleme, varsayılan yapma (`isDefault`) ve silme.
     - Ölçüm Birimleri (`UnitPreferencesCard.tsx`): Sıcaklık (°C/°F), Rüzgâr (km/sa / knot / m/s), Basınç (hPa/mmHg) `localStorage` yönetimi.
     - PWA & Önbellek Yönetimi (`CacheManagerCard.tsx`): Saklanan veri boyutu hesabı ve önbelleği sıfırlama.
     - Sistem Mimarisi & Altyapı (`SystemArchitectureCard.tsx`): Cloudflare Workers Edge v5 + VDS Node.js çift dağıtım, ~1.1 km GeoGrid ve PWA çevrimdışı hazır durumu.
* **Doğrulama:** Tüm 5 sekme eksiksiz entegre edildi, sıfır emoji kuralına %100 uyuldu, `npm run typecheck` ve `npm run build` ile `packages/web` sıfır hatayla derlendi, kök dizinde 37/37 birim testi (%100 yeşil) ve tüm çalışma alanları derlemesi başarıyla tamamlandı.
