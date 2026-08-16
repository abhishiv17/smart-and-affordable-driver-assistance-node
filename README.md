# SADAN — Smart and Affordable Driver Assistance Node

> Fleet Safety Intelligence Platform for MSME Hackathon 6.0

---

## What is SADAN?

SADAN is a driver-safety intelligence platform designed for small and medium logistics fleets operating legacy commercial vehicles. The system provides real-time safety monitoring, driver behavior analysis, and AI-generated safety insights.

### The Problem

Small fleet operators in India run legacy commercial vehicles with no modern safety features. Drivers face fatigue on long routes, harsh driving goes undetected, and fleet managers have no visibility into what's happening on the road.

### The Solution

An affordable ARM-based edge device installed in each vehicle that:
- **Detects drowsiness** via NoIR camera and facial landmark analysis
- **Detects harsh driving** via 6-axis IMU (braking, acceleration)
- **Tracks location** via GPS
- **Alerts the driver immediately** via local safety buzzer (no cloud round-trip)
- **Synchronizes telemetry** to the cloud for fleet-wide monitoring
- **Works offline** — safety-critical detection continues without connectivity

### Architecture

```
SADAN Edge Device (ARM + Sensors)
        ↓ Telemetry (JSON/HTTPS)
Next.js API (Validate → Process → Store)
        ↓
Supabase PostgreSQL + Realtime
        ↓
Next.js Dashboard + Groq AI Intelligence
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | Next.js Route Handlers |
| Database | Supabase (PostgreSQL + Realtime + Auth + RLS) |
| AI | Groq API |
| Maps | MapLibre GL |
| Charts | Recharts |
| Validation | Zod |
| Testing | Vitest + Playwright |

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and Groq API keys

# Run development server
npm run dev
```

## Project Structure

```
├── app/                  # Next.js App Router
│   ├── (auth)/           # Authentication pages
│   ├── (dashboard)/      # Dashboard pages (fleet, vehicles, drivers, alerts, AI, simulator)
│   └── api/              # API route handlers
├── components/           # React components
│   ├── layout/           # Layout components (sidebar, topbar, page-header)
│   └── ui/               # Base UI components (shadcn/ui)
├── config/               # Application configuration
├── docs/                 # Architecture and protocol documentation
├── hooks/                # React hooks
├── lib/                  # Business logic
│   ├── ai/               # Groq AI integration
│   ├── api/              # API utilities
│   ├── safety/           # Safety scoring and severity
│   ├── supabase/         # Supabase client configuration
│   └── telemetry/        # Telemetry validation and processing
├── supabase/             # Database migrations and seed data
├── tests/                # Unit and integration tests
└── types/                # TypeScript domain types
```

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript type checking
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
```

## License

Built for MSME Hackathon 6.0.
