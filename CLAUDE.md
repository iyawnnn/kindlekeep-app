# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`kindlekeep-app` is the **frontend only** (React 19 + Vite dashboard) half of KindleKeep, a zero-cost uptime/security monitoring product. The backend (.NET 10 API + SignalR hubs + Postgres) lives in a separate repo, `kindlekeep-api`, per the polyrepo strategy in `ARCHITECTURE.md` (section 18) — do not expect backend code here, and don't try to "complete" the stack by adding a server into this repo.

`ARCHITECTURE.md` in the repo root is a large product/architecture manifest (vision, market analysis, full target data schema, roadmap). Treat it as aspirational context, not a description of current code — most of the backend schema and features it describes do not exist in this repo. The parts of it that do reflect real conventions here (naming, design system, package manager rationale) are folded into this file below.

## Commands

Package manager is **pnpm** (see `ARCHITECTURE.md` §5 — chosen for disk footprint / lockfile parity with Vercel). Don't use npm/yarn.

```bash
pnpm dev       # start Vite dev server
pnpm build     # tsc -b (project references, type-check only) && vite build
pnpm lint      # eslint .
pnpm preview   # preview a production build locally
```

There is no test runner configured in this repo (no test script, no test files) — don't assume Vitest/Jest exist.

## Environment

Local dev reads `.env.local` (gitignored):
- `VITE_API_URL` — backend API base URL (defaults to `http://localhost:5247` in code if unset, see `src/lib/axios.ts` and `src/features/monitors/hooks/useSignalR.ts`)
- `VITE_SIGNALR_HUB_URL` — SignalR hub URL

The backend must be running (from the sibling `kindlekeep-api` repo) for auth, monitor data, and the SignalR pulse stream to work — the UI alone will not do much against a stub.

## Architecture

### Auth
Auth is OAuth-based against the backend; the frontend just stores the resulting JWT in `localStorage` under `jwt_token` (`src/App.tsx`). `ProtectedRoute` in `App.tsx` gates dashboard routes by checking for that token's presence (no expiry/validation client-side — that's the backend's job). `/auth-callback` (and the legacy `/auth/callback/:provider`) reads a `token` query param, stores it, and redirects to `/dashboard`.

### Data flow
- **REST**: `src/lib/axios.ts` exports a shared `api` axios instance with an interceptor that attaches `Authorization: Bearer <jwt_token>` from `localStorage` to every request. Use this instance for all HTTP calls, not a bare `axios` import.
- **Real-time**: `src/features/monitors/hooks/useSignalR.ts` wraps `@microsoft/signalr`, connecting to `${VITE_API_URL}/hubs/pulse` with the JWT as the access token. On `ReceivePulse` it patches `useMonitorStore` directly (status/latency), so components generally don't need to handle socket events themselves — just read from the store. It supports an optional `monitorId` to subscribe/unsubscribe to a single monitor's stream (used by the debug terminal / monitor detail view) and an `onLog` callback for raw log streaming (`ReceiveLogStream`), used by the xterm-based debug terminal.
- **Client cache**: TanStack Query is wired up in `main.tsx` (`refetchOnWindowFocus: false`, `retry: 1`) for one-shot fetches; SignalR is the source of truth for live status changes, Query/axios for everything else.
- **Client state**: Zustand (`useMonitorStore` in `src/features/monitors/store/`) holds the monitor list. Mutations (`toggleMonitor`, `deleteMonitor`) apply optimistic updates and roll back on request failure — follow that pattern for new store mutations rather than waiting on the server round-trip.

### Structure
Feature-based, not type-based, under `src/features/<feature>/{components,hooks,store,types}`. Cross-feature/shared UI goes in `src/components/ui/`. Route-level components live flat in `src/pages/`. There are no path aliases configured (`tsconfig.app.json` has none) — imports are relative.

### Routing
Single `react-router-dom` tree in `App.tsx`. Authenticated pages are wrapped individually in `<ProtectedRoute><Layout>...</Layout></ProtectedRoute>`; `Layout` renders the shared header/nav. Landing/login/signup are public and unwrapped.

## Design system

- **Radix UI Themes** (`@radix-ui/themes`) is the component base, configured once in `main.tsx`: dark appearance, blue accent, `radius="none"` (sharp corners everywhere — don't introduce rounded corners on Radix components).
- **Tailwind v4**, configured via `@theme` in `src/index.css` (not a `tailwind.config.js` — this is the CSS-first Tailwind v4 setup). Custom tokens live there: `font-sans`/`font-heading`/`font-wordmark`, the zinc/blue/iris palette overrides, and the `kindle-breathe` glow animation (`animate-kindle-breathe`) used on active/healthy monitor cards.
- Fonts: **Onest** (body/UI), **Unbounded** (headings), **Righteous** (the `kindlekeep` wordmark only, always lowercase).
- Palette is "Zinc & Spark": zinc-950/900/800 neutrals with a blue-500 primary accent and iris-400 secondary accent; see `ARCHITECTURE.md` §3 for the full rationale if extending it.
- Icons: `lucide-react`, stroke width 1 (wireframe look) — pass `strokeWidth={1}` explicitly, it's not the library default.
- Motion: `framer-motion` with a shared spring config (`stiffness: 300, damping: 25`) for card-like transitions, see `KindleCard` in `src/components/ui/KindleCard.tsx` as the reference pattern.

## Conventions

- Components: PascalCase files/exports. Non-component files (hooks, stores, utils): camelCase or kebab-case matching what's already in that directory.
- Frontend TypeScript types should mirror the backend C# DTOs' JSON casing (camelCase) — see `src/features/monitors/types/monitor.types.ts` and the inline types in `useMonitorStore.ts` for the pattern when adding types for new endpoints.
- Comments only for non-obvious "why"; no TODO/FIXME left in committed code (per `ARCHITECTURE.md` §5's AI-collaboration guidance, which this repo follows in practice).

## Companion repo

Backend lives at ../kindlekeep-api (ASP.NET Core Minimal API, .NET 10, PostgreSQL via EF Core).
This app talks to it two ways:
- REST via src/lib/axios.ts, base URL from VITE_API_URL (default http://localhost:5247)
- SignalR via src/features/monitors/hooks/useSignalR.ts, hub at /hubs/pulse

Type contracts to keep in sync when editing either side:
- src/features/monitors/store/useMonitorStore.ts (MonitorResponse interface) <-> ../kindlekeep-api/Core/DTOs/MonitorModel.cs
- src/features/monitors/types/monitor.types.ts only covers SecurityAuditResponse and UptimeLogResponse
- ReceivePulse handler (expects monitorId, newStatus, latencyMs) <-> Core/DTOs/PulseUpdate.cs
  (PascalCase in C#, auto-converted to camelCase by SignalR's default JSON hub protocol,
  don't "fix" this mismatch, it's expected)
- SubscribeToMonitor / UnsubscribeFromMonitor invocations <-> API/Hubs/PulseHub.cs methods

## Rules
- Never run git push, git commit --amend, or git rebase without explicit instruction.
- Any change to a DTO shape or hub method signature must be checked against the other repo
  before considered complete.
