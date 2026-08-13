# DriverGuard

**Smart & Affordable Driver Assistance Node**

> Fleet Safety Intelligence Platform for MSME Hackathon 6.0

---

## Overview

DriverGuard is a driver-safety intelligence platform designed for small and medium logistics fleets operating legacy commercial vehicles. The system provides real-time safety monitoring, driver behavior analysis, and AI-generated safety insights.

### Physical System (Proposed)

The proposed hardware consists of an ARM-based edge device with:

- **NoIR camera** — drowsiness detection via eye aspect ratio analysis
- **6-axis IMU** — harsh braking/acceleration detection
- **GPS** — location and speed tracking
- **Cellular modem** — cloud telemetry synchronization
- **Safety buzzer** — local immediate driver alerts

The edge device performs **safety-critical detection locally** and synchronizes lightweight telemetry to the cloud.

### Software MVP

The software platform provides:

- Fleet monitoring dashboard
- Vehicle tracking and management
- Driver safety profiles and scoring
- Real-time safety alerts
- Telemetry history and analytics
- AI-generated safety insights (via Groq)
- Device simulator for development and demos

> The Device Simulator reproduces the telemetry that the physical edge device generates. The architecture ensures the physical device can replace the simulator without a redesign.

---

## Current Phase

**Phase 1 — MVP Foundation** (Complete)

- Repository structure and architecture
- TypeScript domain types and telemetry contract
- Application shell with dark automotive theme
- Route structure with placeholder pages
- API route handler structure
- Testing foundation
- Documentation

---

## Technology Stack

| Layer | Technology |
|---|---|
| Core | Next.js 16, App Router, TypeScript, React 19 |
| UI | Tailwind CSS v4, shadcn/ui, Lucide React |
| Backend | Next.js Route Handlers |
| Database | Supabase PostgreSQL |
| Realtime | Supabase Realtime |
| Auth | Supabase Auth |
| Validation | Zod |
| Charts | Recharts |
| Maps | MapLibre GL JS |
| AI | Groq API |
| Testing | Vitest, React Testing Library, Playwright |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
cd driverguard
npm install
```

### Environment Setup

```bash
cp .env.example .env.local
```

Fill in the environment variables in `.env.local`:

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Supabase service role key |
| `GROQ_API_KEY` | Server only | Groq API key for AI features |
| `NEXT_PUBLIC_MAP_STYLE_URL` | Public | MapLibre GL style URL |

> ⚠️ Never commit `.env.local` or expose server-only keys to client code.

### Development

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint
npx tsc --noEmit  # TypeScript type checking
npx vitest run    # Run unit tests
```

---

## Project Structure

```
driverguard/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth routes (login)
│   ├── (dashboard)/        # Dashboard routes
│   │   ├── dashboard/      # Fleet overview
│   │   ├── vehicles/       # Vehicle management
│   │   ├── drivers/        # Driver management
│   │   ├── alerts/         # Safety alerts
│   │   ├── ai/             # AI intelligence
│   │   └── simulator/      # Device simulator
│   └── api/                # API route handlers
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Shell components
│   └── [feature]/          # Feature-specific components
├── lib/                    # Business logic & utilities
│   ├── supabase/           # Database clients
│   ├── telemetry/          # Telemetry processing
│   ├── safety/             # Safety scoring
│   ├── ai/                 # Groq AI integration
│   ├── api/                # API utilities
│   └── utils/              # Shared utilities
├── types/                  # TypeScript domain types
├── hooks/                  # React hooks
├── config/                 # App configuration
├── supabase/               # Migrations & seed data
├── tests/                  # Test suites
└── docs/                   # Documentation
```

---

## Architecture

See [docs/architecture.md](docs/architecture.md) for the full architecture documentation.

```
Edge Device → Telemetry Contract → Backend → Supabase → Realtime → Dashboard → AI
```

---

## License

Built for MSME Hackathon 6.0
