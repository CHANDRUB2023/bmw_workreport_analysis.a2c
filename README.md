# 🇮🇳 A2C ANALYTICAL DASHBOARD
### India & Tamil Nadu District / Pincode Analytics System

A production-grade, standalone Next.js Analytical Dashboard application for All-India postal classification, interactive geographic exploration (GeoJSON state & district boundary maps), dynamic workforce scenario simulation, and multi-format reporting (PDF, CSV, Excel).

---

## 🌟 Key Features

1. **Clean White & Light UI**: Designed specifically for high-stakes faculty & management presentation. Modern card layouts, high-contrast typography, and responsive grid layouts.
2. **Interactive India Map (GeoJSON Polygons)**: Real state polygon boundaries loaded via Leaflet with hover tooltips, click selection, highlight styling, and dynamic state-level dataset statistics.
3. **Interactive Tamil Nadu District Map**: Polygon map covering all 38 Tamil Nadu districts with completion status indicators (Completed vs Pending) and real-time pincode coverage.
4. **Master Dataset Explorer & Table**: Interactive dataset table with live search across 165,627 records, state/district cascading dropdown filters, column sorting, pagination, and one-click CSV & Excel exports.
5. **Workforce Analytics & What-If Simulator**:
   - Cut-off productivity analyzer
   - Dynamic team size output predictor
   - Pending workload burndown chart
   - Manpower requirement forecaster
   - Metro city transit infrastructure benchmarks
6. **One-Click PDF Report Generator**: Client-side multi-page PDF report generation with executive KPIs, geographic charts, workforce scenario forecasts, and productivity insights.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router + Turbopack)
- **UI Engine**: React 19, Tailwind CSS v4, Lucide React
- **Geographic Mapping**: Leaflet, GeoJSON Polygon Data
- **Data Visualization**: Recharts
- **Export Engines**: jsPDF, jsPDF-AutoTable, XLSX, PapaParse

---

## 📁 Project Architecture

```
standalone_analytical_dashboard/
├── app/
│   ├── layout.js              # Global light-theme layout & metadata
│   ├── page.js                # Root dashboard entry point
│   ├── analytics/
│   │   └── page.js            # Analytics Dashboard view
│   └── api/
│       ├── analytics/route.js # Analytics dataset summary endpoint
│       └── pincode/route.js   # Pincode query, filter & search endpoint
├── components/
│   ├── analytics/             # 17 Analytical cards & map visualizations
│   └── tables/
│       └── PincodeDataTable.jsx # Search, filter, sort & paginated data table
├── lib/
│   ├── analyticsDataService.js# In-memory memoized summary engine
│   ├── dataService.js         # CSV parser & lookup service (No local OS dependencies)
│   ├── formatUtils.js         # Normalization & formatting helpers
│   ├── analyticsService.js    # Workforce & productivity calculations
│   ├── productivityService.js # Metrics & metro system definitions
│   ├── pdfAnalyticsExporter.js# Client-side PDF generator
│   └── exportUtils.js         # CSV and Excel export helpers
├── data/
│   └── master_pincode_dataset.csv # 165,627 master dataset records (23 MB)
├── public/
│   ├── india-states.geojson   # Real India state polygon boundaries
│   └── tamil-nadu-districts.geojson # Real TN district polygon boundaries
├── .env.example
├── .gitignore
├── next.config.mjs
├── package.json
└── README.md
```

---

## 🚀 Quickstart & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open your browser at **[http://localhost:3000](http://localhost:3000)**.

### 3. Verify Production Build
```bash
npm run build
npm run start
```

---

## 🌐 Deploying to Vercel

This repository is pre-configured for direct deployment on **Vercel**:

1. Log into your **Vercel** account.
2. Click **Add New Project** ➔ **Import Git Repository**.
3. Select `CHANDRUB2023/bmw_workreport_analysis.a2c`.
4. Keep the framework defaults:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`
5. Click **Deploy**. Vercel will automatically build and deploy the dashboard.

---

## 📄 License & Attribution

Developed for the **A2C Pincode Operations & Intelligence System**.
