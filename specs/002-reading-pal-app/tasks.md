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

## Mobile Phase 3: Capacitor — Native Android / iOS App ⏳ DEFERRED

**Status**: Deferred. Will be tackled once the app is fully polished and stable as a React
PWA. No work should begin here until Mobile Phase 2 is complete and the app is feature-complete.

**Purpose**: Wrap the existing SPA in a native shell using Capacitor so it can be distributed
as a real APK/IPA. Reuses 100% of the React codebase — no rewrite required.

**Prerequisite**: Phases 1–8 complete ✅ + Mobile Phase 2 (PWA) complete ✅. `npm run build` must pass before every sync.

**Key constraint**: Two features need native adaptation because the default browser APIs they
rely on (`<a download>` and `<input type="file">`) behave differently inside a WebView:
- **Export** uses an anchor-click download → must switch to `@capacitor/filesystem` + `@capacitor/share`
- **Import** uses a file-picker input → works in WebView on Android; verify and fix on iOS if needed

**Independent Test**: Build APK → install on Android emulator → walk through all 5 user
stories → export snapshot → re-import snapshot → confirm all data restored.

### Setup

- [ ] T044 Install Capacitor core and CLI: `npm install @capacitor/core @capacitor/cli`
- [ ] T045 Initialize Capacitor project: `npx cap init "Reading Pal" "com.readingpal.app" --web-dir dist` — generates `capacitor.config.ts` at repo root
- [ ] T046 Install Android platform: `npm install @capacitor/android && npx cap add android` — generates `android/` directory
- [ ] T047 [P] Install native-file plugins: `npm install @capacitor/filesystem @capacitor/share` — needed for export/import adaptation (T051–T052)
- [ ] T048 [P] Review `capacitor.config.ts`: set `appId: "com.readingpal.app"`, `appName: "Reading Pal"`, `webDir: "dist"`, enable `allowNavigation: []` (keep empty — no external URLs needed)

### Native Adaptation

- [ ] T049 Add platform detection utility in `src/utils/platform.ts`: export `isNative = Capacitor.isNativePlatform()` — used to branch export/import logic without polluting component code
- [ ] T050 Adapt export in `src/utils/snapshot.ts`: when `isNative`, write the JSON string to a temp file via `@capacitor/filesystem` (Directory.Cache) then trigger `@capacitor/share` Share sheet; keep existing `<a download>` path for web
- [ ] T051 [P] Verify import (file picker `<input type="file">`) on Android WebView — if broken, replace with `@capacitor/filesystem` pickFiles; keep existing path for web
- [ ] T052 [P] Verify Dexie.js / IndexedDB works inside Android WebView — open DevTools via `chrome://inspect`, confirm DB tables populate on first launch

### Build & Run

- [ ] T053 Add npm scripts to `package.json`: `"cap:sync": "npm run build && npx cap sync android"`, `"cap:android": "npx cap open android"`, `"cap:run": "npm run build && npx cap sync android && npx cap run android"`
- [ ] T054 Run first build and sync: `npm run cap:sync` — confirm no errors, `android/app/src/main/assets/public/` populated
- [ ] T055 Run on Android emulator: `npm run cap:run` (or `npx cap open android` → Run in Android Studio) — confirm app launches
- [ ] T056 Walk all 5 user stories on emulator: add book, log session, add quote, rate book, export snapshot, import snapshot

### Validation Checklist

- [ ] T057 [P] All 5 user stories work end-to-end on Android emulator
- [ ] T058 [P] Export produces a shareable JSON file (share sheet appears)
- [ ] T059 [P] Import restores all data after a full clear
- [ ] T060 [P] App works fully offline (airplane mode) — no network requests needed
- [ ] T061 [P] No white screen on cold launch (verify `webDir: dist` is correct and build ran before sync)

**Checkpoint**: APK runs on emulator, all features functional, export/import adapted for native.

---

## Phase 9: User Story 6 — Delete a Book (Priority: P1)

**Goal**: Users can permanently delete a book and all its data from the book detail page,
after confirming a warning dialog.

**Note**: `deleteBook` in `src/repositories/bookRepository.ts` already exists and cascades
(deletes sessions, quotes, ratings in a single Dexie transaction). Only UI work is needed.

**Independent Test**: Add a book with a session and a quote → open book detail → delete →
confirm dialog → verify redirected to library → confirm book absent under all filters →
export snapshot → confirm book data absent in JSON.

- [x] T075 Add a "Delete Book" icon button to the `BookDetailPage` header in
  `src/pages/BookDetailPage/BookDetailPage.tsx` (MUI `IconButton` with `DeleteOutlined` icon,
  placed in the top-right of the header next to the Edit button)
- [x] T076 Add a delete confirmation `Dialog` in `BookDetailPage` (MUI Dialog; title: "Delete
  book?"; body: "This will permanently delete «{title}» and all its sessions, quotes, and
  rating. This cannot be undone."; actions: Cancel + Delete (color="error"); on confirm: call
  `deleteBook(id)` then `navigate('/')`)
- [x] T077 [P] Verify focus is trapped in the confirmation dialog and restored on close in
  `src/pages/BookDetailPage/BookDetailPage.tsx`
- [x] T078 [P] Verify that after deletion the library is empty when that was the only book,
  showing the empty state CTA in `src/pages/LibraryPage/LibraryPage.tsx`

**Checkpoint**: Delete button visible on book detail, confirmation dialog warns about cascade,
confirming deletes book + data and returns to library, cancelling leaves everything intact.

---

## Phase 10: User Story 7 — Cover Search via Open Library (Priority: P2)

**Goal**: Users can search for a book cover by title and author inside the Add/Edit form,
pick one from a thumbnail grid, and have its URL stored and displayed throughout the app.

**API**: Open Library (free, no API key).
- Search: `https://openlibrary.org/search.json?title=…&author=…&fields=cover_i,title&limit=20`
- Thumbnail: `https://covers.openlibrary.org/b/id/{cover_i}-M.jpg`
- Stored URL (full size): `https://covers.openlibrary.org/b/id/{cover_i}-L.jpg`

**Data model**: No change. `cover: string | undefined` on `Book` already accepts URLs.
`<img src>` handles both data URIs (existing uploads) and URLs transparently.

**No migration needed**: existing base64 covers continue to display correctly.

