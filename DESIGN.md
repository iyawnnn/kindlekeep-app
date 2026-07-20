---
name: kindlekeep
description: Free-tier uptime monitoring with real security auditing built in
colors:
  signal-blue: "#3B82F6"
  signal-blue-hover: "#2563EB"
  sentinel-ink: "#000000"
  neutral-bg: "#FFFFFF"
  neutral-surface: "#FAFAFA"
  neutral-border: "#E4E4E7"
  neutral-text-muted: "#71717A"
  neutral-text-secondary: "#3F3F46"
  neutral-text-primary: "#18181B"
  status-success: "#16A34A"
  status-danger: "#DC2626"
  status-warning: "#F59E0B"
typography:
  display:
    fontFamily: "Unbounded, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Unbounded, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Onest, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Onest, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.1em"
  wordmark:
    fontFamily: "Righteous, system-ui"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.01em"
rounded:
  none: "0px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.signal-blue}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.none}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.signal-blue-hover}"
  button-inverted:
    backgroundColor: "{colors.sentinel-ink}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.none}"
    padding: "16px 32px"
  button-inverted-hover:
    backgroundColor: "{colors.neutral-text-secondary}"
  card:
    backgroundColor: "{colors.neutral-bg}"
    rounded: "{rounded.none}"
    padding: "20px"
---

# Design System: kindlekeep

## 1. Overview

**Creative North Star: "The Sentinel Console"**

A command post that watches quietly and speaks precisely when something matters. kindlekeep monitors real infrastructure for developers who can't afford — or don't want — to pay for security visibility. The interface reflects that job: white and near-black by default, calm and unremarkable at rest, until Signal Blue marks the thing that needs attention. Nothing here is decorative; every color, weight, and border earns its place because it's doing work, not because it looks good in isolation.

The system explicitly rejects the generic AI-dashboard look: a "correct" but invisible accent color that technically exists in the CSS but reads as absent at a glance, gray-on-gray monotony, ungrounded pastel/cream neutrals, decorative gradients or glassmorphism, and side-stripe colored borders standing in for real design decisions.

**Key Characteristics:**
- White base, near-black ink, one committed blue — no secondary accent color
- Sharp corners everywhere; nothing is rounded
- Dense, task-first layouts; this is a console, not a pitch
- Signal Blue is felt, not just technically present — solid fills and active-state color, not just borders and hover states

## 2. Colors

A white-and-ink base with exactly one committed accent; the palette is small on purpose so Signal Blue is never competing for attention.

