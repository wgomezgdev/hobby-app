# Implementation Plan: Reading Pal

**Branch**: `002-reading-pal-app` | **Date**: 2026-05-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-reading-pal-app/spec.md`

## Summary

Reading Pal is a personal reading companion SPA that runs entirely in the browser with no
backend. Users manage a book library, log reading sessions, save quotes, and rate books. All
data persists automatically via IndexedDB (Dexie.js). A snapshot export/import system
provides data portability. The app has 6 screens connected by React Router v6 and uses
a strict repository pattern to isolate all database logic from UI components.

## Technical Context

**Language/Version**: TypeScript 5.x with `strict: true` + React 18

**Primary Dependencies**: Vite (build), React Router v6 (routing), MUI v5 (components),
Zustand (UI state), Dexie.js v4 + dexie-react-hooks (IndexedDB), React Hook Form (forms)

**Storage**: Dexie.js v4 / IndexedDB — automatic, browser-native, no setup required

**Testing**: Vitest + React Testing Library + fake-indexeddb

**Target Platform**: Modern browsers (Chrome 110+, Firefox 110+, Safari 16+, Edge 110+).
No mobile app. No server. No PWA in v1.

**Project Type**: Single-page web application (SPA)

**Performance Goals**:
- Library grid renders 200 books without visible lag
- Quote search returns results in < 1 second across 1,000 quotes
- Snapshot export completes in < 5 seconds for 200 books

**Constraints**: Fully offline, no internet required; cover images capped at 1 MB
(client-side validation); IndexedDB storage is browser-managed

**Scale/Scope**: Single user, single browser. Up to ~200 books, ~1,000 quotes total.
6 route-level screens, 4 entity repositories.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — all pass.*

| Principle | Gate | Status |
|---|---|---|
| I. Browser-Only | No remote calls, no auth, no backend deps | ✅ Pass |
| II. Dexie as Source of Truth | All reads via `useLiveQuery`; writes via repositories | ✅ Pass |
| III. TypeScript Strict | `strict: true` in tsconfig; no `any` | ✅ Pass |
| IV. Repository Pattern | One repo per entity; business logic in repo layer | ✅ Pass |
| V. Component & Form Standards | React Hook Form; URL tab params; MUI Skeleton for loading | ✅ Pass |
| VI. Accessibility | MUI ARIA roles; WCAG 2.1 AA contrast; focus trap in modals | ✅ Pass |
| VII. Testing Discipline | Vitest + RTL + fake-indexeddb; no real IndexedDB in tests | ✅ Pass |

No violations. Complexity Tracking section not required.

## Project Structure

### Documentation (this feature)

```text
specs/002-reading-pal-app/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── repositories.md  # Repository function signatures
│   └── routes.md        # Route definitions
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── db/
│   └── db.ts                     # Dexie DB class + schema + singleton export
├── types/
│   └── entities.ts               # Book, ReadingSession, Quote, Rating interfaces
├── repositories/
│   ├── bookRepository.ts
│   ├── sessionRepository.ts
│   ├── quoteRepository.ts
│   └── ratingRepository.ts
├── hooks/
│   ├── useBooks.ts               # useLiveQuery wrappers for books
│   ├── useSessions.ts
│   ├── useQuotes.ts
│   └── useRatings.ts
├── stores/
│   ├── libraryUiStore.ts         # filter chip + sort order
│   └── uiStore.ts                # modal open flags
├── components/
│   ├── BookCard/
│   ├── CoverUpload/
│   ├── StarRating/
│   ├── TagInput/
│   ├── ProgressBar/
│   └── SkeletonCard/
├── pages/
│   ├── LibraryPage/
│   ├── BookDetailPage/           # tabs via ?tab= query param
│   ├── AddEditBookPage/
│   ├── LogSessionPage/
│   ├── RankingPage/
│   └── SettingsPage/
├── utils/
│   └── snapshot.ts               # export / import JSON snapshot
├── App.tsx                       # Router + top-level layout
└── main.tsx

tests/
├── repositories/                 # Unit tests (fake-indexeddb)
├── components/                   # RTL component tests
└── utils/                        # snapshot.ts tests
```

**Structure Decision**: Single SPA project at repo root. No backend directory. All source
under `src/`. Tests mirror the source structure under `tests/`.
