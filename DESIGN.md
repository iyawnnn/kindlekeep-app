---
name: kindlekeep
description: Free-tier uptime monitoring with real security auditing built in
colors:
  signal-blue: "#3B82F6"
  signal-blue-tint: "#EFF6FF"
  signal-blue-tint-foreground: "#1D4ED8"
  mercury-white: "#F4F5F8"
  nordic-gray: "#222326"
  neutral-bg: "#FFFFFF"
  neutral-border: "#E4E4E7"
  neutral-text-muted: "#62666D"
  status-success: "#16A34A"
  status-danger: "#DC2626"
  status-warning: "#F59E0B"
typography:
  display:
    fontFamily: "Inter Variable, Inter, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter Variable, Inter, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Inter Variable, Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Inter Variable, Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.03em"
  wordmark:
    fontFamily: "Inter Variable, Inter, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.01em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  xxl: "24px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.signal-blue}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.neutral-bg}"
    rounded: "{rounded.xl}"
    padding: "20px"
---

# Design System: kindlekeep

## 1. Overview

**Creative North Star: "Linear-shaped, kindlekeep-colored"**

A command post that watches quietly and speaks precisely when something matters. kindlekeep monitors real infrastructure for developers who can't afford — or don't want — to pay for security visibility. The interface takes its structural cues from linear.app (soft rounded corners, Mercury White / Nordic Gray neutrals, Inter Variable, a hairline-first elevation system) but keeps kindlekeep's own brand color: **Signal Blue (#3B82F6)**, matched pixel-for-pixel to the product logo (`public/logo.png`), not Linear's own accent. White base, calm and unremarkable at rest, dense information laid out with soft rounded structure instead of ornament, until Signal Blue marks the thing that needs attention.

The system explicitly rejects the generic AI-dashboard look: a "correct" but invisible accent color that technically exists in the CSS but reads as absent at a glance, gray-on-gray monotony, ungrounded pastel/cream neutrals, decorative gradients or glassmorphism, and side-stripe colored borders standing in for real design decisions.

**Key Characteristics:**
- White canvas, Mercury White elevated surfaces, Nordic Gray ink, one committed accent (Signal Blue) — no secondary accent color
- Soft rounded corners on Linear's real scale (6/8/12/16/24px) — never sharp, never pill-shaped
- Dense, task-first layouts; this is a console, not a pitch
- Signal Blue is felt, not just technically present — solid fills and active-state color, not just borders and hover states
- Component base is **shadcn/ui** (Radix primitives + Tailwind + CVA), owned in `src/components/ui/`
- Every accent usage in code reads from the semantic `primary`/`accent` CSS tokens (`bg-primary`, `text-primary`, `bg-accent`) — never a literal Tailwind color-scale class — so a brand color change is a one-file edit, not a grep-and-replace
- Security grades are severity-colored, not just pass/fail: A→primary, B→success, C→warning, D/F→danger — never a flat neutral box regardless of how bad the grade is

## 2. Colors

A white/Mercury-White base with exactly one committed accent; the palette is small on purpose so Signal Blue is never competing for attention.

