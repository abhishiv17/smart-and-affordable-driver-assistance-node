# SADAN Architecture

## System Overview

SADAN follows a clear data flow from physical edge devices through cloud processing to dashboard visualization and AI analysis.

```
┌─────────────────────┐
│   EDGE DEVICE       │
│   (ARM Processor)   │
│                     │
│  ┌───────────────┐  │
│  │ NoIR Camera   │──┼──→ Drowsiness Detection (local)
│  │ 6-axis IMU    │──┼──→ Harsh Driving Detection (local)
│  │ GPS Module    │──┼──→ Location & Speed
│  │ Safety Buzzer │←─┼──── Immediate Local Alert
│  └───────────────┘  │
│         │           │
│    Cellular Modem   │
└─────────┬───────────┘
          │
          │ Telemetry Contract (JSON over HTTPS)
          │
┌─────────▼───────────┐
│   CLOUD BACKEND     │
│   (Next.js API)     │
│                     │
│  POST /api/telemetry│──→ Validate → Process → Store
│  GET  /api/vehicles │
│  GET  /api/alerts   │
│  GET  /api/drivers  │
│  POST /api/ai       │──→ Groq API
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│   SUPABASE          │
│                     │
│  PostgreSQL DB      │──→ Persistent storage
│  Realtime           │──→ Live subscriptions
│  Auth               │──→ User authentication
│  Row Level Security │──→ Data isolation
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│   NEXT.JS DASHBOARD │
│                     │
│  Fleet Overview     │
│  Vehicle Tracking   │
│  Driver Profiles    │
│  Safety Alerts      │
│  AI Intelligence    │
│  Device Simulator   │
└─────────────────────┘
```

## Data Flow

### 1. Edge Processing (Local)

The ARM-based edge device performs **safety-critical detection locally**:

- **Drowsiness Detection**: The NoIR camera captures the driver's face. A lightweight ML model computes the Eye Aspect Ratio (EAR) and a drowsiness probability score. If the score exceeds the threshold, the **local safety buzzer activates immediately** — no cloud round-trip required.

- **Harsh Driving Detection**: The 6-axis IMU monitors acceleration forces. If g-force exceeds thresholds for braking or acceleration, the event is classified locally.

- **GPS Tracking**: Continuous position and speed monitoring.

This local-first approach ensures **sub-second safety response times** regardless of network conditions.

### 2. Telemetry Synchronization

The edge device packages telemetry events and synchronizes them to the cloud via the **Telemetry Contract** (see [telemetry-protocol.md](telemetry-protocol.md)).

- When online: events are sent in near-real-time batches
- When offline: events are cached locally and synchronized when connectivity is restored
- The `networkStatus` field in each event records the connectivity state at capture time

### 3. Cloud Processing

The Next.js backend receives telemetry via `POST /api/telemetry`:

1. **Validation** — Zod schema validation of each event
2. **Processing** — Event classification, enrichment, and alert generation
3. **Storage** — Persistence to Supabase PostgreSQL
4. **Broadcasting** — Real-time event distribution via Supabase Realtime

### 4. Dashboard

The Next.js App Router dashboard consumes data via:

- **Server Components** — Initial data fetching from Supabase
- **Client Components** — Real-time updates via Supabase Realtime subscriptions
- **API Routes** — On-demand data queries

### 5. AI Intelligence

The AI pipeline uses the **Groq API** to generate safety intelligence reports:

1. Fleet telemetry data is aggregated and summarized
2. Structured prompts are sent to the Groq API
3. Responses are validated against Zod schemas
4. Reports are stored and displayed in the AI Intelligence dashboard

## Architectural Boundaries

| Layer | Responsibility | What it must NOT do |
|---|---|---|
| `app/` | Routing, layouts, page composition, route handlers | Business logic |
| `components/` | Presentation, reusable UI | Direct database access |
| `lib/` | Business logic, database access, external services | UI rendering |
| `types/` | Domain contracts, API contracts | Business logic |
| `hooks/` | Client-side behavior, realtime subscriptions | Server-side logic |
| `config/` | Application configuration | Business logic |

## Key Design Decisions

### Simulator Replaceability

The Device Simulator and physical ARM device share the **identical Telemetry Contract**. The cloud platform treats them identically — the `isSimulated` flag on the Device entity is the only distinction. This ensures the physical device can replace the simulator without any backend or dashboard changes.

### Server Components by Default

All pages and layouts are Server Components unless client-side interactivity is required. The `"use client"` directive is used only for components that genuinely need:

- Browser APIs
- Event handlers
- React state
- Real-time subscriptions

### Dark-First Design

The platform defaults to a dark theme designed for fleet operations/safety control room environments. A light theme is available for presentation/demo mode.