**Independent Test**: Add Book → type title + author → click "Search cover online" → confirm
thumbnail grid appears → select a cover → confirm preview shown in form → save → confirm
cover appears on BookCard and BookDetailPage header.

- [x] T079 Create `CoverSearch` component in `src/components/CoverSearch/CoverSearch.tsx`:
  - Props: `title: string`, `author: string`, `onSelect: (url: string) => void`
  - "Search cover online" `Button` (outlined, `SearchOutlined` icon); disabled when both title and author are empty
  - On click: opens MUI `Dialog` and fires Open Library search fetch
  - While loading: centered `CircularProgress`
  - Results: MUI `ImageList` (3 cols) of `<img>` thumbnails (`-M.jpg`); each clickable
  - On thumbnail click: calls `onSelect` with the `-L.jpg` URL and closes dialog
  - No results: "No covers found. Try adjusting the title or author." centered text
  - Fetch error: same "No covers found" message
- [x] T080 Integrate `CoverSearch` into `AddEditBookPage` in
  `src/pages/AddEditBookPage/AddEditBookPage.tsx`:
  - Use `watch(['title', 'author'])` from `useForm` to pass live values to `CoverSearch`
  - Place `CoverSearch` below `CoverUpload` inside the existing cover `Controller`
  - `onSelect` calls `field.onChange` with the URL — replaces any previous cover value
  - Add a "Remove cover" text button (shown when `field.value` is set) that calls `field.onChange(undefined)`
- [x] T081 [P] Update `vite.config.ts` `workbox.runtimeCaching` to cache Open Library cover
  images (`https://covers.openlibrary.org/`) with a `CacheFirst` strategy (max 100 entries,
  30-day expiry) so covers load offline after first view
- [x] T082 [P] Verify existing books with base64 covers still display correctly after the change

**Checkpoint**: User can search, pick, and persist a cover URL. BookCard and BookDetailPage
show the cover. Existing base64 covers unchanged. Cover images cached for offline.

---

## Mobile Phase 2: PWA — Installable Web App

**Purpose**: Make the existing SPA installable on Android and iOS home screens, with full
offline support, using `vite-plugin-pwa`. Zero native build toolchain required — this is
pure web technology on top of the existing Vite app.

**Prerequisite**: Phases 1–8 complete ✅. Does NOT require Mobile Phase 2.

**What PWA gives you**: installable from Chrome/Safari, works offline, home-screen icon,
splash screen, no app store. What it does NOT give you: app store listing, push notifications
(beyond basic web push), access to all native APIs.

**Key constraint**: iOS Safari has stricter PWA support than Android Chrome. Test both.
The export (`<a download>`) and import (`<input type="file">`) features work natively in
browsers — no adaptation needed unlike Capacitor.

**Independent Test**: Open app in Chrome → install via "Add to Home Screen" → launch from
home screen icon → confirm standalone mode (no browser chrome) → turn on airplane mode →
confirm all 5 user stories still work.

### Icons & Manifest Assets