### Primary
- **Signal Blue** (#3B82F6): kindlekeep's actual brand color, matched to the logo mark. Used for primary actions (solid-fill buttons), active/selected navigation state, key status indicators (healthy monitors, "A" security grades), links, and focus rings. This is a Committed strategy, not Restrained: Signal Blue should be visibly present on every major screen, not confined to hover states and thin borders.

### Neutral
- **Nordic Gray** (#222326): brand-guideline neutral ink. Primary body text and headings, replacing a generic zinc-900.
- **White** (#FFFFFF): Page canvas.
- **Mercury White** (#F4F5F8): brand-guideline light neutral. Used for elevated/nested surfaces — the sidebar panel, secondary cards, code blocks, list rows — sitting a hair off the white canvas.
- **Zinc Border** (#E4E4E7): Hairline dividers and card borders.
- **Muted Text** (#62666D): Timestamps, metadata, secondary labels.

### Semantic
- **Signal Blue doubles as "all clear."** Healthy monitors, passed header checks, "A" grades, and resolved incidents all read as Signal Blue — one consistent "this is fine" signal across the whole product, not a separate green state. See the One Accent Rule below.
- **Success** (#16A34A): Security grade "B," and reserved narrowly for transient action-confirmation UI (a toast saying "saved," "reset," "created").
- **Warning** (#F59E0B): Security grade "C," degraded status, cold starts, missing (but non-critical) headers.
- **Danger** (#DC2626): Security grade "D"/"F," down monitors, failed checks, expired certificates, unresolved/active incidents.

### Named Rules
**The One Accent Rule.** Signal Blue is the only accent color in the system. There is no secondary or tertiary brand color; anything that isn't Signal Blue, Nordic Gray, white/Mercury White, or a semantic status color doesn't belong.

**The Felt, Not Filed Rule.** An accent color that's technically in the CSS but never shows up as a solid fill, an active-state background, or a real visual moment has failed its job. If a screen has zero unmistakable Signal Blue moments, the color strategy hasn't been applied — it's been filed away in a hover state nobody triggers.

**The Token, Not Literal Rule.** Accent color in component code is always a semantic Tailwind class bound to a CSS variable (`bg-primary`, `text-primary`, `bg-accent`, `text-accent-foreground`) — never a literal color-scale utility (`bg-sky-500`, `text-blue-600`). The brand color lives in exactly one place: `src/index.css`.

**The Graded Severity Rule.** A security grade is never rendered as a flat neutral color regardless of how bad it is. Every grade tier (A/B/C/D/F) maps to a distinct, meaningful color via `src/features/monitors/lib/gradeColor.ts` — a D or an F must look alarming, not identical to a pending/unknown state.

## 3. Typography

**Font:** Inter Variable — self-hosted via the `@fontsource-variable/inter` package (no external font CDN request at runtime), loaded as a true variable font (full 100–900 weight axis), one family for every role (product register: a well-tuned single sans carries headings, buttons, labels, body, and data without needing a display/body pairing).

**Character:** Clean and legible at data-density. No display font, no decorative wordmark face — weight and size carry hierarchy, not a font swap.

### Hierarchy
- **Display** (600, 1.875rem/30px, 1.2 line-height, -0.02em tracking): Page-level titles ("Dashboard", "Sentinel Vault").
- **Headline** (600, 1.25rem/20px, 1.3 line-height): Section and card titles ("Uptime Timeline", "Header Checklist").
- **Body** (400, 1rem/16px, 1.5 line-height): Default reading text, descriptions, form labels.
- **Label** (600, 0.75rem/12px, 1.4 line-height, 0.03em tracking, uppercase): Status badges, metadata tags, table headers.
- **Wordmark** (600, 1.25rem/20px, Inter): The "kindlekeep" mark, always lowercase, paired with the logo mark (`/logo.png`), never used for any other text.

### Named Rules
**The One Family Rule.** Inter Variable is used everywhere — headings, body, labels, wordmark. No second typeface is introduced for "variety."

**The Self-Hosted Rule.** Fonts ship from `node_modules` via `@fontsource-*` packages, never a runtime Google Fonts (or other CDN) `@import`/`<link>`. A blocked or slow font CDN request degrades to a fallback font and reads as broken typography; self-hosting removes that failure mode entirely.

## 4. Elevation

Hairline-first. A 1px border does most of the work of separating a surface from the page; shadow is a light touch, not a light source. At rest, cards carry only a subtle `shadow-sm`; the shadow grows slightly on hover/interactive states to signal "this responds to you," never to signal "this is dramatically above the page." No heavy drop shadows or glassmorphism anywhere in the system — and no `backdrop-blur` on full-viewport overlays, which is expensive to composite and reads as lag, not polish.

### Shadow Vocabulary
- **Resting** (`box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05)`): Default card/panel elevation. Paired with a 1px zinc-200 border.
- **Interactive hover** (`box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1)`): Cards and clickable panels on hover, signaling responsiveness without becoming a floating-card cliché.

### Named Rules
**The Border-First Rule.** Depth comes from a hairline border first, shadow second. A card with no border and only a shadow reads as unfinished in this system.

**The Bounded Blur Rule.** If a blur or filter effect is ever used, it must be bounded to a small, isolated area — never applied to a full-viewport layer that animates. Unbounded blur is the single most common cause of perceived UI lag.

**The No Decorative Motion Rule.** Motion communicates a real state change (loading, active/healthy, hover feedback) — never atmosphere for its own sake. There is no signature idle-state glow or pulse; if a monitor card needs to signal "actively watched," that comes from its data (status text, latency, grade), not an animation layered on top.

## 5. Components

Component base is **shadcn/ui**: Radix UI primitives, Tailwind utility classes, and CVA variants, generated into and owned in `src/components/ui/`. Clean and legible: soft rounded corners, tight padding, zero ornament.

### Buttons
- **Shape:** Rounded (`rounded-md`, 8px), always. Never sharp, never pill-shaped.
- **Primary:** Solid Signal Blue (#3B82F6) fill, white text. Used for the single most important action on a screen (Save, Add, Submit).
- **Outline/Secondary/Ghost:** White or transparent background, zinc-300 border (outline) or none (ghost), Nordic Gray text. Hover shifts border/background toward Mercury White or Signal Blue depending on context. Used for OAuth provider buttons, cancel actions, and anything that shouldn't compete with a primary action.
- **Destructive:** Solid red-600 fill, white text. Reserved for irreversible actions (delete account, delete monitor, revoke key).
- **Hover/Focus:** Background darkens slightly (`bg-primary/90`); focus state gets a visible ring, never removed without replacement. Every button has a subtle `active:scale-[0.98]` press state for tactile feedback.

### Cards / Containers
- **Corner Style:** Rounded (`rounded-xl`, 16px), no exceptions.
- **Background:** White for primary cards; Mercury White for nested/secondary surfaces (code blocks, list rows, sidebar panel).
- **Shadow Strategy:** See Elevation — `shadow-sm` at rest, grows slightly on hover for interactive cards.
- **Border:** 1px zinc-200, doing most of the elevation work.
- **Internal Padding:** 20-24px.

### Status Badges / Grade Indicators
- **Style:** Rounded bordered box (`GradeBadge` component), severity-colored per the Graded Severity Rule — `bg-accent`/`text-accent-foreground` for "A," green for "B," amber for "C," red for "D"/"F," neutral zinc only for a genuinely unknown/pending grade. The primary detail views (`SecurityDetailsModal`, `MonitorDetail`) also show a short text label ("Excellent"/"Good"/"Needs Improvement"/"Poor"/"Critical") under the badge — color is never the only signal.

### Inputs / Fields
- **Style:** White background, zinc-300 border, `rounded-md`.
- **Focus:** Border shifts to Signal Blue plus a soft focus ring (shadcn default) — visible without being loud.

### Navigation
- **Style:** Icon + label rows, zinc-500 at rest, `rounded-md`. Active/current-page state gets an `accent`-tinted background fill with `accent-foreground` text — a filled pill-row, not a colored border stripe. A bottom-pinned secondary group (Support/Feedback) sits above the account menu in the sidebar footer.

### Command Palette
- **Style:** `⌘K`/`Ctrl+K` opens a `CommandDialog` (shadcn `command`, cmdk-based) listing every real nav destination grouped exactly like the sidebar. The header's search-styled trigger button opens the same palette — no decorative dead search input.

### Dialogs / Modals
- **Overlay:** Flat `bg-black/40`, no blur — fast fade only (150ms). A blurred overlay looks premium in a static screenshot but costs real frame time on a full-viewport animated layer; flat is both faster and, at this scale, indistinguishable in feel.
- **Content:** `rounded-xl`, `shadow-xl`, fast fade + scale (150ms, ease-out). Every data-fetching dialog (e.g. Edit Monitor) has an explicit error state with a retry action — a query that fails must never leave the dialog stuck on an infinite spinner.

## 6. Do's and Don'ts

### Do:
- **Do** use Signal Blue (#3B82F6) as solid fills on primary actions and active states — not just as a border or hover color.
- **Do** keep corners rounded system-wide on Linear's real scale (`rounded-md`/8px on controls, `rounded-xl`/16px on cards/dialogs) — this is a system-wide rule, not a per-component choice.
- **Do** pair every status/grade color with an icon or label; never rely on color alone.
- **Do** color security grades by severity tier (A/B/C/D/F), never flatten B-through-F into one neutral treatment.
- **Do** use a 1px zinc-200 border before reaching for shadow to convey a card's edge.
- **Do** build new interactive components from shadcn/ui primitives (`src/components/ui/`) rather than hand-rolling.
- **Do** express accent color as a semantic token class (`bg-primary`, `text-accent-foreground`), never a literal `sky-*`/`blue-*`/`indigo-*` Tailwind class.
- **Do** self-host fonts via `@fontsource-*` packages.

### Don't:
- **Don't** let Signal Blue exist only in hover states or thin borders — an accent that's technically present but never felt has failed the Committed strategy this system uses.
- **Don't** use `border-left`/`border-right` greater than 1px as a colored accent stripe on any card, alert, list item, or nav link.
- **Don't** put gray text on a colored/tinted background — use a darker shade of that same color instead.
- **Don't** introduce a second accent color. Signal Blue is the only one; semantic status colors (success/danger/warning) are functional, not brand accents.
- **Don't** reach for cream, sand, or warm-tinted neutrals "for warmth" — the neutral scale is Mercury White / zinc, full stop.
- **Don't** add gradients, glassmorphism, or decorative blur anywhere in the system — especially not `backdrop-blur` on an animated full-viewport overlay.
- **Don't** introduce a second display/heading font — Inter Variable carries every role.
- **Don't** go sharp-cornered or pill-shaped — the radius scale is Linear's: soft and consistent.
- **Don't** add idle-state decorative animation (glows, pulses) that isn't tied to a real state change.
- **Don't** load a font from an external CDN at runtime — self-host it.
