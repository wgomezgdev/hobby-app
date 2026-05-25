# Implementation Plan
<!-- derived from .specs/spec.md v1.1.0 | 2026-05-25 -->

This plan breaks the MVP spec into ordered implementation phases.
Each phase must be complete and passing quality gates before the next begins.

---

## Phase 1 — Project Setup & App Shell

**Goal:** A running Flutter app with theming, routing, and dependency injection wired up.
No features yet — just the skeleton every other phase builds on.

### Deliverables
- Flutter project initialized with feature-first folder structure
- `very_good_analysis` linter configured and passing
- Material 3 theme with `ColorScheme.fromSeed`, light/dark support
- `go_router` configured with placeholder routes for all top-level screens
- Riverpod 2.x with code generation (`@riverpod`) bootstrapped
- Environment config via `--dart-define` (dev / staging / prod)
- CI pipeline (GitHub Actions): `flutter analyze` + `flutter test` on every push

### Folder structure
```
lib/
  core/
    theme/
    router/
    di/
  features/
    library/
    reading_tracking/
    quotes/
    ranking/
  main.dart
```

---

## Phase 2 — Authentication

**Goal:** Users can register, sign in, and sign out. Unauthenticated users are redirected to login.

### Deliverables
- Supabase client initialized with project URL and anon key (via env config)
- `AuthRepository` interface + `SupabaseAuthRepository` implementation
- Screens: Login, Register
- `flutter_secure_storage` for token persistence
- go_router auth guard: redirect unauthenticated users to `/login`
- Riverpod `authStateProvider` that streams auth state changes
- Session auto-refresh handled by Supabase client

### Technical notes
- Email/password only for MVP
- On cold start: check stored session → navigate to Library or Login
- No biometric auth in MVP

---

## Phase 3 — Data Layer (Local + Remote)

**Goal:** Repository pattern in place for all entities, with Drift (local) and Supabase (remote) behind shared interfaces. Offline queue established.

### Deliverables
- Drift database with tables: `books`, `reading_sessions`, `quotes`, `ratings`
- All tables include `updated_at` column for sync conflict resolution
- `SyncQueue` table in Drift for failed remote operations
- Repository interfaces: `BookRepository`, `SessionRepository`, `QuoteRepository`, `RatingRepository`
- Supabase implementations of each repository
- Drift (local) implementations of each repository
- `CompositeRepository` that writes local-first and queues remote ops
- `SyncService`: flushes queue on connectivity restore and app foreground resume
- Exponential back-off retry (max 5 attempts per queued operation)
- `ConnectivityService` wrapping `connectivity_plus`

### Sync conflict rule
Server `updated_at` timestamp wins. If remote is newer, overwrite local silently.

---

## Phase 4 — Library Feature (US-01)

**Goal:** Users can add, view, edit, and delete books with cover images.
Satisfies AC-01.1 through AC-01.6.

### Deliverables
- Library screen: grid/list toggle, filter by status (want_to_read / reading / finished)
- Add Book form: title (required), author (required), total_pages (required), cover (optional)
- Edit Book screen (same form, pre-filled)
- Cover flow: pick from gallery → compress to 800 KB JPEG → generate 300×300 thumbnail → show preview
- Background cover upload to Supabase Storage with retry
- Local thumbnail cache (extended TTL via `cached_network_image`)
- `BookNotifier` (Riverpod) for library state
- Offline: book created locally, synced when online

### Key widgets
- `BookGridCard` — cover thumbnail, title, author, status badge
- `BookListTile` — compact list variant
- `CoverPickerWidget` — gallery picker + compression + preview

---

## Phase 5 — Reading Tracking Feature (US-02)

**Goal:** Users can log reading sessions and see progress per book.
Satisfies AC-02.1 through AC-02.6.

### Deliverables
- Book Detail screen: progress bar, session history list (chronological)
- Log Session bottom sheet: pagesFrom, pagesTo, durationMinutes, notes (optional)
- Progress calculation: `pagesTo / book.totalPages * 100` — derived, never stored
- Auto-status: set book to `finished` when `pagesTo == totalPages`
- Validation: `pagesTo > totalPages` → error; `pagesTo < pagesFrom` → error
- `SessionNotifier` (Riverpod) for session state per book
- Offline: session saved locally, synced when online

### Key widgets
- `ProgressBar` — animated, derived from latest session
- `LogSessionSheet` — modal bottom sheet with validation
- `SessionHistoryList` — `SliverList` of past sessions

---

## Phase 6 — Quotes Feature (US-03)

**Goal:** Users can save, search, filter, and favorite quotes linked to books.
Satisfies AC-03.1 through AC-03.7.

### Deliverables
- Quotes tab on Book Detail: list of quotes with search bar
- Add Quote form: text (required), pageNumber (optional), tags (optional), isFavorite toggle
- Full-text search using SQLite FTS5 via Drift (local)
- Filter by tag and by isFavorite
- Favorite toggle with haptic feedback
- `QuoteNotifier` (Riverpod) per book
- Offline: quote saved locally, synced when online

### Key widgets
- `QuoteCard` — text, tags chips, favorite icon, page number
- `QuoteCaptureForm` — text field, tag input, page field, favorite toggle
- `QuoteSearchBar` — debounced FTS query

---

## Phase 7 — Ranking Feature (US-04)

**Goal:** Users can rate books 1–5 stars and optionally add a review.
Satisfies AC-04.1 through AC-04.5.

### Deliverables
- Rating section on Book Detail: star widget + optional review text field
- Upsert behavior: re-opening rating shows previous value pre-filled
- Library sort by "Top rated": stars desc, unrated books last
- `RatingNotifier` (Riverpod)

### Key widgets
- `StarRatingWidget` — tappable 1–5 stars, pre-fills existing rating
- `ReviewTextField` — optional multi-line input

---

## Phase 8 — Search & Observability

**Goal:** Quote search is fast and reliable. Crashes and analytics are tracked from day one.

### Deliverables
- SQLite FTS5 index on `quotes.text` via Drift migration
- Quote search p95 latency target: < 100 ms on 10,000 quotes
- Sentry SDK integrated: crash reporting + performance tracing
- Analytics events instrumented (see spec success metrics):
  - `book_added`, `session_logged`, `quote_saved`, `book_rated`
  - `app_opened`, `sync_completed`, `sync_failed`

---

## Phase 9 — Quality Gates & Release Prep

**Goal:** All quality gates pass. App is ready for internal testing distribution.

### Deliverables
- All unit tests passing (see `misc/test-specs.md` — UT-01 through UT-13)
- All widget tests passing (WT-01 through WT-17)
- All integration tests passing (IT-01 through IT-11)
- `flutter analyze` zero warnings
- `very_good_analysis` lint rules passing
- Light/dark theme accessibility checks (contrast, large text, semantic labels)
- Android APK built and uploaded to Google Play Internal Testing track
- iOS IPA built and uploaded to TestFlight

---

## Phase dependencies

```
Phase 1 (Shell)
  └── Phase 2 (Auth)
        └── Phase 3 (Data Layer)
              ├── Phase 4 (Library)
              │     └── Phase 5 (Reading Tracking)
              │           └── Phase 6 (Quotes)
              │                 └── Phase 7 (Ranking)
              └── Phase 8 (Search & Observability)  ← runs alongside 4-7
Phase 9 (Quality) ← runs after all features complete
```
