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

- **shadcn/ui** is the component base: Radix UI primitives + Tailwind + CVA, generated into and owned in `src/components/ui/` (`button.tsx`, `dialog.tsx`, `alert-dialog.tsx`, `dropdown-menu.tsx`, `select.tsx`, `switch.tsx`, `progress.tsx`, `tooltip.tsx`, `input.tsx`, `label.tsx`, `badge.tsx`, `separator.tsx`, `avatar.tsx`, `sheet.tsx`, `sidebar.tsx`, `breadcrumb.tsx`, `collapsible.tsx`, `command.tsx`). `components.json` configures the CLI (style `new-york`, base color `slate`, CSS variables). Regenerate/add primitives with `pnpm dlx shadcn@3.8.5 add <component>` — pin to `3.8.5`; `shadcn@latest` on this machine resolves to an unstable v4 CLI with a different preset-based flow, and **adding a new primitive can silently regenerate `dialog.tsx` back to shadcn's stock styling** (it's a dependency of `command`/`sidebar`) — re-check the overlay/content classes (rounded-xl, shadow-xl, no backdrop-blur, 150ms duration) after running `add`. Cross-feature hand-rolled UI (not a generated primitive) still lives in `src/components/ui/` too — e.g. `KindleCard.tsx` (the shared card primitive), `Toaster.tsx`/`useToastStore.ts` (custom zustand-backed toast system, not shadcn's `sonner`), `CopyField.tsx` (shared copy-to-clipboard row).
- No provider wrapping is needed for shadcn itself; `main.tsx` wraps the app in `TooltipProvider` (required by the tooltip primitive) and `QueryClientProvider` only.
- **Tailwind v4**, configured via `@theme`/`@theme inline` blocks in `src/index.css` (not a `tailwind.config.js` — this is the CSS-first Tailwind v4 setup). Design tokens are CSS variables (`--background`, `--foreground`, `--primary`, `--radius`, etc.) under `:root`; radius tokens are hardcoded to Linear's real scale (6/8/12/16/24px), not derived from a single `--radius` calc — don't introduce sharp (`rounded-none`) corners anywhere, that was the old system.
- The `@/` path alias (`src/*`) is configured in `tsconfig.app.json`, `tsconfig.json`, and `vite.config.ts` — required by shadcn's generated imports (`@/components/ui/...`, `@/lib/utils`). New shadcn-style imports should use it; older hand-written files may still use relative imports, both work.
- Font: **Inter Variable**, self-hosted via the `@fontsource-variable/inter` npm package (`@import '@fontsource-variable/inter';` in `src/index.css`) — not a Google Fonts CDN call. Single family for every role (headings, body, labels, wordmark). Don't introduce a second typeface or switch back to a CDN `@import`.
- Palette: white canvas, **Mercury White** (`#F4F5F8`) for elevated surfaces (sidebar, nested panels), **Nordic Gray** (`#222326`) ink, **Signal Blue** (`#3B82F6`) as the single committed accent — matched pixel-for-pixel to the product logo (`public/logo.png`), not Linear's own brand color. All bound to CSS custom properties in `src/index.css` (`--background`, `--sidebar`, `--foreground`, `--primary`, etc.), never hardcoded as literal Tailwind color-scale classes (no `sky-*`/`blue-*`/`indigo-*` in component code — use `bg-primary`/`text-primary`/`bg-accent`/`text-accent-foreground`). Security grades are severity-colored via `src/features/monitors/lib/gradeColor.ts` (A→primary, B→success, C→warning, D/F→danger), not flattened to one neutral treatment. Radius scale is Linear's real one: 6/8/12/16/24px. See `DESIGN.md` for the full spec.
- Icons: `lucide-react`, stroke width 1.5 — pass `strokeWidth={1.5}` explicitly, it's not the library default.
- Motion: `framer-motion` with a shared spring config (`stiffness: 300, damping: 25`) for card-like transitions, see `KindleCard` in `src/components/ui/KindleCard.tsx` as the reference pattern. No idle-state decorative animation (the old `kindle-breathe` glow was removed) — motion ties to a real state change only.
- Brand assets live in `public/`: `logo.png` (used in the sidebar header and every public-facing wordmark) and `favicon.png`. Both are the real product mark — don't reintroduce a generic placeholder icon.

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
