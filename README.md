# Jalalabad Masjid & Islamic Centre — Birmingham

A modern, responsive web application and prayer time dashboard for Jalalabad Masjid & Islamic Centre at Selly Oak, Birmingham.

## ✨ Features
- 🕌 Live Daily & Monthly Prayer Timetable
- ⏱️ Real-time countdown to next Salah & Friday Jumua'h
- 🌙 Sleek Light & Dark Mode with seamless persistence
- 📖 Quran Portal & Community Services
- 🌐 Multilingual support (English & Arabic)
- ⚡ Lightning-fast performance built with Vite + React + Tailwind CSS v4

---

## 🛠️ Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000/` in your browser.

---

## 🚀 Deploying to Cloudflare Pages

### Option 1: Direct Deploy via Wrangler CLI
```bash
npm run build
npm run deploy
```

### Option 2: Deploy via GitHub / Cloudflare Dashboard
1. Connect your repository to **Cloudflare Pages**.
2. Set the following build settings:
   - **Framework Preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js version:** `20` (or `18+`)
3. Click **Save and Deploy**!
