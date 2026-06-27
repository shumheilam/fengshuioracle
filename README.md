# 風生水起 WindWater.HK

A Cantonese-native Traditional Chinese Metaphysics platform offering nine integrated divination and feng shui modules, built with pure HTML/CSS/JavaScript — no frameworks, no backend, no dependencies.

🔗 **Live Demo:** [windwaterhk.vercel.app](https://windwaterhk.vercel.app)

---

## Origin Story

Chinese metaphysics apps have a fragmentation problem. Existing tools focus on a single function — one app for BaZi, another for feng shui, another for the almanac — forcing users to switch between multiple platforms. Most also display raw calculations without interpretation, making them inaccessible to anyone who is not already a practitioner.

WindWater.HK was built to solve this: a single Cantonese-native platform where any user — not just masters — can access, understand, and act on traditional Chinese metaphysical systems.

---

## Modules

| Module | Description |
|--------|-------------|
| **八字命盤 BaZi Chart** | Four Pillars calculation from Gregorian birth date/time; Five Elements distribution; Ten Gods analysis; Useful God (扶抑法); annual luck pillar scoring; career and study direction guidance |
| **求簽解簽 Fortune Sticks** | 12 deities (Guan Yin, Guan Di, Yue Lao, and others); 100 lots with classical verse and plain-language interpretation; animated temple wooden stick animation |
| **合婚配對 Compatibility** | Dual BaZi input; Five Elements radar chart; overall compatibility score; three-dimensional scoring across romance, career, and family |
| **改名系統 Name Analysis** | Three scenarios (newborn / adult / business); 20,717-character Kangxi stroke database; Wu Ge (五格剖象法) analysis; scored candidate name ranking |
| **流年運程 Annual Fortune** | Full-year overview; 12-month timeline; peak and caution months highlighted |
| **神明曆 Deity Calendar** | Lunar calendar with 12 deity birthdays; Jian Chu 12-spirit auspicious/inauspicious day classification; worship guidance |
| **擇日系統 Date Selection** | 7 event types (wedding, business opening, relocation, and more); Jian Chu auspiciousness judgement; recommended auspicious dates |
| **奇門遁甲 Qi Men Dun Jia** | Chai Bu (拆補法) fixed-palace layout engine; Three Peculiarities and Six Protocols ground plate; Nine Stars and Eight Gates heaven plate with Value Officer and Value Messenger markers |
| **風水羅盤 Feng Shui Compass** | Live device compass (iOS/Android); 24 Mountain directional ring; Eight Mansions (八宅法) life-gua analysis; Annual Flying Stars layout (2024–2034, dynamic solar term calculation via 壽星公式) |

---

## Technical Architecture

### Stack
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+) — zero frameworks, zero build tools
- **Deployment:** Vercel (GitHub auto-deploy)
- **PWA:** Installable on iOS (Add to Home Screen) and Android (Chrome)

### Design Decisions

**Why no React/Vue/Next.js?**
The app is computation-heavy, not UI-state-heavy. Vanilla JS modules communicate directly with the calculation engines without reconciliation overhead. This keeps the bundle size minimal, eliminates build pipeline complexity, and allows the entire app to function offline once cached.

**Algorithmic Complexity**
Despite the static delivery, the calculation layer is non-trivial:
- BaZi engine: Gregorian → Lunar conversion, Heavenly Stems and Earthly Branches derivation, Ten Gods mapping, Useful God analysis via 扶抑法
- Qi Men Dun Jia: Chai Bu 拆補法 starting-palace determination, full 9×9 plate arrangement with all classical markers
- Flying Stars: Dynamic annual star entry calculation using the 壽星公式 astronomical formula for precise solar term boundaries — no hardcoded yearly lookup tables
- Eight Mansions: 大游年歌訣 reconstructed and validated against 3 symmetry sets
- Kangxi Database: 20,717-character stroke count lookup for name analysis

---

## Product Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1–3 | ✅ Complete | All 9 core modules, full algorithmic calculation layer, beta user testing |
| Phase 4 | 🔄 In Progress | Anthropic Claude API integration — AI fortune stick interpretation (Haiku model), deep BaZi report (Sonnet model), feng shui Q&A, face and palm reading (Vision API) |
| Phase 5 | 📋 Planned | Stripe payment integration, user accounts, PDF report export, custom domain windwater.hk |

---

## Validation

The accuracy of each module has been cross-validated with a practising Taoist master in Hong Kong, combining computational precision with traditional authority.

---

## Developer

**Hayley Shum (Hei Lam Shum)**  
Final-year BEng (Hons) Electrical & Electronic Engineering, Auckland University of Technology

This project demonstrates applied skills in complex algorithmic system design, AI product architecture and API integration planning, full product lifecycle ownership from ideation through deployment, and cross-domain knowledge synthesis combining engineering with traditional knowledge systems.

📧 hayleyshum0317@gmail.com  
🔗 [linkedin.com/in/hei-lam-shum](https://linkedin.com/in/hei-lam-shum)  
🌐 [windwaterhk.vercel.app](https://windwaterhk.vercel.app)  
💻 [github.com/shumheilam](https://github.com/shumheilam)
