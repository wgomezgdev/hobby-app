# Tasks: Reading Pal

**Input**: Design documents from `specs/002-reading-pal-app/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | data-model.md ✅ | contracts/ ✅ | research.md ✅

**Tests**: Not requested — test tasks excluded.

**Organization**: Tasks are grouped by user story to enable independent implementation and
testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US5)
- All file paths are relative to repo root

---

## Phase 1: Setup

**Purpose**: Scaffold the project and configure all tooling. No source code yet.

- [x] T001 Scaffold Vite + React + TypeScript project at repo root per `quickstart.md` (`npm create vite@latest . -- --template react-ts`)
- [x] T002 Install all runtime and dev dependencies per `quickstart.md` (react-router-dom, MUI, Zustand, Dexie, dexie-react-hooks, react-hook-form, vitest, RTL, fake-indexeddb, jsdom)
- [x] T003 [P] Configure `tsconfig.json` with `strict: true`, `target: ES2020`, `lib: [ES2020, DOM, DOM.Iterable]`
- [x] T004 [P] Configure `vite.config.ts` with Vitest settings (environment: jsdom, globals: true, setupFiles: tests/setup.ts)
- [x] T005 [P] Create `tests/setup.ts` importing `@testing-library/jest-dom`
- [x] T006 [P] Create `.gitignore` entries for `node_modules/`, `dist/`, `.env`

**Checkpoint**: `npm run dev` starts, `npm test` runs, `npm run build` succeeds.

---

## Phase 2: Foundational

**Purpose**: Core infrastructure all user stories depend on. MUST complete before any story work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T007 Define all entity interfaces and types in `src/types/entities.ts` (Book, ReadingSession, Quote, Rating, BookStatus, Snapshot — per `data-model.md`)
- [x] T008 Create Dexie DB class and singleton export in `src/db/db.ts` (schema version 1: books, sessions, quotes, ratings — per `data-model.md`)
- [x] T009 [P] Create Zustand `libraryUiStore` in `src/stores/libraryUiStore.ts` (filter: `all | reading | want_to_read | finished`; sort: `recent | title | author`)
- [x] T010 [P] Create Zustand `uiStore` in `src/stores/uiStore.ts` (modal/dialog open flags)
- [x] T011 Create top-level `Layout` component in `src/components/Layout/Layout.tsx` (MUI AppBar with app name and settings icon; renders `<Outlet />`)
- [x] T012 [P] Create `SkeletonCard` component in `src/components/SkeletonCard/SkeletonCard.tsx` (MUI Skeleton shaped like a BookCard, used as loading placeholder)
- [x] T013 Create `App.tsx` with all React Router v6 routes per `contracts/routes.md` (/, /books/new, /books/:id, /books/:id/edit, /books/:id/sessions/new, /ranking, /settings; 404 fallback)

**Checkpoint**: App loads at `/` without errors; router navigates between placeholder pages.

---

## Phase 3: User Story 1 — Build and Browse a Book Library (Priority: P1) 🎯 MVP

**Goal**: Users can add books, view them in a filterable/sortable grid, and edit them.

**Independent Test**: Add 3 books with different statuses → filter by each status → confirm
only matching books show → sort by title → confirm alphabetical order → edit a book → confirm
change is reflected everywhere.

- [x] T014 [P] [US1] Implement `bookRepository` in `src/repositories/bookRepository.ts` (getAllBooks, getBook, addBook, updateBook, deleteBook — per `contracts/repositories.md`; deleteBook cascades via Dexie transaction)
- [x] T015 [P] [US1] Create `useBooks` hook in `src/hooks/useBooks.ts` (`useLiveQuery` wrappers: useAllBooks, useBook(id), useBooksByStatus)
- [x] T016 [P] [US1] Create `BookCard` component in `src/components/BookCard/BookCard.tsx` (cover thumbnail with CSS object-fit, title, author, status badge, progress bar; shows placeholder when no cover)
- [x] T017 [P] [US1] Create `CoverUpload` component in `src/components/CoverUpload/CoverUpload.tsx` (click-to-upload + drag-and-drop; validates file size ≤ 1 MB before converting to base64; shows preview)
- [x] T018 [US1] Build `LibraryPage` in `src/pages/LibraryPage/LibraryPage.tsx` (responsive cover grid: 1/2/4 cols at MUI breakpoints sm/md/lg; filter chips from libraryUiStore; sort selector from libraryUiStore; FAB → /books/new; SkeletonCard grid while useLiveQuery returns undefined; empty state when array is empty)
- [x] T019 [US1] Build `AddEditBookPage` in `src/pages/AddEditBookPage/AddEditBookPage.tsx` (React Hook Form; add mode at /books/new with status defaulting to WANT_TO_READ; edit mode at /books/:id/edit pre-filling form; required: title, author, status; optional: CoverUpload; on save calls addBook or updateBook)

**Checkpoint**: US1 fully functional — library grid, filtering, sorting, add, edit all work independently.

---

## Phase 4: User Story 2 — Log Reading Sessions and Track Progress (Priority: P2)

**Goal**: Users can log sessions, watch progress accumulate, and see auto-FINISHED transition.

**Independent Test**: Open a book → log 2 sessions → verify progress bar updates after each →
log a session bringing progress to 100% → confirm book status changes to Finished automatically →
view Sessions tab → confirm both sessions appear chronologically.

- [x] T020 [P] [US2] Implement `sessionRepository` in `src/repositories/sessionRepository.ts` (getSessionsForBook, saveSession with `Math.min(100, prev + delta)` progress cap + auto-FINISHED transition in single Dexie transaction, deleteSession — per `contracts/repositories.md`)
- [x] T021 [P] [US2] Create `useSessions` hook in `src/hooks/useSessions.ts` (`useLiveQuery` wrapper: useSessionsForBook(bookId) ordered by startedAt asc)
- [x] T022 [P] [US2] Create `ProgressBar` component in `src/components/ProgressBar/ProgressBar.tsx` (MUI LinearProgress displaying integer 0–100%; accessible label)
- [x] T023 [US2] Build `BookDetailPage` shell in `src/pages/BookDetailPage/BookDetailPage.tsx` (header: cover thumbnail, title, author, status badge, ProgressBar; MUI Tabs with ?tab query param via React Router useSearchParams; skeleton header while useLiveQuery returns undefined; renders tab content panels)
- [x] T024 [US2] Build Progress tab panel in `src/pages/BookDetailPage/tabs/ProgressTab.tsx` (current progress percentage display; "Log Session" button → /books/:id/sessions/new)
- [x] T025 [US2] Build Sessions tab panel in `src/pages/BookDetailPage/tabs/SessionsTab.tsx` (chronological list: date, duration, progress delta, notes; SkeletonCard rows while loading; empty state with "Log a session" CTA)
- [x] T026 [US2] Build `LogSessionPage` in `src/pages/LogSessionPage/LogSessionPage.tsx` (React Hook Form; date defaults to today; duration in minutes required ≥ 1; progress delta required 1–100; optional notes; on save calls saveSession then navigates back to /books/:id?tab=sessions)

**Checkpoint**: US2 fully functional — sessions log, progress updates, FINISHED transition fires, all independent of quotes and ratings.

---

## Phase 5: User Story 5 — Export and Import a Data Snapshot (Priority: P2)

**Goal**: Users can back up all data to a JSON file and restore it completely.

**Independent Test**: Add books + sessions → export snapshot → confirm file downloads → clear
all data manually (browser DevTools) → import snapshot → confirm all data restored → cancel
import on confirmation prompt → confirm no data was changed.

- [x] T027 [P] [US5] Implement `exportSnapshot` and `importSnapshot` in `src/utils/snapshot.ts` (export: serialize all Dexie tables to Snapshot interface + trigger file download; import: parse File, validate `version` field, replace all DB tables in single Dexie transaction; throw on malformed input)
- [x] T028 [US5] Build `SettingsPage` in `src/pages/SettingsPage/SettingsPage.tsx` (Export button calls exportSnapshot; Import: file picker input, on file selected shows MUI Dialog confirmation warning "This will replace all current data", on confirm calls importSnapshot, on cancel does nothing; error snackbar on import failure)

**Checkpoint**: US5 fully functional — export downloads valid JSON, import restores data, cancel leaves data untouched.

---

## Phase 6: User Story 3 — Save and Search Quotes (Priority: P3)

**Goal**: Users can capture quotes, tag them, mark favorites, and filter/search across them.

**Independent Test**: Open a book → add 3 quotes with different tags, mark 1 as favorite →
filter by favorite → confirm only 1 shows → search by a word from quote text → confirm
correct result → filter by tag → confirm only matching quotes show.

- [x] T029 [P] [US3] Implement `quoteRepository` in `src/repositories/quoteRepository.ts` (getQuotesForBook, getTagsForBook, addQuote, toggleFavorite, deleteQuote — per `contracts/repositories.md`)
- [x] T030 [P] [US3] Create `useQuotes` hook in `src/hooks/useQuotes.ts` (`useLiveQuery` wrappers: useQuotesForBook(bookId), useTagsForBook(bookId))
- [x] T031 [P] [US3] Create `TagInput` component in `src/components/TagInput/TagInput.tsx` (MUI Autocomplete in free-solo mode; comma-separated entry; suggestions from useTagsForBook for current book; renders selected tags as MUI Chips)
- [x] T032 [US3] Build Quotes tab panel in `src/pages/BookDetailPage/tabs/QuotesTab.tsx` (quote list: text, page number if set, tag chips, favorite icon toggle; search bar (case-insensitive String.includes on text); favorite filter toggle; tag filter chip list; "Add Quote" FAB opens inline form (not a separate route): text required, optional page number, TagInput, isFavorite toggle, submit calls addQuote; SkeletonCard rows while loading; empty state with "Add a quote" CTA; "no results" state distinct from empty state)

**Checkpoint**: US3 fully functional — add, filter, search quotes all work independently.

---

## Phase 7: User Story 4 — Rate Books and View a Ranking (Priority: P3)

**Goal**: Users can rate finished books and see all rated books ranked.

**Independent Test**: Rate 2 books with different stars → open Ranking → confirm sorted by
stars desc → confirm unrated books absent → switch to "Recently Finished" view → confirm
sort changes → open a book and update its rating → confirm Ranking reflects the change.

- [x] T033 [P] [US4] Implement `ratingRepository` in `src/repositories/ratingRepository.ts` (getRating, saveRating as upsert — per `contracts/repositories.md`)
- [x] T034 [P] [US4] Create `useRatings` hook in `src/hooks/useRatings.ts` (`useLiveQuery` wrappers: useRating(bookId), useAllRatings)
- [x] T035 [P] [US4] Create `StarRating` component in `src/components/StarRating/StarRating.tsx` (interactive MUI-based 1–5 star selector; keyboard accessible; supports read-only display mode)
- [x] T036 [US4] Build Rating tab panel in `src/pages/BookDetailPage/tabs/RatingTab.tsx` (StarRating selector; optional review textarea via React Hook Form; save button calls saveRating; empty state shows star selector directly with "You haven't rated this book" label)
- [x] T037 [US4] Build `RankingPage` in `src/pages/RankingPage/RankingPage.tsx` (fetches all ratings + books via useLiveQuery; default view: rated books sorted by stars desc; "Recently Finished" toggle: sorts by book.updatedAt desc filtered to FINISHED status; each card: cover, title, author, StarRating in read-only mode; SkeletonCard rows while loading; empty state with "Rate some books" + link to Library)

**Checkpoint**: US4 fully functional — rating saves, ranking sorts correctly, unrated books excluded.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Finalize loading states, accessibility, and responsiveness across all stories.

- [x] T038 [P] Verify `LibraryPage` shows `SkeletonCard` grid (4 cards) while `useLiveQuery` returns `undefined`, and empty state only when result is `[]` in `src/pages/LibraryPage/LibraryPage.tsx`
- [x] T039 [P] Verify `BookDetailPage` header shows MUI Skeleton (cover, title, author) while `useLiveQuery` returns `undefined` in `src/pages/BookDetailPage/BookDetailPage.tsx`
- [x] T040 [P] Verify import confirmation dialog in `SettingsPage` traps focus and restores it on close in `src/pages/SettingsPage/SettingsPage.tsx`
- [x] T041 [P] Verify Add Quote inline form traps focus and restores it on close in `src/pages/BookDetailPage/tabs/QuotesTab.tsx`
- [x] T042 Responsiveness pass — manually verify cover grid at 360 px (1 col), 600 px (2 cols), 900 px (4 cols) in `src/pages/LibraryPage/LibraryPage.tsx`
- [x] T043 Run `quickstart.md` validation checklist (`npm run dev`, `npm test`, `npm run build` all pass)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **blocks all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 — no story dependencies
- **US2 (Phase 4)**: Depends on Phase 2 — no story dependencies (can run in parallel with US1)
- **US5 (Phase 5)**: Depends on Phase 2 — no story dependencies (can run in parallel with US1, US2)
- **US3 (Phase 6)**: Depends on Phase 2 + BookDetailPage shell from US2 (T023)
- **US4 (Phase 7)**: Depends on Phase 2 + BookDetailPage shell from US2 (T023)
- **Polish (Phase 8)**: Depends on all story phases complete

### Within Each Phase

- Tasks marked [P] within the same phase can run in parallel
- Repository tasks before hook tasks before page tasks (within a story)
- BookDetailPage shell (T023) must complete before any tab panel task

---

## Parallel Execution Examples

### Phase 3 (US1) — can parallelize:
```
T014 bookRepository  ──┐
T015 useBooks hook   ──┤
T016 BookCard        ──┤── then T018 LibraryPage → T019 AddEditBookPage
T017 CoverUpload     ──┘
```

### Phase 4 (US2) — can parallelize:
```
T020 sessionRepository  ──┐
T021 useSessions hook   ──┤── then T023 BookDetailPage shell
T022 ProgressBar        ──┘       → T024 ProgressTab
                                  → T025 SessionsTab
                                  → T026 LogSessionPage
