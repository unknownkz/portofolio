<div align="center">

<img src="../logo-a.png" alt="Axel A. L Logo" width="312" height="312" />

# Axel Alexius Latukolan

**Web3 Analyst · Data Processing Specialist · Hospitality Professional**

[![Website](https://img.shields.io/badge/Live-axelal.my.id-38bdf8?style=flat-square&logo=vercel&logoColor=white)](https://www.axelal.my.id)
[![PWA](https://img.shields.io/badge/PWA-Ready-22c55e?style=flat-square&logo=googlechrome&logoColor=white)](https://www.axelal.my.id)
[![AI](https://img.shields.io/badge/AI-HEXA%20Assistant-a855f7?style=flat-square&logo=googlegemini&logoColor=white)](https://www.axelal.my.id)
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
- [Cara Update Icon App](#cara-update-icon-app)
- [HEXA AI Assistant](#hexa-ai-assistant)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

---

## Tentang

Repository ini berisi source code website portofolio digital milik **Axel Alexius Latukolan** — menampilkan pengalaman kerja, keahlian teknis, dan informasi kontak secara profesional.

Dibangun dengan **pure HTML, CSS, dan JavaScript** (tanpa framework), dengan fokus pada performa, aksesibilitas, dan pengalaman pengguna yang modern, serta dilengkapi dengan AI assistant bernama **HEXA** yang menggunakan Multiple Model. PWA dengan auto-update system, dan bilingual support (ID/EN).

---

## Live Preview

🌐 **[www.axelal.my.id](https://www.axelal.my.id)**

---

## Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 🎨 **Animated UI** | Particle canvas, custom cursor, parallax, orbit logo, typing effect, etc |
| 🌗 **Dark / Light Mode** | Toggle tema dengan preferensi tersimpan di localStorage |
| 🌐 **Bilingual (ID / EN)** | Seluruh konten beralih bahasa secara dinamis tanpa reload |
| 📱 **Responsive** | Tampilan optimal dari mobile 320px hingga desktop 4K |
| ⚡ **PWA Ready** | Installable, offline support, auto-update + reinstall system |
| 🤖 **HEXA AI Assistant** | Chat widget bilingual berbasis Openrouter AI (API) |
| 🔔 **Auto Update Toast** | Notifikasi versi baru otomatis saat deploy — bilingual ID/EN |
| 🔄 **Reinstall Detection** | Toast khusus saat icon/nama app berubah — panduan reinstall otomatis |
| 🔒 **Security Headers** | CSP, HSTS, X-Frame-Options, CORP, COOP via Vercel |
| 🛡️ **Content Protection** | Blokir klik kanan, drag gambar, DevTools shortcut — bilingual toast |
| 🔍 **SEO Optimized** | Open Graph, Twitter Card, sitemap.xml, robots.txt, canonical URL |
| ♿ **Accessible** | ARIA labels, role attributes, `aria-live`, keyboard navigation |

---

## Teknologi

```
Frontend
├── HTML5              Semantic markup, ARIA accessibility
├── CSS3               Design tokens, glassmorphism, CSS variables, keyframes
└── JavaScript ES6+    Module pattern, IntersectionObserver, Web APIs

AI & Backend
├── HEXA (Multiple Model)  AI assistant via Openrouter
├── /api/chat.js             Proxy endpoint — API key aman di server
└── Markdown Parser          Render bold, italic, code, list dari respons AI

PWA & Performance
├── Service Worker     Cache-First + Network-First, auto-update + reinstall
├── Web App Manifest   Multi-size icons (48–512px), maskable icon
└── Preload/Preconnect Critical asset hints

Typography & Icons
├── Poppins (Google Fonts)   Primary typeface
└── Font Awesome 6.5         Navigation & social icons

Hosting & Security
├── Vercel             Deployment, cleanUrls, Edge Functions, security headers
└── Custom Domain      axelal.my.id (via Vercel DNS)
```

---

## Struktur Project

```
/
├── index.html              # Halaman utama (semantic HTML5, ARIA)
├── css/
    ├── style.css           # Stylesheet utama (design tokens → components)
    └── style.min.js        # Minify
│
├── js/
    ├── script.js           # Core JavaScript (module pattern)
    └── script.min.js       # Minify
│
├── update-manager.js       # PWA auto-update + reinstall system (bilingual)
├── service-worker.js       # Cache strategy + update/manifest messaging
├── manifest.json           # PWA manifest (multi-size icons, scope)
├── robots.txt              # Crawler directives
├── sitemap.xml             # XML sitemap untuk SEO
├── vercel.json             # Deployment config + security headers
│
├── profile.webp            # Hero photo
├── logo-a.png              # Logo navbar & loader
├── preview.png             # OG / Twitter card image (1200×630)
├── cv.pdf                  # Curriculum Vitae (downloadable)
│
├── api/
│   └── chat.js             # Base Function — Openrouter AI (HEXA)
│
├── chat/
│   ├── chat-widget.js      # HEXA AI chat widget + Markdown parser (bilingual)
│   └── chat-widget.css     # Styling widget + dark/light mode + mobile
│
└── picture/
    ├── flag/
    │   ├── id.png          # Flag Indonesia (language switcher)
    │   └── gb.png          # Flag UK / English (language switcher)
    └── icons/
        ├── icon-48.png     # PWA icon — browser favicon, taskbar
        ├── icon-72.png     # PWA icon — Android legacy
        ├── icon-96.png     # PWA icon — Android legacy
        ├── icon-128.png    # PWA icon — Chrome Web Store
        ├── icon-192.png    # PWA icon — Android home screen
        ├── icon-512.png    # PWA icon — Splash screen
        └── icon-maskable.png  # PWA icon — adaptive Android launcher
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

> ⚠️ **HEXA AI tidak akan jalan di lokal** tanpa environment variable `OPENROUTER_API_KEY`. Set via Vercel dashboard untuk production.

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

Setiap deploy, **wajib naikkan `SW_VERSION`** dan set **`UPDATE_TYPE`** di `service-worker.js`:

```js
const SW_VERSION  = 'axelal-v4.2'; // naikan setiap deploy
const UPDATE_TYPE = 'content';      // 'content' | 'manifest'
```

### Tabel panduan UPDATE_TYPE

| Jenis perubahan | `UPDATE_TYPE` | Toast yang muncul |
|---|---|---|
| Update teks, foto, CSS, JS | `'content'` | Toast biasa → reload |
| Ganti icon app, nama app | `'manifest'` | Toast khusus → panduan reinstall |

### Contoh alur versi

```
v4.1  → update bio              → v4.2   UPDATE_TYPE = 'content'
v4.2  → ganti icon app          → v4.3   UPDATE_TYPE = 'manifest'
v4.3  → tambah fitur baru       → v5     UPDATE_TYPE = 'content'
v5    → ganti nama app          → v5.1   UPDATE_TYPE = 'manifest'
```

---

## Cara Update Icon App

Icon PWA tersimpan di `picture/icons/`. Untuk mengganti icon:

1. Siapkan icon baru dalam ukuran berikut:

   | File | Ukuran | Digunakan untuk |
   |---|---|---|
   | `icon-48.png` | 48×48 px | Browser favicon, taskbar |
   | `icon-72.png` | 72×72 px | Android legacy |
   | `icon-96.png` | 96×96 px | Android legacy |
   | `icon-128.png` | 128×128 px | Chrome Web Store |
   | `icon-192.png` | 192×192 px | Android home screen |
   | `icon-512.png` | 512×512 px | Splash screen |
   | `icon-maskable.png` | 512×512 px | Adaptive icon Android |

2. Ganti file lama dengan yang baru (nama harus sama persis)
3. Set `UPDATE_TYPE = 'manifest'` di `service-worker.js`
4. Naikkan `SW_VERSION` dan push ke GitHub
5. User yang sudah install akan dapat toast panduan **Reinstall App**

> 💡 **Tips maskable icon:** Logo harus berada di tengah dengan padding minimal **40%** di semua sisi agar tidak terpotong oleh Android launcher.

---

## HEXA AI Assistant

HEXA adalah AI assistant menggunakan **Multiple Model** yang terintegrasi langsung di website.

### Fitur HEXA

- 💬 Chat widget di pojok layar — tidak mengganggu konten
- 🌐 Bilingual ID/EN — mengikuti bahasa aktif website
- 📝 Markdown rendering — bold, italic, code, list, heading
- 💾 Riwayat chat tersimpan di localStorage
- 🔒 API key aman di server (Vercel)
- ⚡ Rate limiting 15 request/menit per IP

### Setup HEXA

1. Dapatkan API key gratis di [openrouter.ai](https://openrouter.ai)
2. Buka Vercel dashboard → project → **Settings → Environment Variables**
3. Tambah: `OPENROUTER_API_KEY` = paste API key kamu
4. Klik Save → Redeploy

### Arsitektur

```
Browser → /api/chat (Vercel) → Openrouter API
                ↑
        API key aman di server
        tidak terekspos ke client
```

---

## Kontribusi

Repository ini adalah portofolio pribadi dan tidak menerima pull request.
Namun **feedback, saran, atau bug report** sangat diterima melalui [Issues](https://github.com/unknownkz/Portofolio/issues).

---

## Lisensi

```
MIT License

Copyright © 2026–present  Axel Alexius Latukolan / unknownkz
All Rights Reserved.

Source code ini dibagikan untuk keperluan referensi dan pembelajaran.
Dilarang mendistribusikan ulang, memodifikasi, atau menggunakan
sebagian/seluruh konten untuk tujuan komersial tanpa izin tertulis.
```

---

Dibuat dengan passion ⚡ oleh **[Axel Alexius Latukolan](https://www.axelal.my.id)**

</div>
