---
name: "Gökkalkan — iOS Liquid Glass Weather & Risk Radar"
theme_priority: "light_and_dark_adaptive"
tokens:
  colors:
    light:
      bg_primary: "#f4f6fa"
      bg_elevated: "rgba(255, 255, 255, 0.72)"
      text_primary: "#0f172a"
      text_secondary: "#475569"
      border_specular: "rgba(255, 255, 255, 0.85)"
      accent_safe: "#10b981"
      accent_warning: "#f59e0b"
      accent_danger: "#ef4444"
      accent_marine: "#0284c7"
    dark:
      bg_primary: "#0b0f19"
      bg_elevated: "rgba(22, 29, 45, 0.68)"
      text_primary: "#f8fafc"
      text_secondary: "#94a3b8"
      border_specular: "rgba(255, 255, 255, 0.16)"
      accent_safe: "#15803d"
      accent_warning: "#eab308"
      accent_danger: "#dc2626"
      accent_marine: "#0369a1"
  typography:
    font_sans: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
    hero_temp: "4.5rem"
    section_label: "0.72rem"
    body: "0.9375rem"
  radius:
    card: "22px"
    pill: "9999px"
    floating_nav: "32px"
  motion:
    tactile_scale: 0.97
    pill_spring: "cubic-bezier(0.16, 1, 0.3, 1)"
    theme_wipe: "circle(150% at var(--wipe-x) var(--wipe-y))"
---

# GÖKKALKAN Tasarım Sistemi (`DESIGN.md`)

## 1. Görsel Felsefe & iOS Liquid Glass Kuralları
* **Sıfır Emoji Kuralı:** Arayüzde işletim sistemi emojileri kesinlikle kullanılmaz. Tüm meteorolojik, tarımsal, denizcilik ve sismik semboller `stroke-width="1.8"` hassasiyetinde özel SVG vektörleridir.
* **Havada Yüzen (Floating) Bottom Navbar:** Alt sekme çubuğu ekranın dibine yapışmaz; alttan `calc(18px + env(safe-area-inset-bottom))`, yanlardan `16px` içeride, `backdrop-filter: blur(28px) saturate(190%)` ve üst iç kırılma yansımasıyla (`inset 0 1px 0 rgba(255,255,255,0.28)`) havada süzülür.
* **Sakin Yüzeyler, Dokunsal Eylemler:** Büyük bilgi kartlarında `hover:translateY` sıçramaları yoktur. Yalnızca doğrudan tıklanabilir butonlar, saat şeridi ve sekme hapları `active:scale-[0.97]` fiziksel yaylanma tepkisi verir.
* **Dairesel Tema Perdelemesi (`circle(...)`):** Açık (Gündüz) ve Koyu (Gece) modları arasındaki geçiş, tıklanan koordinattan genişleyen dairesel `clip-path` perdesiyle gerçekleşir.
* **WCAG AA Erişilebilirlik:** Cam yüzeylerin arkasındaki kontrast düşüşünü önlemek için yarı saydam yüzeylerde en az `4.5:1` metin kontrastı zorunludur.
