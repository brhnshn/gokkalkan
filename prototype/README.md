# GÖKKALKAN · iOS Liquid Glass Hava & Erken Uyarı Tasarım Prototipi
**Çanakkale & Kuzey Ege Özel Sürümü**

Bu prototip, Apple iOS Human Interface standartları, modern Liquid Glass materyal mimarisi ve yüksek dokunsal hassasiyetle inşa edilmiş tam etkileşimli bir web prototipidir.

---

## 💎 Temel Özellikler & Mühendislik Standartları

1. **SIFIR EMOJİ KURALI (Zero Emoji):**
   - Prototipte hiçbir işletim sistemi emojisi kullanılmamıştır.
   - Tüm hava durumu simgeleri, tarım, denizcilik, sismik ve navigasyon ikonları `js/icons.js` içinde tanımlı 24x24 özel SVG vektörleridir.

2. **iOS Havada Yüzen (Floating) Liquid Glass Navbar:**
   - Ekranın altına yapışık klasik tab bar yerine; alttan 22px, yanlardan 16px içeride havada asılı duran kapsül (`rounded-full`) tasarımı.
   - `backdrop-filter: blur(28px) saturate(190%)` ve çok katmanlı kırılma hissi veren cam parlama gölgeleri.
   - Sekmeler arasında geçişte aktif sekmenin arkasında akıcı biçimde kayan **Sliding Pill Indicator** mekanizması.

3. **Açık Tema (Gündüz) & Koyu Tema (Gece) + Dairesel Perdeleme (`circle(...)`):**
   - Açık tema (Alabaster & Slate `#f4f6fa`) ve Koyu Gece teması (Deep Midnight `#0b0f19`).
   - Üst bardaki tema değiştirici butonuna tıklandığında, tıklanan farenin/dokunmanın koordinatlarından dışa doğru yayılan SVG/CSS `clip-path: circle(...)` perdeleme animasyonu.

4. **24 Saatlik Canlı Risk Şeridi (Interactive Scrubber):**
   - Çanakkale Barbaros istasyonunun 24 saatlik yeşil/sarı/turuncu risk barları.
   - Fare veya parmakla barlar üzerinde gezildikçe (scrubbing):
     - Anlık hava durumu ve sıcaklık canlı değişir.
     - 4 SVG Arc Gauge kadranı (Yağış, Rüzgar, Dolu/Yıldırım, Yangın) anında reaktif olarak yeni değerlerine animasyonla kayar.

5. **Özel Alan Modülleri & iOS Bottom Sheet:**
   - **Son Deprem:** M 2.9 Biga/Çanakkale depremi, arka planda animasyonlu sismik dalga halkaları, EMSC teyitli veriler ve yapılandırılabilir sismik erken uyarı parametreleri modalı.
   - **Tarlam:** Başak SVG ikonu, toprak nemi (%42), zirai don riski (%5), ilaçlama uygunluğu analizi içeren iOS alt çekmecesi (bottom sheet).
   - **Denizde:** Çapa SVG ikonu, dalga boyu (0.4m), su sıcaklığı (16°C), rüzgar hamlesi (8 knot) ve Çanakkale Boğazı güney akıntı analizi çekmecesi.

6. **Canlı Harita & Radar Motoru (HTML5 Canvas):**
   - Çanakkale Boğazı, Gelibolu Yarımadası, Bozcaada ve Gökçeada coğrafi topografyası.
   - 4 Katman: Yağış Radarı, Rüzgar Partikül Akışı, Deprem Fay Hatları & Sismik Dalgalar, Kaz Dağları Yangın İndeksi.
   - -2 saatten +1 saate zaman oynatıcı (Play/Pause & Timeline scrubber).

7. **7 Günlük Apple Weather Aralık Çubukları:**
   - Günlük en düşük ve en yüksek sıcaklık aralığını gösteren gradyan renkli pill barlar.
   - Bugün için anlık sıcaklık gösterge noktası.
   - Gün kartına tıklandığında açılan saatlik tahmin dökümü.

---

## 📂 Dosya Yapısı & Modüler Mimari

```text
prototype/
├── index.html          # Ana prototip (5 sekme, modal & drawer entegrasyonu, iPhone çerçevesi)
├── bugun.html          # Bugün sekmesine odaklı bağımsız açılabilir görünüm
├── harita.html         # Radar haritasına odaklı bağımsız açılabilir görünüm
├── uyarilar.html       # Uyarı ve nöbet kurallarına odaklı bağımsız açılabilir görünüm
├── yedi-gun.html       # 7 günlük Apple Weather tahminine odaklı görünüm
├── ayarlar.html        # Konum ve birim ayarlarına odaklı görünüm
├── README.md           # Proje ve prototip dokümantasyonu
├── styles/
│   ├── theme.css       # Açık/Koyu tema token'ları ve Dairesel Tema Perdelemesi
│   └── liquid-glass.css# iOS Liquid Glass, Dynamic Island, Scrubber, Gauges, Drawer stilleri
└── js/
    ├── icons.js        # Sıfır emojili yüksek kaliteli Apple SF / Lucide SVG kütüphanesi
    ├── data.js         # 24 saatlik scrubber, 7 gün, sismik, tarla ve deniz mock verileri
    ├── map-engine.js   # Çanakkale Boğazı Canvas radar, partikül ve sismik harita motoru
    └── app.js          # Sekme yönetimi, sliding pill, scrubber reaktivitesi, drawer controller
```

---

## 🚀 Çalıştırma

Prototip tamamen sıfır bağımlılıklıdır (No npm install required):
1. `index.html` dosyasına çift tıklayarak herhangi bir modern tarayıcıda doğrudan açabilirsiniz.
2. Veya bir yerel sunucu ile:
   ```bash
   npx serve prototype
   # veya
   python -m http.server 8000 --directory prototype
   ```
3. Masaüstünde incelerken üstteki **"Tam Ekran Görünüm"** butonu ile iPhone 16 Pro çerçevesi ile responsive tam ekran arasında anında geçiş yapabilirsiniz.
