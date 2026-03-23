# 🗺️ Revised Roadmap: Signal App

We are replacing the Railway/RSS-Bridge dependency with **RSS.App JSON Feeds** for stability and maintenance relief. 

---

## 🟢 Phase 1: Core Feed Upgrade (High Priority)
Update the loading system to pull live data securely from your new RSS endpoints now that you aren't scraping it yourself.

- [ ] **1.1. Refactor API Fetching (`src/app/page.tsx`)**
  - Update `fetchAllFeedsData` to identify absolute URLs. 
  - If a database row URL starts with `http` (e.g. RSS.app streaming node), fetch it **directly** instead of appending Railway variables.
  
- [ ] **1.2. JSON Item Normalization**
  - Test map structure between RSS-Bridge and RSS.App (e.g., confirming `content_html`, `date_published`, and `author`).
  - Add fallbacks to ensure X (Twitter) items render descriptions properly the same way as before.

- [ ] **1.3. Update Admin Placeholders (`src/app/admin/page.tsx`)**
  - Adjust descriptions to guide you on pasting the RSS.app feed JSON file path instead of raw profile handles.

---

## 🟡 Phase 2: Mobile Interface / PWA (Design Polish)
To secure the iPhone/iPad "dedicated app" experience without creating an App Store package.

- [ ] **2.1. manifest.json Setup**
  - Add definition for standalone app support, workspace colors, and themes.
- [ ] **2.2. Apple Mobile Web Meta tags**
  - Integrate `apple-mobile-web-app-capable` properties in Next.js `layout.tsx` metadata headers to hide browser bars on scroll.
- [ ] **2.3. Safe Area Padding**
  - Add native safe buffers to top or bottom bar layout modules for smooth navigation without hitting iPhone dynamic island/home-swipe zones.

---

## ⚪ Phase 3: Extras (Deployment)
- [ ] **3.1. Verify Vercel Variables**
  - Remove Railway references to prevent crashing build hooks.
