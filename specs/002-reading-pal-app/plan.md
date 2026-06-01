# Implementation Plan: Reading Pal — UI Design Phase

**Branch**: `feat/ui-redesign` | **Date**: 2026-05-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-reading-pal-app/spec.md`

---

## Summary

The Reading Pal web SPA (v0.5.0) has a complete core feature set (FR-001–FR-032, US1–US9).
This plan covers the increment that shipped FR-028–FR-032 — a warm light theme visual overhaul
(cream `#FFF8F2` + terracotta `#E07940`), Home dashboard screen, page-based progress tracking,
genre tagging, reading-pace stats on the detail screen, and a Stats screen.
All work stays within the existing Vite + React + MUI + Dexie stack.

---

## Technical Context

**Language/Version**: TypeScript 5.x, `strict: true`

**Primary Dependencies**:
- React 18 + React Router v6 (SPA routing)
- MUI v5 (Material UI) — components, theming
- Dexie.js v4 + dexie-react-hooks (`useLiveQuery`) — local IndexedDB
- Zustand — UI-only state (filters, sort, modal flags)
- React Hook Form — all form validation

**Storage**: Dexie / IndexedDB — browser-local, no backend, no network required

**Testing**: Vitest + React Testing Library + fake-indexeddb + jsdom

**Target Platform**: Browser SPA / installable PWA (Android Chrome, iOS Safari)

**Project Type**: Web application (SPA + PWA)

**Performance Goals**:
- Library grid: 200 books, no visible lag during filter/sort
- Quote search: < 1 s across 1,000 quotes
- Stats aggregation: < 500 ms across 200 books

**Constraints**: Fully offline-capable; no backend calls for data; all new code under strict TS

**Scale/Scope**: ~5 new/modified screens, ~8 new components, 1 Dexie schema migration

---

## Constitution Check

*Constitution version: 2.0.0 (Mobile-First, Device-Local). Ratified 2026-05-26.*

| Gate | Principle | Status | Justification |
|------|-----------|--------|---------------|
| I | Mobile-First, Expo-only | ⚠ PARTIAL | App is a browser SPA/PWA pre-dating the v2 pivot. Mobile Phase 3 (Capacitor/RN) is deferred. Web work continues under the existing architecture. No new web-only APIs added. |
| II | WatermelonDB as source of truth | ⚠ OVERRIDE | App uses Dexie/IndexedDB. Predates constitution v2. Migration to WatermelonDB is scoped to Mobile Phase 3. |
| III | TypeScript strict mode | ✅ PASS | `tsconfig.json` has `strict: true`; all new files must compile clean. |
| IV | Repository pattern | ✅ PASS | All mutations go through `src/repositories/`. New entities follow the same pattern. |
| V | React Native Paper + React Navigation | ⚠ OVERRIDE | App uses MUI + React Router. Predates constitution v2. New components use MUI throughout. |
| VI | Accessibility & Mobile UX | ✅ PASS | All touch targets ≥ 48 dp, `accessibilityLabel` on interactive elements, keyboard navigation, `KeyboardAvoidingView` equivalent via MUI. |
| VII | Testing discipline | ✅ PASS | Repository tests use Vitest + fake-indexeddb. Component tests use RTL. No DB mocking. |