### Primary
- **Signal Blue** (#3B82F6): The one accent color in the system. Used for primary actions (solid-fill buttons), active/selected navigation state, key status indicators (healthy monitors, "A" security grades), and links. Also carries the `kindle-breathe` glow animation on active monitor cards. This is a Committed strategy, not Restrained: Signal Blue should be visibly present on every major screen, not confined to hover states and thin borders.

### Neutral
- **Sentinel Ink** (#000000): Reserved for the "inverted" CTA family — bold, high-commitment actions like the landing page SCAN button, account creation, config export. Also primary body text on the darkest end of the zinc scale (zinc-900, #18181B) for everyday reading.
- **White** (#FFFFFF): Page background and primary card surface.
- **Zinc Surface** (#FAFAFA): Secondary surface for nested panels, code blocks, and list rows that need to sit slightly apart from the page background.
- **Zinc Border** (#E4E4E7): Hairline dividers and card borders.
- **Zinc Muted Text** (#71717A): Timestamps, metadata, secondary labels.

### Semantic
- **Signal Blue doubles as "all clear."** Healthy monitors, passed header checks, "A" grades, and resolved incidents all read as blue — one consistent "this is fine" signal across the whole product, not a separate green state. See the One Accent Rule below.
- **Success** (#16A34A): Reserved narrowly for transient action-confirmation UI (a toast saying "saved," "reset," "created") — a UX-mechanics signal, not a status/grade signal. Never used for monitor/security state.
- **Danger** (#DC2626): Down monitors, failed checks, expired certificates, unresolved/active incidents.
- **Warning** (#F59E0B): Degraded status, cold starts, missing (but non-critical) headers.

### Named Rules
**The One Accent Rule.** Signal Blue is the only accent color in the system. There is no secondary or tertiary brand color; anything that isn't blue, ink, white, zinc, or a semantic status color doesn't belong.

**The Felt, Not Filed Rule.** An accent color that's technically in the CSS but never shows up as a solid fill, an active-state background, or a real visual moment has failed its job. If a screen has zero unmistakable blue moments, the color strategy hasn't been applied — it's been filed away in a hover state nobody triggers.

## 3. Typography

**Display/Headline Font:** Unbounded, sans-serif
**Body Font:** Onest, sans-serif
**Wordmark Font:** Righteous, system-ui (the "kindlekeep" mark only, always lowercase)

**Character:** Precise and utilitarian — Unbounded's geometric weight carries authority in headings without needing size to do it; Onest stays quiet and legible at data-density. The pairing reads as built for a task, not designed for a pitch.

### Hierarchy
- **Display** (900, 1.875rem/30px, 1.2 line-height): Page-level titles ("Command Center", "Sentinel Vault").
- **Headline** (700, 1.25rem/20px, 1.3 line-height): Section and card titles ("Protocol Timeline", "Defense Checklist").
- **Body** (400, 1rem/16px, 1.5 line-height): Default reading text, descriptions, form labels.
- **Label** (700, 0.75rem/12px, 1.4 line-height, 0.1em tracking, uppercase): Status badges, metadata tags, table headers.
- **Wordmark** (400, 1.25rem/20px, Righteous): The "kindlekeep" mark, always lowercase, never used for any other text.

### Named Rules
**The One Family Per Role Rule.** Unbounded is for headings and nothing else; Onest is for body and nothing else. Never swap them for "variety" within a single view.

## 4. Elevation

Hairline-first. A 1px zinc border does most of the work of separating a card from the page; shadow is a light touch, not a light source. At rest, cards carry only a subtle `shadow-sm`; the shadow grows slightly on hover/interactive states to signal "this responds to you," never to signal "this is dramatically above the page." No heavy drop shadows or glassmorphism anywhere in the system.

### Shadow Vocabulary
- **Resting** (`box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05)`): Default card/panel elevation. Paired with a 1px zinc-200 border.
- **Interactive hover** (`box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1)`): Cards and clickable panels on hover, signaling responsiveness without becoming a floating-card cliché.
- **Glow (signature)**: The `kindle-breathe` pulse (`0 0 2px rgba(59,130,246,0.15)` to `0 0 8px rgba(59,130,246,0.45)`, 3s ease-in-out loop) — reserved exclusively for active/healthy monitor cards. This is the one deliberately atmospheric effect in the system; it exists because "actively being watched" is the product's core state and deserves a signature.

### Named Rules
**The Border-First Rule.** Depth comes from a hairline border first, shadow second. A card with no border and only a shadow reads as unfinished in this system.

## 5. Components

Precise and utilitarian: sharp corners, tight padding, zero ornament. Every component looks built for use, not for show.

### Buttons
- **Shape:** Sharp corners, no radius (0px), always.
- **Primary:** Solid Signal Blue (#3B82F6) fill, white text, 12px/24px padding. Used for the single most important action on a screen (Save, Submit, Initialize).
- **Inverted:** Solid Sentinel Ink (#000000) fill, white text, 16px/32px padding. Used for the highest-commitment or "flagship" CTAs (landing page SCAN, account creation, config export) — visually the boldest element on the page.
- **Secondary/Ghost:** White background, zinc-300 border, zinc-900 text. Hover shifts border to black or fills zinc-50. Used for OAuth provider buttons, cancel actions, and anything that shouldn't compete with a primary action.
- **Hover/Focus:** Background darkens one step (blue-600 for primary, zinc-800 for inverted); focus state gets a visible blue ring, never removed without replacement.

### Cards / Containers
- **Corner Style:** Sharp, 0px radius, no exceptions.
- **Background:** White for primary cards; zinc-50 for nested/secondary surfaces (code blocks, list rows).
- **Shadow Strategy:** See Elevation — `shadow-sm` at rest, grows slightly on hover for interactive cards.
- **Border:** 1px zinc-200, doing most of the elevation work.
- **Internal Padding:** 20px (matches the `card` component token).

### Status Badges / Grade Indicators
- **Style:** Bordered box (not a pill), background tinted toward the semantic color at low opacity (e.g. blue-50 for an "A" grade), text in the full-strength semantic color.
- **State:** Neutral zinc treatment when a status is unknown/pending, never left blank or ambiguous.

### Inputs / Fields
- **Style:** White background, zinc-300 border, sharp corners.
- **Focus:** Border shifts to Signal Blue, no glow/shadow needed — the border color change is the entire focus signal.

### Navigation
- **Style:** Text links with icons, zinc-500 at rest. Active/current-page state gets a Signal Blue treatment (not just a color shift on the label — a visible indicator, per the Committed color strategy), not merely a `hover:` state.

## 6. Do's and Don'ts

### Do:
- **Do** use Signal Blue (#3B82F6) as solid fills on primary actions and active states — not just as a border or hover color.
- **Do** keep every corner sharp (0px radius) — this is a system-wide rule, not a per-component choice.
- **Do** pair every status/grade color with an icon or label; never rely on color alone.
- **Do** use a 1px zinc-200 border before reaching for shadow to convey a card's edge.
- **Do** reserve the `kindle-breathe` glow exclusively for actively-monitored, healthy targets — it's a signature, not a generic hover effect.

### Don't:
- **Don't** let Signal Blue exist only in hover states or thin borders — an accent that's technically present but never felt has failed the Committed strategy this system uses.
- **Don't** use `border-left`/`border-right` greater than 1px as a colored accent stripe on any card, alert, or list item.
- **Don't** put gray text on a colored/tinted background — use a darker shade of that same color instead.
- **Don't** introduce a second accent color. Signal Blue is the only one; semantic status colors (success/danger/warning) are functional, not brand accents.
- **Don't** reach for cream, sand, or warm-tinted neutrals "for warmth" — the neutral scale is zinc, full stop.
- **Don't** add gradients, glassmorphism, or decorative blur anywhere in the system.
