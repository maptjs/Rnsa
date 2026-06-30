# 🇲🇦 RNSA Maroc — Réseau National de Sauvetage Animalier

> Morocco's first AI-powered national stray animal rescue network.
> Real-time volunteers, predictive hotspots, animal identity graph, and B2G government API.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/rnsa-maroc)

---

## 🚀 Live Demo

[https://rnsa-maroc.vercel.app](https://rnsa-maroc.vercel.app)

---

## ✨ 6 Unique Systems

| # | System | Description |
|---|--------|-------------|
| U1 | **Animal Identity Graph** | 512-dim photo embeddings via pgvector — same animal recognized across cities |
| U2 | **Predictive Hotspot Engine** | Post-Eid, Ramadan, souk patterns — pre-position volunteers before crises |
| U3 | **Dead Zone Radar** | PostGIS 10km grid scan every 6h — recruit citizens in coverage gaps |
| U4 | **Community Stewardship** | Jmaa-model 500m zones — café owners, mosque guardians as Zone Stewards |
| U5 | **Full Lifecycle Tracking** | Report → Rescue → Vet → Foster → Adoption → 1-year check-ins |
| U6 | **B2G Government API** | Municipal SaaS — animal density maps, disease vectors, cost analytics |

---

## 🛠 Tech Stack

```
Frontend:   Next.js 14 (App Router) + TypeScript + Tailwind CSS
Maps:       React-Leaflet (OpenStreetMap tiles)
Charts:     Chart.js + react-chartjs-2
Backend:    Supabase (PostgreSQL + Auth + Storage + Realtime)
AI:         OpenAI Vision API + pgvector cosine similarity
Extensions: PostGIS (geospatial) + pgvector (embeddings)
Notifs:     Firebase Cloud Messaging (FCM)
Deploy:     Vercel (frontend) + Supabase (backend + Edge Functions)
```

---

## 📦 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/rnsa-maroc.git
cd rnsa-maroc
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-...
```

### 3. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Enable extensions in SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS vector;
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```
3. Run the migration:
   ```bash
   # Paste contents of supabase/migrations/001_initial_schema.sql
   # into Supabase SQL Editor and execute
   ```

### 4. Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy all 7 Edge Functions
supabase functions deploy classify-report
supabase functions deploy match-volunteers
supabase functions deploy accept-intervention
supabase functions deploy identify-animal
supabase functions deploy predict-hotspots
supabase functions deploy scan-dead-zones
supabase functions deploy b2g-stats

# Set secrets for Edge Functions
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set FCM_SERVER_KEY=your-fcm-key
```

### 5. Schedule Cron Jobs

In Supabase Dashboard → Database → Cron:

```sql
-- Predict hotspots daily at 06:00 Casablanca time (05:00 UTC)
SELECT cron.schedule(
  'predict-hotspots-daily',
  '0 5 * * *',
  $$SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/predict-hotspots',
    headers:='{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  )$$
);

-- Scan dead zones every 6 hours
SELECT cron.schedule(
  'scan-dead-zones-6h',
  '0 */6 * * *',
  $$SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/scan-dead-zones',
    headers:='{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  )$$
);
```

### 6. Run Locally

```bash
npm run dev
# → http://localhost:3000
```

---

## 🚢 Deploy to Vercel

### Option A: One-click (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/rnsa-maroc)

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENAI_API_KEY

# Deploy to production
vercel --prod
```

### Option C: GitHub → Vercel (auto-deploy)

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repo
4. Add environment variables in Vercel Dashboard
5. Deploy — every `git push` auto-deploys

---

## 📁 Project Structure

```
rnsa-maroc/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── dashboard/            # KPI overview
│   │   ├── map/                  # National live map
│   │   ├── reports/              # Signalements list
│   │   ├── animals/              # Animal identity DB
│   │   ├── volunteers/           # Volunteer management
│   │   ├── hotspots/             # Predictive heatmap
│   │   ├── b2g/                  # Government API panel
│   │   ├── settings/             # System config
│   │   └── api/                  # Next.js API routes
│   ├── components/               # Shared UI components
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client
│   │   ├── utils.ts              # Utilities
│   │   └── mock-data.ts          # Demo data
│   ├── types/                    # TypeScript types
│   └── styles/globals.css        # Global styles
├── supabase/
│   ├── migrations/               # SQL schema
│   └── functions/                # 7 Edge Functions (Deno/TS)
│       ├── classify-report/      # EF1: AI urgency + animal type
│       ├── match-volunteers/     # EF2: Geospatial volunteer matching
│       ├── accept-intervention/  # EF3: Atomic accept/lock
│       ├── identify-animal/      # EF4: pgvector identity search
│       ├── predict-hotspots/     # EF5: Daily cron prediction
│       ├── scan-dead-zones/      # EF6: 6h cron dead zone scan
│       └── b2g-stats/            # EF7: Municipality API
└── public/icons/                 # Logo + favicon SVG
```

---

## 🗄 Database Schema

12 tables with PostGIS + pgvector:

- `profiles` — Users (citizen | volunteer | steward | vet | admin)
- `animals` — Animal identity graph with `VECTOR(512)` embeddings
- `reports` — Signalements with `GEOGRAPHY(POINT)` location
- `interventions` — Volunteer response tracking
- `stewardship_zones` — 500m neighborhood zones
- `lifecycle_events` — Full animal journey log
- `adoptions` — Adoption + check-in tracking
- `organizations` — Verified vets, shelters, NGOs
- `predicted_hotspots` — AI-generated risk zones
- `notifications` — Per-user notification log
- `municipality_subscriptions` — B2G API keys

---

## 🌍 Localization

- Primary: French (`fr-MA`)
- Secondary: Arabic RTL support
- Date format: DD/MM/YYYY (Moroccan standard)
- Phone: +212 prefix

---

## 🔒 Security

- Supabase Auth (email + phone OTP)
- Row Level Security on all 12 tables
- EXIF stripping on image uploads
- Rate limiting: 10 reports/user/24h
- B2G API key authentication
- JWT 1h expiry + refresh tokens

---

## 📊 Admin Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/dashboard` | KPI overview + charts |
| `/map` | Live national map (Leaflet) |
| `/reports` | Signalements list + filters |
| `/animals` | Animal identity database |
| `/volunteers` | Volunteer leaderboard + badges |
| `/hotspots` | Predictive heatmap |
| `/b2g` | Government API + key management |
| `/settings` | System configuration |

---

## 🤝 Contributing

1. Fork this repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT — Built for Morocco 🇲🇦

---

*RNSA Maroc — Chaque animal a une histoire. Aidez-la à continuer.*
