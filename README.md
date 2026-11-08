# ⚡ PulseMetrics

**Customer retention and revenue analytics for transaction data.** PulseMetrics turns order history into practical views of customer activity, churn, cohort retention, and revenue performance.

## ✨ Features

- 📊 **Executive overview** — monthly active customers, churn rate, ARPU, and LTV:CAC, alongside revenue and retention trends.
- 🧩 **Cohort retention** — compare customer retention over time and spot where cohorts lose momentum.
- 🎛️ **Scenario simulator** — explore how changes to key business assumptions affect projected outcomes.
- 📥 **CSV imports** — preview and validate transaction files before importing them as datasets.
- 💡 **AI Insights panel** — summarizes calculated metrics and produces rule-based recommendations. It does not call an external AI service.
- 🧪 **Synthetic sample data** — the included Supabase migration seeds a sample dataset for exploring the dashboard.

## 🧰 Built With

React · TypeScript · Vite · Tailwind CSS · Recharts · Supabase

## 🚀 Quick Start

### Requirements

- Node.js 20.19+ or 22.12+
- npm
- A Supabase project for loading data and importing CSVs

### Install and run

From the project root:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

### Connect Supabase

1. Create a Supabase project.
2. Run [`supabase/migrations/20261108215433_create_pulse_metrics_schema.sql`](supabase/migrations/20261108215433_create_pulse_metrics_schema.sql) in the Supabase SQL Editor. It creates the dataset and order tables and seeds synthetic sample transactions.
3. Create a `.env.local` file in the project root with your project URL and anon key:

   ```dotenv
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Restart the Vite development server.

The app reads and writes datasets through Supabase. Without these variables, analytics data and CSV imports are unavailable.

> **🔐 Security note:** The included migration enables anonymous reads and inserts and the app has no sign-in flow. It is intended for a demo or trusted environment with non-sensitive data. Before using it with real customer data, add authentication and tighten the row-level security policies.

## 📄 CSV Format

CSV files must be no larger than 5 MB and include these headers:

| Column | Description |
| --- | --- |
| `customer_id` | Stable customer identifier |
| `join_date` | Customer join date in `YYYY-MM-DD` format |
| `order_date` | Order date in `YYYY-MM-DD` format |
| `order_value_kes` | Non-negative order amount in Kenyan shillings |
| `status` | Order status, for example `completed` |

Rows with missing required values, invalid dates, or invalid amounts are skipped and reported in the import preview. Extra columns are allowed.

## 🛠️ Project Scripts

```bash
npm run dev       # Start the local development server
npm run build     # Build the production bundle
npm run preview   # Preview the production bundle locally
npm run lint      # Run ESLint
npm run typecheck # Check application TypeScript types
```

## 🗂️ Project Structure

```text
src/
  components/  Shared dashboard UI
  hooks/       Analytics data loading
  lib/         CSV parsing, metrics, and Supabase access
  views/       Overview, cohort, scenario, and import screens
supabase/
  migrations/  Database schema and synthetic sample data
```