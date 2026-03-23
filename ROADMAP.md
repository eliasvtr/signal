# 🗺️ Revised Roadmap: Signal App

We have successfully migrated to **RSS.App**, implemented **Inline media players**, and added a background **Raindrop.io** API pipeline!

---

## 🟢 Phase 1: Mobile Interface / PWA (High Priority)
To secure the iPhone/iPad "dedicated app" experience without creating an App Store package.

- [ ] **1.1. manifest.json Setup**
  - Create `/public/manifest.json` defining standalone app support, icon scaling, workspace colors, and theme rules.
- [ ] **1.2. Apple Mobile Web Meta tags**
  - Integrate `apple-mobile-web-app-capable` properties in Next.js `layout.tsx` metadata headers Node to hide browser address bars in PWA mode.
- [ ] **1.3. App Icons**
  - Provide `.png` formats for Homescreen setup identifiers safely.
- [ ] **1.4. Safe Area Padding**
  - Add native CSS `env(safe-area-inset-bottom)` safe buffers to bottom layouts for smooth scrolling variables without hitting iPhone dynamic island/home-swipe zones.

---

## ⚪ Phase 2: Extras (Deployment)
- [ ] **2.1. Verify Vercel Variables**
  - Cleanup any old dormant Railway references to prevent crashing layout checks going forward.