**Override rationale (I, II, V)**: The `002-reading-pal-app` spec branch targets the existing
browser SPA. The constitution v2 pivot to Expo/React Native is deferred and tracked separately
(the `003-reading-pal-rn` spec was planned but not yet created). New features here add value
to the deployed app (https://hobby-app-dusky.vercel.app) without blocking the eventual mobile
migration.

---

## Project Structure

### Documentation (this feature)

```text
specs/002-reading-pal-app/
├── plan.md              ← This file
├── research.md          ← Architectural decisions (v1 complete)
├── data-model.md        ← Updated: new Book fields + Dexie v2 schema
├── quickstart.md        ← Setup guide (v1 complete)
├── contracts/
│   ├── repositories.md  ← Updated: new repo signatures
│   └── routes.md        ← Updated: new routes
└── tasks.md             ← Updated: new phases 19–23
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── BookCard/          ← update: show genre badge, page progress
│   ├── BottomNav/         ← NEW: dark bottom navigation with FAB
│   ├── StatsCard/         ← NEW: reusable stat card (number + label)
│   ├── MonthlyChart/      ← NEW: bar chart (recharts or MUI-based)
│   └── GenreDonut/        ← NEW: donut chart (recharts)
├── hooks/
│   ├── useBooks.ts        ← update: new query for Home screen
│   ├── useStats.ts        ← NEW: aggregation hook (books read, pages, pace)
│   └── (existing)
├── pages/
│   ├── HomePage/          ← NEW: dashboard screen (FR-028)
│   ├── StatsPage/         ← NEW: statistics screen (FR-032)
│   ├── BookDetailPage/    ← update: add pace stats grid (FR-031)
│   └── AddEditBookPage/   ← update: year, totalPages, currentPage, genres (FR-029/030)
├── repositories/
│   └── bookRepository.ts  ← update: new fields in addBook/updateBook
├── stores/
│   └── statsUiStore.ts    ← NEW: year filter state for StatsPage
├── theme/
│   └── theme.ts           ← NEW: warm light theme (cream + terracotta)
├── types/
│   └── entities.ts        ← update: Book + new fields
└── db/
    └── db.ts              ← update: Dexie schema v2

tests/
├── repositories/
│   └── bookRepository.test.ts  ← update: cover new fields
└── hooks/
    └── useStats.test.ts        ← NEW
```

---

## Phase 0 Research Summary

All architectural decisions for the new phases resolved from existing context:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Charting library | `recharts` | Lightweight, React-first, tree-shakeable; avoids heavy Chart.js. Already used in similar MUI apps. |
| Warm light theme | MUI `createTheme({ palette: { mode: 'light' } })` + terracotta primary | Zero new dependency; warm cream background `#FFF8F2`, terracotta accent `primary.main = #E07940`, dark-brown text `#2D1600`. Originally planned as dark/cyan; pivoted to warm light during implementation. |
| Progress tracking | Keep `currentProgress: number` (0–100); add `totalPages` + `currentPage` as optional; derive percentage | Backward compat with all v1 books; forms that don't fill page fields still work. |
| Genres storage | `genres: string[]` multi-entry index in Dexie | Same pattern as `Quote.tags`; enables future filter-by-genre without schema change. |
| Pace stats | Compute from `sessions` array in a hook; no extra DB columns | Start date = `sessions[0].startedAt`, days reading = unique session dates count, avg pace = `currentPage / daysSinceStart`, ETA = `(totalPages - currentPage) / avgPace`. |
| Home "currently reading" | `useLiveQuery` filter `status === 'READING'`, take first | Simple; reactive; no extra index needed. |
| Stats year filter | `Zustand` store (same pattern as library filter) | Ephemeral UI state, survives nav; consistent with existing pattern. |
| Bottom navigation | MUI `BottomNavigation` + `BottomNavigationAction` + `Fab` | No new dep; existing MUI. Center FAB overlaid with negative margin trick. |

---

## Phase 1 Design Artifacts

### Updated Data Model

See [data-model.md](data-model.md) — changes:
- `Book`: adds `year?: number`, `totalPages?: number`, `currentPage?: number`, `genres: string[]`
- `currentProgress` retained for backward compat; updated by repo when `currentPage`/`totalPages` available
- Dexie schema bumped to version 2: adds `*genres` multi-entry index on `books` table

### Updated Contracts

See [contracts/repositories.md](contracts/repositories.md) — changes:
- `bookRepository`: `addBook` / `updateBook` accept new fields
- `getReadingStats(year?: number)` utility function added (not a repository — in `src/utils/stats.ts`)

### New Routes

| Route | Page | Notes |
|-------|------|-------|
| `/` | `HomePage` | Default landing screen (was `LibraryPage`) |
| `/library` | `LibraryPage` | Moved off root |
| `/stats` | `StatsPage` | New |
| (existing) | — | All `/books/…` routes unchanged |

---

## Complexity Tracking

No constitution violations that block implementation — overrides justified above.
