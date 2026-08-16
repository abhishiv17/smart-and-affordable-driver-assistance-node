# SADAN Development Guide

## Prerequisites

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher
- **Git** for version control

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd sadan

# Install dependencies
npm install
```

## Environment Setup

```bash
# Copy the environment template
cp .env.example .env.local
```

Edit `.env.local` and fill in the required values:

```env
# Supabase (required for database features)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-only (never exposed to browser)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GROQ_API_KEY=your-groq-api-key

# Optional
NEXT_PUBLIC_MAP_STYLE_URL=https://your-map-style-url
```

> **Security**: Never commit `.env.local`. Server-only variables (`SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`) must never be prefixed with `NEXT_PUBLIC_` and must never be accessed from client components.

## Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | TypeScript type checking |
| `npx vitest run` | Run unit tests |
| `npx vitest` | Run unit tests in watch mode |
| `npx playwright test` | Run E2E tests |

## Code Conventions

### File Naming

- **Components**: `kebab-case.tsx` (e.g., `page-header.tsx`)
- **Utilities**: `kebab-case.ts` (e.g., `formatters.ts`)
- **Types**: `kebab-case.ts` (e.g., `vehicle.ts`)
- **Tests**: `kebab-case.test.ts` (e.g., `telemetry-validation.test.ts`)

### Component Organization

- **Server Components** (default) — no `"use client"` directive
- **Client Components** — add `"use client"` only when genuinely needed
- Keep components focused and single-responsibility
- Feature-specific components go in `components/[feature]/`
- Shared UI primitives go in `components/ui/`

### Import Aliases

Use the `@/` alias for all imports:

```typescript
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import type { Vehicle } from '@/types/vehicle';
import { formatSpeed } from '@/lib/utils/formatters';
```

### TypeScript

- Strict mode is enabled
- Prefer interfaces over type aliases for object shapes
- Use discriminated unions for status/state types
- Export types from dedicated files in `types/`

## Testing

### Unit Tests (Vitest)

```bash
# Run all tests
npx vitest run

# Run in watch mode
npx vitest

# Run specific test file
npx vitest run tests/unit/telemetry-validation.test.ts
```

### E2E Tests (Playwright)

```bash
# Install browsers (first time only)
npx playwright install

# Run tests
npx playwright test

# Run with UI
npx playwright test --ui
```

## Production Build

```bash
# Build
npm run build

# Test the production build locally
npm run start
```

## Deployment

The application is configured for deployment on **Vercel**:

1. Push to the main branch
2. Vercel automatically builds and deploys
3. Environment variables must be configured in the Vercel dashboard

## Troubleshooting

### `ERESOLVE` dependency errors

If you encounter peer dependency conflicts during `npm install`:

```bash
npm install --legacy-peer-deps
```

### Missing environment variables

The application will throw clear errors if required environment variables are missing. Check the console output and ensure `.env.local` is properly configured.