- [x] T062 Create `public/icons/` directory with the following PNG files (generate with any icon tool, e.g. https://realfavicongenerator.net or a script):
  - `icon-192x192.png` — standard Android home screen icon
  - `icon-512x512.png` — Android splash and Play Store (if ever needed)
  - `icon-maskable-192x192.png` — adaptive icon for Android (safe zone: inner 80%)
  - `icon-maskable-512x512.png` — same, large variant
  - `apple-touch-icon-180x180.png` — iOS home screen icon

### Vite PWA Plugin

- [x] T063 Install vite-plugin-pwa: `npm install -D vite-plugin-pwa`
- [x] T064 Configure `vite-plugin-pwa` in `vite.config.ts`:
  ```ts
  VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icons/*.png'],
    manifest: {
      name: 'Reading Pal',
      short_name: 'Reading Pal',
      description: 'Your personal reading companion',
      theme_color: '#1976d2',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/',
      icons: [
        { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/icon-maskable-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
        { src: '/icons/icon-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,woff2}'],
      runtimeCaching: [], // Dexie is local — no API calls to cache
    },
  })
  ```
- [x] T065 Add Apple-specific meta tags to `index.html`:
  ```html
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="Reading Pal">
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon-180x180.png">
  ```
- [x] T066 Register the service worker in `src/main.tsx` using vite-plugin-pwa's virtual module:
  ```ts
  import { registerSW } from 'virtual:pwa-register'
  registerSW({ immediate: true })
  ```
- [x] T067 Add TypeScript declaration for the virtual module in `src/vite-env.d.ts`:
  ```ts
  /// <reference types="vite-plugin-pwa/client" />
  ```

### Validation

- [x] T068 Run `npm run build` — confirm no errors, `dist/sw.js` and `dist/manifest.webmanifest` generated
- [x] T069 [P] Open Chrome DevTools → Application → Manifest — confirm no errors, all icons resolve, `display: standalone` shown
- [x] T070 [P] Open Chrome DevTools → Application → Service Workers — confirm SW is active and not erroring
- [x] T071 [P] Install via Chrome "Install app" prompt — confirm standalone window opens (no browser address bar)
- [x] T072 [P] Airplane mode test — launch installed PWA offline, confirm all 5 user stories work
- [ ] T073 [P] iOS Safari test — open in Safari → Share → Add to Home Screen → launch → confirm standalone mode
- [ ] T074 [P] Run Lighthouse PWA audit (`npm run build && npx serve dist` → Chrome DevTools → Lighthouse → PWA) — aim for all green PWA checks

**Checkpoint**: App installs from browser on Android and iOS, works fully offline, all 5 user stories pass in installed mode.

---

## Phase 12: User Story 8 — App Version Display (Priority: P1)

**Goal**: Every build shows the current version number at the bottom of every screen so the
user always knows which version is running on their phone.

**Strategy**: Read the version from `package.json` at build time via Vite's `define` config.
Bump `package.json` version for every PR merged to main (use semantic versioning: MINOR for
new features, PATCH for fixes).

**Independent Test**: Run `npm run dev` → confirm version string visible in footer on every
page → bump version in `package.json` → rebuild → confirm updated version shown.

- [x] T091 Expose app version at build time in `vite.config.ts`:
  ```ts
  import pkg from './package.json'
  // inside defineConfig:
  define: { __APP_VERSION__: JSON.stringify(pkg.version) }
  ```
- [x] T092 [P] Add global TypeScript declaration in `src/vite-env.d.ts`:
  ```ts
  declare const __APP_VERSION__: string
  ```
- [x] T093 Add a version footer to the `Layout` component in
  `src/components/Layout/Layout.tsx`: MUI `Box` fixed at bottom of page, centered
  `Typography variant="caption"` showing `v{__APP_VERSION__}`, color `text.disabled`,
  subtle so it doesn't compete with content
- [x] T094 Bump `package.json` version to `0.2.0` to mark the start of versioned releases

**Checkpoint**: Footer shows `v0.2.0` on every screen after rebuild.

---

## Phase 13: User Story 9 — Author Name Autocomplete (Priority: P2)

**Goal**: When typing in the Author field on the Add/Edit Book form, suggestions from Open
Library's author search API appear as a dropdown. The user can pick a suggestion or keep
typing freely. No suggestion is forced — the field stays free-text.

**API**: Open Library author search (free, no key).
- Endpoint: `https://openlibrary.org/search/authors.json?q={query}&limit=8`
- Response: `{ docs: [{ name: "George R. R. Martin", ... }] }`

**Key constraints**:
- Debounce input by 350 ms to avoid hammering the API on every keystroke
- `freeSolo` mode — user can type any name, suggestions are optional
- Client-side filtering disabled (server already filters by query)
- Show suggestions only when query is ≥ 2 characters
- On network error or timeout: fail silently, no suggestions shown (field still works)

**Independent Test**: Type "george" in the Author field → suggestions appear including
"George R. R. Martin" → select it → confirm field fills completely → type an unknown author
name → confirm no suggestions → field still accepts free input.

- [x] T095 Create `useAuthorSuggestions` hook in `src/hooks/useAuthorSuggestions.ts`:
  - Input: `query: string`
  - Debounces 350 ms before fetching
  - Fetches `https://openlibrary.org/search/authors.json?q={query}&limit=8`
  - Returns `string[]` of author names (empty array on error or query < 2 chars)
  - Cancels in-flight requests via `AbortController` when query changes
- [x] T096 Replace the author `TextField` in `src/pages/AddEditBookPage/AddEditBookPage.tsx`
  with MUI `Autocomplete`:
  - `freeSolo` — allows any input, not just suggestions
  - `options` from `useAuthorSuggestions(watchedAuthor)`
  - `filterOptions={x => x}` — disable client-side filtering
  - `onInputChange` updates the RHF field value via `field.onChange`
  - Preserve `required` validation and error display
  - Loading indicator (`loading` prop) while fetch is in-flight

**Checkpoint**: Author field suggests real author names from Open Library, selecting fills
the field, free typing still works, network errors are silent.

---

## Phase 17: UX Polish — High Impact Fixes ✅ DONE

**Goal**: Four targeted UX improvements identified from a full app audit.

- [x] T121 Replace "Ranking" text button in `Layout.tsx` with `EmojiEvents` icon to match the
  Settings icon style — consistent icon-only nav buttons
- [x] T122 Add `Snackbar` to `BookDetailPage.tsx` after book deletion: shows `"<title> deleted"`
  for 1.5s then navigates to library — confirmation feedback before leaving the screen
- [x] T123 Consolidate cover action buttons in `CoverUpload.tsx` into a single flex row:
  Upload | Camera | {extra slot} | Remove — `extra` prop allows `AddEditBookPage` to inject
  the CoverSearch button inline, eliminating the duplicate Remove button and scattered layout
- [x] T124 Add dynamic subtitle to `RankingPage.tsx` below the title, updating based on the
  active view: "Your books sorted by star rating" or "Finished books, most recent first"

**Checkpoint**: Nav bar icons consistent, delete gives feedback, cover buttons in one row,
ranking page explains its sort order.

---

## Phase 18: Bug Fix — Ranking Shows All Finished Books ✅ DONE

**Root cause**: "Recently Finished" view was built from the `ratings` list, so finished books
without a rating were invisible. The view must come from `books` filtered by status.

**Fix**: For the "recently finished" view, iterate `books.filter(status === FINISHED)` sorted
by `updatedAt` desc, then look up the rating separately (optional). Unrated books show
"Not rated" instead of empty/crashed stars. TypeScript type updated: `rating?: Rating`.

- [x] T125 Fix `RankingPage.tsx` "Recently Finished" view to include all finished books
  regardless of rating — unrated books show "Not rated" label v0.3.3

---

## Phase 11: Deployment — Hosting on Vercel ✅ DONE

**Production URL**: https://hobby-app-dusky.vercel.app

**Status**: Fully deployed. Every push to `main` auto-deploys. PWA on phone updates
automatically on next app open — no manual steps needed.

**Why Vercel**: Free tier, zero config for Vite apps, automatic HTTPS (required for PWA
service workers in production), deploys on every push to `main`.

### One-time setup (completed)

- [x] T083 ~~Install Vercel CLI~~ — not needed, used dashboard import instead
- [x] T084 ~~Login and link~~ — done via GitHub OAuth on vercel.com
- [x] T085 Add `vercel.json` at repo root for SPA routing fallback ✅ merged PR #13
- [x] T086 Imported `wgomezgdev/hobby-app` on Vercel dashboard (Vite auto-detected) ✅
- [x] T087 Deployed — production URL: https://hobby-app-dusky.vercel.app ✅

### Automatic updates

```
git push origin main   ← Vercel detects the push and deploys automatically (~1 min)
```
The PWA on the phone picks up the new service worker the next time the app is opened with
a network connection — no manual steps needed.

### PWA install from production URL

- [ ] T088 On Android Chrome: open https://hobby-app-dusky.vercel.app → "Add to Home Screen"
  → confirm icon and name → launch from home screen → confirm standalone mode (no browser bar)
- [x] T089 HTTPS is active ✅ (Vercel provides it automatically)
- [ ] T090 [P] Verify PWA auto-updates: push a change to main → wait ~1 min → reopen app on
  phone → confirm change appears without reinstalling

**Checkpoint**: App live on a public HTTPS URL ✅, PWA installs from production, updates
automatically on every push to main.

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
- **US6 (Phase 9)**: Depends on Phase 8 — `deleteBook` repo function already exists, UI only
- **US7 (Phase 10)**: Depends on Phase 8 — no data model changes, UI + API integration only
- **Mobile Phase 2 — PWA**: Depends on Phase 8 complete. Independent of Mobile Phase 3. Can be pursued without ever doing Capacitor.
- **Mobile Phase 3 — Capacitor**: ⏳ DEFERRED. Depends on Phase 8 + Mobile Phase 2 complete. Begin only when the app is fully polished as a PWA.

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

### Total Tasks: 96

| Phase | Tasks | Parallelizable | Status |
|---|---|---|---|
| Setup | T001–T006 | 4 of 6 | ✅ done |
| Foundational | T007–T013 | 4 of 7 | ✅ done |
| US1 (P1) | T014–T019 | 4 of 6 | ✅ done |
| US2 (P2) | T020–T026 | 3 of 7 | ✅ done |
| US5 (P2) | T027–T028 | 1 of 2 | ✅ done |
| US3 (P3) | T029–T032 | 3 of 4 | ✅ done |
| US4 (P3) | T033–T037 | 3 of 5 | ✅ done |
| Polish | T038–T043 | 5 of 6 | ✅ done |
| US6 — Delete Book | T075–T078 | 2 of 4 | ✅ done |
| US7 — Cover Search | T079–T082 | 2 of 4 | ✅ done |
| Mobile Phase 2 (PWA) | T062–T074 | 8 of 13 | ✅ done (T073–T074 optional) |
| Mobile Phase 3 (Capacitor) | T044–T061 | 7 of 18 | ⏳ deferred |
| Phase 12 — App Version Display | T091–T094 | 2 of 4 | ✅ done |
| Phase 13 — Author Autocomplete | T095–T096 | 1 of 2 | ✅ done |
| Phase 11 — Deployment (Vercel) | T083–T090 | 5 of 8 | ✅ done |
| Phase 17 — UX Polish (high impact) | T121–T124 | 4 of 4 | ✅ done |
| Phase 18 — Bug Fix: Ranking finished books | T125 | 1 of 1 | ✅ done |
| Phase 19 — Warm Light Theme | T126–T128 | 3 of 3 | ✅ done |
| Phase 20 — Book Model Updates | T129–T134 | 6 of 6 | ✅ done |
| Phase 21 — Home Screen | T135–T137 | 3 of 3 | ✅ done |
| Phase 22 — Pace Stats | T138–T139 | 2 of 2 | ✅ done |
| Phase 23 — Stats Screen | T140–T146 | 7 of 7 | ✅ done |
| Phase 14 — AI Cover Scan (Gemini) | T097–T106 | 7 of 10 | ✅ done |
| Phase 15 — AI Reading Summary (Gemini) | T107–T111 | 3 of 5 | ⏳ future |
| Phase 16 — Supabase Cloud Sync | T112–T120 | 5 of 9 | ⏳ deferred (replaced by Phase 26) |
| Phase 24 — Goodreads Library Import | T147–T151 | 4 of 5 | ✅ done |
| Phase 25 — Stats: Session Activity + Genre Year Fix | T152–T155 | 4 of 4 | ✅ done |
| Phase 26 — Firebase Auth + Firestore Sync | T156–T162 | 7 of 7 | ✅ done |

---

## Phase 26: Firebase Auth + Firestore Cloud Sync ✅ DONE

**Goal**: Google Sign-In via Firebase Auth. Profile tab shows user photo, name, and email.
All app data (books, sessions, quotes, ratings) syncs to Firestore under `users/{uid}/`.
Replaces the deferred Supabase Phase 16.

**Prerequisites**: Firebase project with Authentication (Google provider enabled) + Firestore.

**Env vars required** (Vercel + `.env.local`):
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

**Architecture**:
- `src/lib/firebase.ts` — conditional init (no-op when env vars absent)
- `src/lib/firestoreSync.ts` — `pushToFirestore`, `pullFromFirestore`, `autoSyncOnSignIn`
  (batch-chunked at 400 writes; stores `lastSyncedAt` in localStorage)
- `src/hooks/useAuth.ts` — reactive auth state; triggers `autoSyncOnSignIn` on first sign-in
- `src/pages/ProfilePage/ProfilePage.tsx` — user photo/name/email; Sync + Restore buttons;
  link to Settings (data management); Sign out

**Sync strategy (V1)**:
- On sign-in: if local Dexie empty → pull from Firestore; else → push to Firestore
- "Sync to cloud": manual push, overwrites Firestore with current local data
- "Restore from cloud": manual pull with confirmation, replaces local data

- [x] T156 Create `src/lib/firebase.ts`: conditional Firebase init guarded by env vars;
  export `auth`, `firestoreDb`, `googleProvider`, `isFirebaseConfigured`
- [x] T157 Create `src/lib/firestoreSync.ts`: `pushToFirestore`, `pullFromFirestore`,
  `autoSyncOnSignIn`, `getLastSyncedAt`; batch writes chunked at 400 ops
- [x] T158 Create `src/hooks/useAuth.ts`: reactive auth state via `onAuthStateChanged`;
  calls `autoSyncOnSignIn` on first sign-in; exposes `signIn`, `signOut`
- [x] T159 Create `src/pages/ProfilePage/ProfilePage.tsx`: Google photo avatar, name, email;
  Sync / Restore buttons with loading states and Snackbar feedback; Settings link; Sign out
- [x] T160 Add `/profile` route to `App.tsx`; update `Layout.tsx` bottom nav Profile tab
  to route to `/profile` and show Google user avatar when signed in
- [x] T161 Update `HomePage.tsx` avatar to show Google user photo (tappable → `/profile`)
- [x] T162 Add `firebase ^10.14.0` to `package.json`; bump version to `0.10.0`; add
  Firebase env var declarations to `src/vite-env.d.ts`

**Checkpoint**: Profile tab shows Google Sign-In; after sign-in shows photo + name; Sync
uploads local data to Firestore; Restore pulls it back; avatar on Home shows Google photo.

---

## Phase 25: Stats — Session Activity & Genre Year Fix ✅ DONE

**Goal**: Fill all sections of the Stats screen with live data. Add a Reading Activity card
(sessions count, total time read, day streak) sourced from `ReadingSession` records. Fix the
genre donut so it respects the selected year filter instead of always showing all-time genres.

- [x] T152 Export `finishedInYear` from `src/utils/statsAggregations.ts` and add three new
  pure functions: `getTotalReadingMinutes(sessions, year)`, `getTotalSessions(sessions, year)`,
  `getReadingStreak(sessions)` (consecutive days back from today with ≥1 session)
- [x] T153 Update `src/hooks/useStats.ts` to query `db.sessions` via `useLiveQuery`; pass
  year-filtered finished books to `getGenreBreakdown` (fixes genre year filter bug); return
  `totalReadingMinutes`, `totalSessions`, `readingStreak`
- [x] T154 Add "Reading Activity" card to `src/pages/StatsPage/StatsPage.tsx`: three equal
  columns — Sessions count, Time read (`formatHours`), Day streak with 🔥; always shown when
  any session exists, independent of finished-book requirement; hide monthly chart + genre/pages
  bottom row when `booksRead === 0` so the empty-book state is clean
- [x] T155 Bump `package.json` version to `0.9.0`

**Checkpoint**: Stats screen shows Reading Activity card as soon as first session is logged;
genre donut updates when year filter changes; pages-read shows "—" + hint when no page data.

---

## Phase 24: User Story 13 — Goodreads Library Import ✅ DONE

**Goal**: Users can import their entire Goodreads library (read, currently reading, to-read)
by uploading a Goodreads CSV export file. All parsing is done client-side — no proxy needed.

**Prerequisites**: None beyond the existing app.

**Architecture**:
- `src/utils/goodreadsParser.ts` — `parseGoodreadsCSV(csvText: string): GoodreadsBookRaw[]`;
  a custom RFC-4180-compliant CSV parser that handles Goodreads' `="ISBN"` quoting and
  maps `Exclusive Shelf` to `BookStatus`.
- `src/components/GoodreadsImport/GoodreadsImport.tsx` — MUI Dialog with four phases:
  (1) instructions + file picker, (2) preview with counts + duplicate count,
  (3) import progress, (4) done.
- `SettingsPage` — "Import from Goodreads" section with `AutoStories`-icon button.

**Data mapping**:

| Goodreads CSV column | App field |
|---|---|
| `Title` | `title` |
| `Author` | `author` |
| `ISBN13` / `ISBN` | `isbn` |
| `Number of Pages` | `totalPages` |
| `My Rating` | `Rating.stars` (only when 1–5) |
| `Original Publication Year` | `year` |
| `Exclusive Shelf` | `status` (read→FINISHED, currently-reading→READING, to-read→WANT_TO_READ) |

**Duplicate detection**: title + author lower-cased string match against existing books.

**Independent Test**: Export CSV from goodreads.com → choose file → preview shows correct
counts → import → verify books in library → import again → 0 new books, all skipped.

- [x] T147 ~~Create `api/goodreads.ts` Vercel Edge Function~~ — removed; approach replaced
  by client-side CSV import (RSS proxy was blocked by Goodreads server-side IP filtering)
- [x] T148 Create `src/utils/goodreadsParser.ts`:
  - `parseGoodreadsCSV(csvText: string): GoodreadsBookRaw[]` — RFC-4180 CSV parser;
    handles quoted fields, escaped quotes, and Goodreads `="value"` ISBN columns
  - Export `GoodreadsBookRaw` interface: `{ title, author, isbn, status, totalPages?,
    year?, cover?, userRating?, shelves[] }`
- [x] T149 [P] Create `src/components/GoodreadsImport/GoodreadsImport.tsx` MUI Dialog:
  - **idle phase**: numbered instructions + "Choose CSV File" button (hidden file input)
  - **preview phase**: counts grid (Read / Reading / To Read / Skipped duplicates) +
    "Import X books" primary button + "Cancel" secondary button
  - **importing phase**: `LinearProgress` + "Importing book X of Y…" label
  - **done phase**: success message; dialog closes automatically after 2 s
  - **error**: `Alert` with message; user can retry
  - Deduplication: loads `getAllBooks()` before showing preview; skips title+author matches
  - For each imported book: calls `addBook(...)`; if `userRating >= 1`, also calls
    `saveRating({ bookId, stars: userRating, ratedAt: Date.now() })`
  - FINISHED books get `currentPage = totalPages` and `currentProgress = 100`
- [x] T150 Update `src/pages/SettingsPage/SettingsPage.tsx`: add "Import from Goodreads"
  section (new `<Divider>` + heading + description text + `AutoStories`-icon button that
  opens `<GoodreadsImport>` dialog)
- [x] T151 [P] Bump `package.json` version to `0.6.0` (minor bump for new feature)

**Checkpoint**: Settings has "Import from Goodreads" button; choosing a Goodreads CSV
export parses all books; preview shows correct counts; import inserts books + ratings;
re-running import skips all existing books.

---

## Phase 14: User Story 10 — AI Book Cover Scan ✅ DONE

**Goal**: User takes a photo of a book's front cover; Gemini Flash extracts the title and
author and fills the form fields automatically.

**Prerequisites**:
- A free Google AI Studio account and API key (`VITE_GEMINI_API_KEY`)
- Key added to Vercel environment variables (Project → Settings → Environment Variables)
- Key added to local `.env.local` for development (`VITE_GEMINI_API_KEY=your-key`)
- `.env.local` must be in `.gitignore` (already is by default with Vite)

**API**: `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}`

**Prompt used**:
```
Look at this book cover image. Extract the book title and the author name.
Reply in this exact format:
Title: <title>
Author: <author>
If you cannot find a value, write "Unknown" for that field.
```

**Response parsing**: Split lines, find `Title:` and `Author:` prefixes, trim whitespace.
Treat `"Unknown"` as missing (do not overwrite existing field value with "Unknown").

**Independent Test**: Add Book → tap "Scan cover" → take a clear photo of a front cover →
confirm title and author fill in → save → confirm book appears correctly in library.

### One-time Setup

- [ ] T097 Create a free API key at https://aistudio.google.com → "Get API key"
- [ ] T098 Add `VITE_GEMINI_API_KEY` to Vercel environment variables
- [ ] T099 Add `VITE_GEMINI_API_KEY=your-key` to local `.env.local`

### Implementation

- [x] T100 Create `src/hooks/useCoverScan.ts`:
  - Input: `dataUrl: string` (data URL from camera/file input)
  - Strips `data:image/...;base64,` prefix before sending to API
  - Sends multipart request with image + prompt to Gemini Flash endpoint
  - Returns `{ scan, loading, error, clearError }`; scan returns `ScanResult | null`
  - Handles quota exceeded (HTTP 429) with a clear message
  - Handles unreadable image (Gemini returns "Unknown" for both fields)

- [x] T101 Add "Scan cover" Button (DocumentScanner icon) to the cover section in
  `src/pages/AddEditBookPage/AddEditBookPage.tsx`:
  - Triggers a hidden `<input type="file" accept="image/*" capture="environment">`
  - On photo taken: reads as base64 data URL, calls `useCoverScan`
  - Shows `CircularProgress` inside button while loading

- [x] T102 On successful scan result in `AddEditBookPage`:
  - If Title/Author field is empty: fill automatically
  - If field already has a value: show a confirmation Snackbar with Apply / Keep buttons
  - If Gemini returns "Unknown" for a field: leave that field unchanged

- [x] T103 Error states shown as closeable `Alert` below cover section:
  - API key missing → "AI scan not configured. Add VITE_GEMINI_API_KEY to enable."
  - Quota exceeded (HTTP 429) → "Daily scan limit reached. Try again tomorrow."
  - Network error → "Could not reach AI service. Check your connection."
  - Unreadable image (both "Unknown") → "Cover not recognized. Try a clearer photo or fill in the fields manually."

- [ ] T104 [P] Verify scan works end-to-end on mobile: take a clear photo → fields fill
- [ ] T105 [P] Verify blurry/non-book photo shows the "not recognized" error gracefully
- [ ] T106 [P] Verify that if only one field is "Unknown", only that field is left unchanged

**Checkpoint**: "Scan cover" button visible on Add/Edit form, photo opens camera, Gemini
fills title and author, existing values are protected with confirmation, all error states
show clear messages.

---

## Phase 15: User Story 11 — AI Reading Summary ⏳ FUTURE (deferred)

**Goal**: On the book detail page, the user can generate a 2–3 sentence AI summary of
the book using Gemini Flash, then save it as a note on the book.

**Prerequisites**: Phase 14 setup complete (same API key).

**Data model change**: Add `notes?: string` field to the `Book` entity in
`src/types/entities.ts`. Add a Dexie migration in `src/db/db.ts` (bump schema version).

- [ ] T107 Add `notes?: string` to `Book` interface in `src/types/entities.ts`
- [ ] T108 Bump Dexie schema version in `src/db/db.ts` (existing books get `notes: undefined`)
- [ ] T109 Add `generateSummary(title: string, author: string): Promise<string>` utility in
  `src/utils/gemini.ts` (shares the same fetch logic as `useCoverScan`):
  - Prompt: `"Write a 2-3 sentence summary of the book «{title}» by {author}. Be factual and concise."`
  - Returns the raw text response
- [ ] T110 Add "Generate summary" button to `src/pages/BookDetailPage/BookDetailPage.tsx`:
  - Only shown when book has title + author
  - Shows `CircularProgress` while loading
  - On success: displays summary in an editable `TextField`; user can edit before saving
  - "Save note" button calls `updateBook(id, { notes: editedSummary })`
  - Existing note displayed if `book.notes` is set, with option to regenerate
- [ ] T111 [P] Verify note persists after page refresh and appears on book detail

**Checkpoint**: Book detail shows a "Generate summary" button; tapping it fetches and
displays an AI summary; user can edit and save it; it persists in the database.

---

## Phase 16: User Story 12 — Supabase Cloud Sync ⏳ PLANNED

**Goal**: Books, sessions, quotes, and ratings sync to Supabase Postgres so data
survives browser clears and is available across devices.

**Prerequisites**: A free Supabase account and project. Google Sign-In already
implemented in an earlier phase (Supabase Auth).

**Architecture**: Dexie (IndexedDB) as local cache → sync queue → Supabase Postgres.
Reads from local first (fast, offline-capable); writes go to both local and Supabase.

- [ ] T112 Create Supabase project and note `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
- [ ] T113 Add Supabase environment variables to Vercel and `.env.local`
- [ ] T114 Install `@supabase/supabase-js` and create `src/lib/supabase.ts` client
- [ ] T115 Create Supabase tables mirroring the Dexie schema:
  `books`, `sessions`, `quotes`, `ratings` — each with a `user_id` column for RLS
- [ ] T116 Enable Row Level Security on all tables: users can only read/write their own rows
- [ ] T117 Implement `src/sync/syncService.ts`:
  - On app start (online): pull all user rows from Supabase → upsert into Dexie
  - On every write (add/update/delete): write to Dexie first, then push to Supabase
  - On offline write: queue in a local `sync_queue` Dexie table; replay on reconnect
- [ ] T118 Wire `syncService.ts` into `src/main.tsx` — call `syncOnStartup()` after auth
- [ ] T119 Add sync status indicator to the Layout header (syncing spinner / last synced time)
- [ ] T120 [P] Test cross-device: add book on device A → open app on device B → confirm book appears

**Checkpoint**: Books added on one device appear on another after sync; offline writes
queue and sync when reconnected; data survives a full browser storage clear.

---

---

## Phase 19: Warm Light Theme — Visual Overhaul ✅ DONE

**Goal**: Restyle the entire app with a warm light palette. All screens inherit the new
palette automatically through MUI's theming system.

**Reference**: `misc/ui-design/` screens (all 4 screens show the warm light theme).

**Note**: Originally planned as dark-navy + cyan; pivoted to warm light (cream + terracotta)
during implementation.

- [x] T126 Create `src/theme/theme.ts` with MUI `createTheme`: `palette.mode = 'light'`,
  `primary.main = '#E07940'` (terracotta), `background.default = '#FFF8F2'` (cream),
  `background.paper = '#FFFFFF'`; export as `appTheme`
- [x] T127 Wrap `App.tsx` with `<ThemeProvider theme={appTheme}>` and `<CssBaseline />`
- [x] T128 Replace the top `AppBar` in `Layout.tsx` with MUI `BottomNavigation` +
  `BottomNavigationAction` pinned at the bottom (5 tabs: Home/Library/—/Stats/Profile);
  overlay a centered `Fab` (terracotta, `add` icon) for the middle slot; display app version
  caption above the nav panel; update `App.tsx` routes: `/` → `HomePage`, `/library` →
  `LibraryPage`

**Checkpoint**: Warm light theme on all screens, bottom nav functional, FAB opens Add Book.

---

## Phase 20: Book Model Updates (FR-029, FR-030) ✅ DONE

**Goal**: Books gain publication year, page tracking (total + current), and genre tags.
Forms updated to match the Add Book mockup (Screen 2).

**Independent Test**: Add a book with Year = 2007, Total Pages = 662, Current Page = 512,
Genres = [Fantasy, Adventure] → save → open detail → confirm "Page 512 of 662" shown →
confirm 77% progress → edit the book → confirm all fields pre-filled correctly.

- [x] T129 Update `Book` interface in `src/types/entities.ts` — add `year?: number`,
  `totalPages?: number`, `currentPage?: number`, `genres: string[]`; add `Genre` type
- [x] T130 Bump Dexie schema to version 2 in `src/db/db.ts` — add `*genres` multi-entry
  index on `books` table; existing books get `genres: []` on migration
- [x] T131 Update `bookRepository.ts` `addBook` / `updateBook` to:
  - Accept and persist the new fields
  - When `currentPage` and `totalPages` are both set and `> 0`, derive and store
    `currentProgress = Math.round((currentPage / totalPages) * 100)` (capped at 100)
- [x] T132 Update `AddEditBookPage` form to match Screen 2 mockup:
  - Add YEAR field (numeric, 4-digit, optional) beside AUTHOR in a two-column row
  - Add TOTAL PAGES + CURRENT PAGE side-by-side numeric row
  - Add GENRE multi-select chips (Fantasy, Adventure, Science Fiction, Romance, Thriller)
    using MUI `Chip` toggle pattern (selected = filled terracotta, unselected = outlined)
  - Wire all new fields through React Hook Form `Controller`
- [x] T133 [P] Update `BookCard` to display page progress when available:
  `currentPage` and `totalPages` set → show "Page X of Y" below title; fall back to
  "X%" (existing) when page data absent
- [x] T134 [P] Update `BookDetailPage` header to show genre badge chip and "Author · Year"
  subtitle when year is set

**Checkpoint**: Add Book form has all new fields, saved books show page progress and genre
on cards and detail page, older books without page data still display correctly.

---

## Phase 21: Home Screen (FR-028) ✅ DONE

**Goal**: A dedicated Home dashboard replaces the library as the app's landing screen.
Shows greeting, stats row, currently-reading card, and a completed-books scroll.

**Reference**: `misc/ui-design/screen1_home.png`

**Independent Test**: Open app → confirm Home screen loads (not Library) → confirm greeting
changes by time of day → confirm stats row counts match actual book statuses → confirm
"Currently Reading" card shows the active book with progress → tap "See all →" → confirm
Library filtered to Finished books.

- [x] T135 Create `src/hooks/useHomeData.ts` using `useLiveQuery`:
  - `readingCount`: books where `status === 'READING'`
  - `finishedCount`: books where `status === 'FINISHED'`
  - `pendingCount`: books where `status === 'WANT_TO_READ'`
  - `currentBook`: first book where `status === 'READING'` (or `undefined`)
  - `recentlyFinished`: up to 8 books where `status === 'FINISHED'` ordered by `updatedAt desc`
- [x] T136 Create `src/pages/HomePage/HomePage.tsx`:
  - **Header**: time-of-day greeting ("Good morning/afternoon/evening 👋") derived from local time
  - **Stats row**: three `Card` components side by side — Read / In Progress / Pending
    with large count number and label
  - **"Currently Reading" section**: when `currentBook` is set, show full-width card with
    cover thumbnail, `● ACTIVE` chip, title, author, "Page X of Y" or "X%", terracotta
    `LinearProgress`; when no active book, show a CTA chip linking to Library
  - **"Completed" section**: "Completed" label + "See all →" `Link` (routes to
    `/library?status=finished`); horizontal `Box` with `overflow-x: auto` rendering
    `recentlyFinished` as small `BookCard` chips (cover + title + stars); section omitted
    when `finishedCount === 0`
- [x] T137 [P] Register `HomePage` at `/` in `App.tsx`; move `LibraryPage` to `/library`
  (update all internal `navigate('/')` calls that mean "go to library" to `navigate('/library')`)

**Checkpoint**: Home screen is the app entry point with live stats and currently-reading card.

---

## Phase 22: Reading Pace Stats on Book Detail (FR-031) ✅ DONE

**Goal**: The Book Detail screen shows a 2×2 stats grid with start date, days reading,
daily pace, and estimated days to finish.

**Reference**: `misc/ui-design/screen4_detail.png`

**Independent Test**: Open a book with at least 2 logged sessions and page data set →
confirm start date matches first session date → confirm days reading count → confirm pace
(pages/day) and ETA (days to finish) are reasonable numbers.

- [x] T138 Create `src/utils/readingPace.ts` with pure functions (no DB calls):
  ```typescript
  interface PaceStats {
    startDate: Date | null;       // date of first session
    daysReading: number;          // unique calendar days with a session
    avgPacePerDay: number;        // currentPage / daysSinceStart (rounded)
    daysToFinish: number | null;  // (totalPages - currentPage) / avgPace (null if no pace)
  }
  export function calcPaceStats(sessions: ReadingSession[], book: Book): PaceStats
  export function formatDate(date: Date): string   // returns "D MMM" via en-US locale
  ```
- [x] T139 Add 2×2 stats grid to `BookDetailPage` below the progress section:
  - 📅 Started reading (formatted date of first session)
  - ⏱ Days reading (unique calendar days count)
  - 🔥 Avg pace (pages/day)
  - 🎯 To finish (estimated days or "—" when not calculable)
  - Use MUI `Grid` 2-column layout; each cell: icon + bold number + muted label
  - Only render section when `sessions.length > 0` and at least one of `totalPages`/`currentPage` is set

**Checkpoint**: Pace stats grid visible on Book Detail for books with session history.

---

## Phase 23: Stats Screen (FR-032) ✅ DONE

**Goal**: A dedicated Stats screen shows reading progress over time — books read, monthly
bar chart, genre breakdown, pages read, and best month.

**Reference**: `misc/ui-design/screen3_stats.png`

**Independent Test**: Add 5+ books with different genres and finish dates across 2+ months →
open Stats → confirm books-read count matches → confirm monthly bar chart shows bars for
months with activity → confirm genre donut reflects book genres → switch year filter → confirm
counts update.

- [x] T140 Install `recharts`: `npm install recharts` — lightweight charting library
- [x] T141 Create `src/stores/statsUiStore.ts` (Zustand): `selectedYear: number | 'all'`
  defaulting to current year; `setYear` action
- [x] T142 Create `src/utils/statsAggregations.ts` with pure functions:
  - `getBooksReadByYear(books, year)` → count of FINISHED books (filter by `updatedAt`)
  - `getBooksByMonth(books, year)` → `{ month: string; count: number }[]` (Jan–Dec)
  - `getAvgPerMonth(books, year)` → average finished books per month (number)
  - `getGenreBreakdown(books)` → `{ genre: string; count: number; pct: number }[]`
  - `getTotalPagesRead(books, year)` → sum of `totalPages` for FINISHED books in year
  - `getBestMonth(books, year)` → `{ month: string; count: number }` — month with most finished books
  - `getYoyChange(books, year)` → percentage change vs prior year (number | null)
  - `getAvailableYears(books)` → sorted unique years from FINISHED books' `updatedAt`
- [x] T143 Create `src/hooks/useStats.ts` with `useLiveQuery` wrappers calling the
  aggregation utils; depends on `selectedYear` from `statsUiStore`
- [x] T144 Create `src/pages/StatsPage/StatsPage.tsx`:
  - **Header**: "Statistics" title + "Your reading progress" subtitle
  - **Year filter**: row of MUI `Chip` buttons for available years + "All"; active = filled terracotta
  - **Books read card**: large count + "Books read · Annual goal: 50" + `TrendingUp` badge with
    YoY change percentage (compare current year vs prior year)
  - **Books per month**: `recharts` `BarChart` (responsive, warm colors, terracotta bars for
    non-zero months); show average per month in top-right corner
  - **Bottom row** (two cards side by side):
    - Left: Genre donut (`recharts` `PieChart` with `innerRadius`) + legend list with percentage
    - Right (stacked): PAGES READ count; BEST MONTH name + fire emoji
  - Show skeleton placeholders while `useLiveQuery` is `undefined`
  - Empty state when no finished books: "Finish your first book to see statistics"
- [x] T145 [P] Register `StatsPage` at `/stats` in `App.tsx`; wire Stats tab in `BottomNav`
- [x] T146 [P] Update `BottomNav` active tab detection to highlight correctly for `/`,
  `/library`, `/stats`, and `/books/…` routes

**Checkpoint**: Stats screen shows correct aggregations, charts render, year filter changes
data, empty state shown when no books are finished.

---

## Phase 19–23 Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| Phase 19 — Warm Light Theme | T126–T128 | ✅ done |
| Phase 20 — Book Model Updates | T129–T134 | ✅ done |
| Phase 21 — Home Screen | T135–T137 | ✅ done |
| Phase 22 — Pace Stats | T138–T139 | ✅ done |
| Phase 23 — Stats Screen | T140–T146 | ✅ done |

### Execution Order

```
T126–T127 (theme)          ──┐
T128 (bottom nav)           ──┤── FOUNDATION (all visual work depends on dark theme)
                              │
T129–T131 (data model)     ──┤── can run in parallel with theme work
                              │
T132–T134 (form + cards)   ──┤── depends on T129
                              │
T135–T137 (Home screen)    ──┤── depends on theme + T128 + T129
T138–T139 (pace stats)     ──┤── depends on T131
T140–T146 (Stats screen)   ──┘── depends on T129 + T131 + T128
```

---

## Notes

- [P] tasks have no file conflicts and no incomplete dependencies — safe to run concurrently
- Each user story phase ends with an independent checkpoint — validate before moving on
- No test tasks generated (not requested in spec)
- `BookDetailPage` shell (T023) is the single cross-story dependency; US3 and US4 tab panels depend on it
- Cover grid responsiveness uses MUI `Grid` breakpoints, not custom CSS
- All forms use React Hook Form — no `useState` for field values
- All reads use `useLiveQuery` — no `useEffect` + `await` patterns

---

## Phase 27: Book Metadata Cache (Future / Production-Scale) ⏳ PLANNED

**Goal**: Cache book search results in Firestore so repeated lookups never hit the external API.
Reduces quota pressure, improves response time for popular titles, and future-proofs the app for
a public launch with many concurrent users.

**Motivation**: Open Library is free and unlimited today, but for a production app with thousands
of users a caching layer decouples the app from any single third-party API. Once a book is
looked up, it should never need to be fetched again.

### Architecture

```
User types title
      │
      ▼
Check Firestore `books-cache` collection  ──hit──▶  return cached result (instant)
      │ miss
      ▼
Query Open Library API
      │
      ▼
Write result to Firestore `books-cache/{cacheKey}`
      │
      ▼
Return result to user
```

**Cache key**: `sha1(query.toLowerCase().trim())` or simply `encodeURIComponent(query.toLowerCase())` as the Firestore document ID.

**Cache document schema** (`books-cache/{key}`):
```ts
{
  query: string;          // original normalized query
  fetchedAt: number;      // Date.now() — for TTL
  results: TitleSuggestion[];
}
```

**TTL**: 30 days — stale entries can be ignored or refreshed on next miss (no active purge needed at this scale).

### Tasks

| ID | Task | Notes |
|----|------|-------|
| T163 | Create `src/lib/bookSearchCache.ts` | `getCached(query)` / `setCached(query, results)` using Firestore; skip if `!firestoreDb` |
| T164 | Update `useTitleSuggestions` to check cache before API call | Cache hit → set suggestions immediately, skip fetch |
| T165 | Write cache entry after successful Open Library fetch | Fire-and-forget (`void setCached(...)`) |
| T166 | Add fallback to Google Books if Open Library returns 0 results | Only triggered on empty response, not on error |
| T167 | Bump version to `0.14.0` | New feature |

### Notes

- Cache reads/writes are **fire-and-forget** — never block the UI
- Cache is **shared across all users** (keyed by query, not by uid) — maximises hit rate
- When Firebase is not configured (local dev without env vars), cache is silently skipped
- Google Books fallback (T166) uses existing quota — only fires when Open Library returns nothing
- No Dexie schema change needed — cache lives in Firestore only