```

### Phase 6 + 7 (US3 + US4) — can parallelize once T023 is done:
```
T029 quoteRepository  ──┐                T033 ratingRepository ──┐
T030 useQuotes        ──┤── T032 QuotesTab  T034 useRatings    ──┤── T036 RatingTab
T031 TagInput         ──┘                   T035 StarRating     ──┘
                                                    → T037 RankingPage
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 (Library + Add/Edit Book)
4. **STOP and VALIDATE**: A working book library with no other features
5. Ship or demo

### Incremental Delivery

1. Setup + Foundational → scaffold ready
2. US1 → working library (add, browse, filter, sort, edit)
3. US2 → reading sessions + progress tracking + book detail
4. US5 → data export/import (backup safety net)
5. US3 → quote capture and search
6. US4 → ratings + ranking
7. Polish → production-ready

### Total Tasks: 43

| Phase | Tasks | Parallelizable |
|---|---|---|
| Setup | T001–T006 | 4 of 6 |
| Foundational | T007–T013 | 4 of 7 |
| US1 (P1) | T014–T019 | 4 of 6 |
| US2 (P2) | T020–T026 | 3 of 7 |
| US5 (P2) | T027–T028 | 1 of 2 |
| US3 (P3) | T029–T032 | 3 of 4 |
| US4 (P3) | T033–T037 | 3 of 5 |
| Polish | T038–T043 | 5 of 6 |

---

## Notes

- [P] tasks have no file conflicts and no incomplete dependencies — safe to run concurrently
- Each user story phase ends with an independent checkpoint — validate before moving on
- No test tasks generated (not requested in spec)
- `BookDetailPage` shell (T023) is the single cross-story dependency; US3 and US4 tab panels depend on it
- Cover grid responsiveness uses MUI `Grid` breakpoints, not custom CSS
- All forms use React Hook Form — no `useState` for field values
- All reads use `useLiveQuery` — no `useEffect` + `await` patterns
