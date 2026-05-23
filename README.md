<div align="center">

<img src="logo-a.png" alt="Axel AL Logo" width="80" height="80" />

# Axel Alexius Latukolan

**Web3 Analyst · Data Processing Specialist · Hospitality Professional**

[![Website](https://img.shields.io/badge/Live-axelal.my.id-38bdf8?style=flat-square&logo=vercel&logoColor=white)](https://www.axelal.my.id)
[![PWA](https://img.shields.io/badge/PWA-Ready-22c55e?style=flat-square&logo=googlechrome&logoColor=white)](https://www.axelal.my.id)
[![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-ef4444?style=flat-square)](#lisensi)
[![Last Update](https://img.shields.io/badge/Last%20Update-May%202026-f59e0b?style=flat-square)](https://github.com/unknownkz/Portofolio/commits/main)

---

*Portofolio digital profesional — dibangun tanpa framework, tanpa build step.*

</div>

---

## Daftar Isi

- [Tentang](#tentang)
- [Live Preview](#live-preview)
- [Fitur Utama](#fitur-utama)
- [Teknologi](#teknologi)
- [Struktur Project](#struktur-project)
- [Menjalankan Secara Lokal](#menjalankan-secara-lokal)
- [Deploy](#deploy)
- [Cara Update PWA](#cara-update-pwa)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

---

## Tentang

Repository ini berisi source code website portofolio digital milik **Axel Alexius Latukolan** — menampilkan pengalaman kerja, keahlian teknis, dan informasi kontak secara profesional.

Dibangun dengan **pure HTML, CSS, dan JavaScript** (tanpa framework), dengan fokus pada performa, aksesibilitas, dan pengalaman pengguna yang modern. Website mendukung PWA sehingga bisa diinstall sebagai aplikasi di perangkat mobile maupun desktop.

---

## Live Preview

🌐 **[www.axelal.my.id](https://www.axelal.my.id)**

---

## Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 🎨 **Animated UI** | Particle canvas, custom cursor, parallax, orbit logo, typing effect |
| 🌗 **Dark / Light Mode** | Toggle tema dengan preferensi tersimpan di localStorage |
| 🌐 **Bilingual (ID / EN)** | Seluruh konten beralih bahasa secara dinamis tanpa reload |
| 📱 **Responsive** | Tampilan optimal dari mobile 320px hingga desktop 4K |
| ⚡ **PWA Ready** | Installable, offline support via Service Worker, auto-update system |
| 🔔 **Auto Update Toast** | Notifikasi versi baru muncul otomatis saat deploy — bilingual |
| 🔒 **Security Headers** | CSP, HSTS, X-Frame-Options, CORP, COOP via Vercel |
| 🛡️ **Content Protection** | Blokir klik kanan, drag gambar, DevTools shortcut |
| 🔍 **SEO Optimized** | Open Graph, Twitter Card, sitemap.xml, robots.txt, canonical URL |
| ♿ **Accessible** | ARIA labels, role attributes, `aria-live`, keyboard navigation |

---

## Teknologi

```
Frontend
├── HTML5          Semantic markup, ARIA accessibility
├── CSS3           Design tokens, glassmorphism, CSS variables, keyframes
└── JavaScript     ES6+ modules, IntersectionObserver, Web APIs

PWA & Performance
├── Service Worker Cache-First + Network-First strategy, auto-update system
├── Web App Manifest  Installable PWA, maskable icons
└── Preload / Preconnect  Critical asset hints

Typography & Icons
├── Poppins (Google Fonts)  Primary typeface
└── Font Awesome 6.5        Navigation & social icons

Hosting & Security
├── Vercel         Deployment, cleanUrls, security headers
└── Custom Domain  axelal.my.id (via Vercel DNS)
```

---

## Struktur Project

```
/
├── index.html              # Halaman utama (semantic HTML5, ARIA)
├── style.css               # Stylesheet utama (design tokens → components)
├── script.js               # Core JavaScript (module pattern)
├── update-manager.js       # PWA auto-update detector + bilingual toast
├── service-worker.js       # Cache strategy + update messaging
├── manifest.json           # PWA manifest (icons, scope, orientation)
├── robots.txt              # Crawler directives
├── sitemap.xml             # XML sitemap untuk SEO
├── vercel.json             # Deployment config + security headers
│
├── profile.webp            # Hero photo
├── logo-a.png              # App icon (192px & 512px)
├── preview.png             # OG / Twitter card image (1200×630)
├── cv.pdf                  # Curriculum Vitae (downloadable)
│
└── picture/
    └── flag/
        ├── id.png          # Flag Indonesia (language switcher)
        └── gb.png          # Flag UK / English (language switcher)
```

---

## Menjalankan Secara Lokal

Tidak membutuhkan Node.js, build step, atau dependency apapun.

```bash
# 1. Clone repository
git clone https://github.com/unknownkz/Portofolio.git
cd Portofolio

# 2. Jalankan dengan local server (Service Worker butuh HTTP, bukan file://)
npx serve .
# atau
python3 -m http.server 8080

# 3. Buka di browser
# http://localhost:8080
```

> ⚠️ **Jangan buka `index.html` langsung via `file://`** — Service Worker tidak akan terdaftar tanpa HTTP server.

---

## Deploy

Website di-deploy otomatis ke **Vercel** setiap kali ada push ke branch `main`.

```bash
git add .
git commit -m "feat: deskripsi perubahan"
git push origin main
# → Vercel auto-deploy dalam ~30 detik
```

---

## Cara Update PWA

Setiap deploy perubahan konten, naikkan `SW_VERSION` di `service-worker.js`:

```js
// Sebelum
const SW_VERSION = 'Axel A. L - v4.1';

// Setelah deploy
const SW_VERSION = 'Axel A. L - v5.1';
```

**Alur otomatis:**
1. User membuka website → Service Worker baru terdeteksi di background
2. Toast notifikasi muncul: *"Pembaruan Tersedia — Versi baru v5 siap dipasang"*
3. User klik **Perbarui** → app reload dengan versi terbaru
4. Toast mendukung bahasa ID dan EN sesuai preferensi user

---

## Kontribusi

Repository ini adalah portofolio pribadi dan tidak menerima pull request.
Namun **feedback, saran, atau bug report** sangat diterima melalui [Issues](https://github.com/unknownkz/Portofolio/issues).

---

## Lisensi

```
Copyright © 2026–present  Axel Alexius Latukolan
All Rights Reserved.

Source code ini dibagikan untuk keperluan referensi dan pembelajaran.
Dilarang mendistribusikan ulang, memodifikasi, atau menggunakan
sebagian/seluruh konten untuk tujuan komersial tanpa izin tertulis.
```

---

<div align="center">

Dibuat dengan ❤️ oleh **[Axel Alexius Latukolan](https://www.axelal.my.id)**

</div>
