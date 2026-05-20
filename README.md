# 🧠 Countor v2 — Mental Wellness Platform

A React + Vite app with PHQ-9/GAD-7 structured screening, a Reddit-style community forum, therapist directory, streaks, and an admin dashboard.

---

## ✨ What's New in v2

| Feature | Details |
|---|---|
| 📋 PHQ-9 / GAD-7 Questionnaire | 10 clinically-derived questions (6 from PHQ-9, 4 from GAD-7). One question at a time with animated option cards. Deterministic scoring — no AI API needed. |
| 🌿 Community Forum | Reddit-style posts with categories, upvotes, comments, anonymous posting, sorting (New / Top / Active), and 10 topic categories. |
| 🔥 Streaks & Heatmap | 8 achievement badges, 12-week GitHub-style activity heatmap. |
| 👩‍⚕️ Therapist Directory | Filterable by specialty, language, max fee. |
| ⚙️ Admin Dashboard | KPI cards, bar chart, tier distribution, per-user CSV export. |

---

## 🚀 Quick Start

```bash
npm install
npm run dev
# Open http://localhost:5173
```

---

## 📁 File Structure

```
countor/
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.jsx
│   ├── App.jsx                          # Root + page routing
│   ├── context/AppContext.jsx           # Global auth & history state
│   ├── utils/storage.js                 # localStorage + CSV export
│   ├── data/recommendations.js          # Questions, tiers, recs, therapists, badges
│   ├── styles/global.css               # Full design system
│   └── components/
│       ├── UI.jsx                       # Shared components
│       ├── TopNav.jsx                   # Navigation bar
│       ├── AuthScreen.jsx               # Login / Sign up
│       ├── Dashboard.jsx                # Main dashboard + trend chart
│       ├── CheckinQuestionnaire.jsx     # PHQ-9/GAD-7 questionnaire UI
│       ├── ResultsScreen.jsx            # Score + recommendations
│       ├── CommunityPage.jsx            # Reddit-style forum
│       ├── TherapistDirectory.jsx       # Filterable therapist list
│       ├── StreaksPage.jsx              # Gamification + heatmap
│       └── AdminPage.jsx               # Admin stats + CSV export
```

---

## 📊 Scoring (PHQ-9 + GAD-7)

| Raw Score | Wellness Score | Tier |
|---|---|---|
| 0–4   | 87–100 | 🌿 Healthy |
| 5–9   | 70–83  | 🌤 Mild |
| 10–14 | 53–67  | 🌧 Moderate |
| 15–19 | 37–50  | ⛈ Moderately Severe |
| 20–30 | 0–33   | 🆘 Severe |

---

## 🌿 Community Forum

- **10 categories**: General, Anxiety, Depression, Work Stress, Students, Sleep, Motivation, Self-care, Small Wins
- **Features**: Upvotes, comments, comment upvotes, anonymous posting, delete own posts/comments
- **Sorting**: New, Top, Most Active
- **Stored in**: `localStorage` — for production, swap with Firebase/Supabase

---

## ⚠️ Disclaimer

Countor uses validated screening tools for informational purposes only. It is **not a diagnostic tool**. If you are in crisis: **iCall: 9152987821** (India, free, Mon–Sat 9am–10pm).

---

## 🏭 Production Checklist

- [ ] Replace localStorage with Firebase / Supabase for real multi-user community
- [ ] Add rate limiting (max 1–2 check-ins per day)
- [ ] Add content moderation for community posts
- [ ] Add GDPR/data consent banner
- [ ] Review scoring with a licensed clinical professional
- [ ] Set up Sentry for error monitoring
