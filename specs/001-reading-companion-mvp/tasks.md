# Tasks
<!-- derived from specs/001-reading-companion-mvp/plan.md v1.2.0 | 2026-05-25 -->

Check off each task as it is completed. Do not start a phase until all tasks in the previous phase are checked.

---

## Phase 1 — Project Setup & App Shell

- [ ] Initialize Flutter project with feature-first folder structure
- [ ] Add `very_good_analysis` to `analysis_options.yaml`
- [ ] Configure Material 3 theme with `ColorScheme.fromSeed` (light + dark)
- [ ] Set up bottom navigation bar shell with 4 tabs: Home | Library | Quotes | Profile
- [ ] Configure `go_router` ShellRoute for bottom nav + placeholder routes for all screens
- [ ] Bootstrap Riverpod 2.x with code generation (`@riverpod`, `build_runner`)
- [ ] Add `freezed`, `freezed_annotation`, `json_serializable`, `json_annotation` to `pubspec.yaml`
- [ ] Define sealed `AsyncState<T>` union (`idle / loading / success / error`) in `core/` using `@freezed`
- [ ] Configure `--dart-define` environment variables (dev / staging / prod)
- [ ] Create GitHub Actions workflow: `flutter analyze` + `flutter test` on push
- [ ] Verify `flutter analyze` passes with zero warnings

---

## Phase 2 — Authentication (Google Sign-In)

- [ ] Add Supabase Flutter SDK and initialize client with env config
- [ ] Add `google_sign_in` package and configure OAuth client IDs (Android + iOS)
- [ ] Configure deep link callback URI in AndroidManifest.xml and Info.plist
- [ ] Define `AuthRepository` interface
- [ ] Implement `SupabaseAuthRepository` with Google OAuth flow
- [ ] Build sign-in screen: single "Continue with Google" button, no other fields
- [ ] Integrate `flutter_secure_storage` for token persistence
- [ ] Add go_router auth guard — redirect unauthenticated users to `/signin`
- [ ] Create `authStateProvider` (Riverpod) streaming Supabase auth state
- [ ] Verify first sign-in creates account automatically (no registration screen)
- [ ] Test: unauthenticated cold start navigates to sign-in screen (AC-05.1)
- [ ] Test: successful Google sign-in navigates to Home (AC-05.2, AC-05.3)
- [ ] Test: returning user with stored session goes directly to Home (AC-05.4)
- [ ] Test: sign out clears session and returns to sign-in (AC-05.5)

---

## Phase 3 — Data Layer

- [ ] Add Drift and configure SQLite database class
- [ ] Create `books` table with all columns including `updated_at`
- [ ] Create `reading_sessions` table with all columns including `updated_at`
- [ ] Create `quotes` table with FTS5 virtual table on `text`
- [ ] Create `ratings` table with all columns including `updated_at`
- [ ] Create `sync_queue` table for offline operation queuing
- [ ] Write initial Drift migration (version 1)
- [ ] Define domain models (`Book`, `ReadingSession`, `Quote`, `Rating`) as `@freezed` classes
- [ ] Define `BookRepository`, `SessionRepository`, `QuoteRepository`, `RatingRepository` interfaces
- [ ] Implement Drift (local) repositories for all four entities
- [ ] Implement Supabase (remote) repositories for all four entities
- [ ] Implement `CompositeRepository` — local-first write, queues remote ops
- [ ] Wire `connectivity_plus` stream directly into `SyncService` (no wrapper class)
- [ ] Implement `SyncService` — flushes queue on connectivity restore + app foreground
- [ ] Implement exponential back-off retry (max 5 attempts)
- [ ] Test: offline op queued (UT-11)
- [ ] Test: sync queue flushes on connectivity restore (UT-12)
- [ ] Test: failed sync retries max 5 times (UT-13)

---

## Phase 4 — Home Dashboard

- [ ] Build Home screen with `SliverList` of currently-reading book cards
- [ ] Build `HomeBookCard` widget: cover thumbnail, title, progress bar, "Log session" button, "Add quote" button
- [ ] Build empty state for Home: no currently-reading books → CTA "Start reading a book"
- [ ] Build `SpeedDialFab` — expandable FAB with "Log session" and "Save quote" actions + book picker
- [ ] Implement streak calculation: count consecutive calendar days with ≥ 1 session
- [ ] Build `StreakBadge` widget — displays streak count, hidden when streak = 0
- [ ] Implement app resume: restore last `go_router` route on `AppLifecycleState.resumed`
- [ ] Wire `HomeNotifier` (Riverpod) for currently-reading books + streak
- [ ] Test: Home shows currently-reading books (AC-06.1)
- [ ] Test: "Log session" on card opens sheet pre-filled with that book (AC-06.2)
- [ ] Test: "Add quote" on card opens form pre-filled with that book (AC-06.3)
- [ ] Test: speed-dial FAB expands with two actions (AC-06.4)
- [ ] Test: empty state shows CTA when no books are reading (AC-06.5)
- [ ] Test: streak increments after logging a session (AC-07.1)
- [ ] Test: streak resets after missing a day (AC-07.3)
- [ ] Test: streak badge hidden when streak = 0 (AC-07.4)

---

## Phase 5 — Library Feature

- [ ] Build Library screen with grid and list toggle
- [ ] Add status filter (want_to_read / reading / finished)
- [ ] Build `BookGridCard` widget (thumbnail, title, author, status badge)
- [ ] Build `BookListTile` widget (compact list variant)
- [ ] Build Add Book form (title, author, total_pages required; cover optional)
- [ ] Add inline validation for required fields
- [ ] Build `CoverPickerWidget` — gallery picker + compress to 800 KB JPEG + 300×300 thumbnail
- [ ] Implement background cover upload to Supabase Storage with retry
- [ ] Configure `cached_network_image` for local thumbnail caching
- [ ] Wire `BookNotifier` (Riverpod) to Library and Add Book screens
- [ ] Test: FAB opens Add Book form (WT-05)
- [ ] Test: save with empty title shows error (WT-01)
- [ ] Test: save with empty author shows error (WT-02)
- [ ] Test: valid form triggers save callback (WT-03)
- [ ] Test: cover thumbnail shown after image pick (WT-04)
- [ ] Test: library grid renders covers correctly (WT-16)
- [ ] Test: book created offline syncs on reconnect (IT-01)

---

## Phase 6 — Reading Tracking Feature

- [ ] Build Book Detail screen with progress bar and session history
- [ ] Build `LogSessionSheet` modal bottom sheet (pagesFrom, pagesTo, duration, notes)
- [ ] Implement progress calculation: `pagesTo / book.totalPages * 100`
- [ ] Implement auto-status: set to `finished` when `pagesTo == totalPages`
- [ ] Add validation: `pagesTo > totalPages` → error
- [ ] Add validation: `pagesTo < pagesFrom` → error
- [ ] Build `SessionHistoryList` (chronological `SliverList`)
- [ ] Wire `SessionNotifier` (Riverpod) to Book Detail
- [ ] Test: percentage derived correctly (UT-01, UT-02, UT-06)
- [ ] Test: status sets to finished at 100% (UT-03)
- [ ] Test: pagesTo > totalPages invalid (UT-04)
- [ ] Test: pagesTo < pagesFrom invalid (UT-05)
- [ ] Test: session form opens as bottom sheet (WT-06)
- [ ] Test: pagesTo > totalPages shows error in UI (WT-07)
- [ ] Test: valid session triggers save callback (WT-08)
- [ ] Test: session list renders chronologically (WT-09)
- [ ] Test: book auto-finishes at 100% in DB (IT-07)
- [ ] Test: progress bar reflects latest session (IT-08)
- [ ] Test: session created offline syncs on reconnect (IT-02)

---

## Phase 7 — Quotes Feature

- [ ] Build Quotes tab on Book Detail
- [ ] Build `QuoteCaptureForm` (text required, pageNumber optional, tags, favorite toggle)
- [ ] Build `QuoteCard` (text, tags chips, favorite icon, page number)
- [ ] Implement FTS5 quote search using Drift
- [ ] Build `QuoteSearchBar` with debounced query
- [ ] Implement tag filter
- [ ] Implement isFavorite filter
- [ ] Add haptic feedback on favorite toggle
- [ ] Wire `QuoteNotifier` (Riverpod) to Quotes tab
- [ ] Test: save with empty text shows error (WT-10)
- [ ] Test: valid quote triggers save callback (WT-11)
- [ ] Test: favorite icon toggles on tap (WT-12)
- [ ] Test: keyword search returns matching quotes (IT-09)
- [ ] Test: search with no match returns empty (IT-10)
- [ ] Test: tag filter returns tagged quotes only (IT-11)
- [ ] Test: quote created offline syncs on reconnect (IT-03)

---

## Phase 8 — Ranking Feature

- [ ] Build `StarRatingWidget` (tappable 1–5 stars, pre-fills existing rating)
- [ ] Build `ReviewTextField` (optional multi-line)
- [ ] Add Rating section to Book Detail screen
- [ ] Implement upsert — existing rating pre-selected on re-open
- [ ] Add "Top rated" sort option on Library screen (stars desc, unrated last)
- [ ] Wire `RatingNotifier` (Riverpod)
- [ ] Test: stars below 1 invalid (UT-07)
- [ ] Test: stars above 5 invalid (UT-08)
- [ ] Test: stars 1–5 valid (UT-09)
- [ ] Test: sort by rating places unrated last (UT-10)
- [ ] Test: tapping star 3 selects 3 stars (WT-13)
- [ ] Test: widget pre-fills existing rating (WT-14)
- [ ] Test: save emits correct rating value (WT-15)
- [ ] Test: sort by Top Rated reorders list (WT-17)

---

## Phase 9 — Search & Observability

- [ ] Verify FTS5 index created on `quotes.text` in Drift migration
- [ ] Benchmark quote search on 10,000 rows — p95 < 100 ms
- [ ] Add Sentry SDK and configure DSN via env config
- [ ] Instrument `book_added` analytics event
- [ ] Instrument `session_logged` analytics event
- [ ] Instrument `quote_saved` analytics event
- [ ] Instrument `book_rated` analytics event
- [ ] Instrument `app_opened` analytics event
- [ ] Instrument `sync_completed` and `sync_failed` analytics events

---

## Phase 10 — Quality Gates & Release Prep

- [ ] All unit tests passing (UT-01 through UT-13)
- [ ] All widget tests passing (WT-01 through WT-17)
- [ ] All integration tests passing (IT-01 through IT-11)
- [ ] `flutter analyze` passes with zero warnings
- [ ] `very_good_analysis` lint rules passing
- [ ] Light theme accessibility check: contrast ratios pass WCAG AA
- [ ] Dark theme accessibility check: contrast ratios pass WCAG AA
- [ ] Large text support verified on all screens
- [ ] Semantic labels on all cover images and icon buttons
- [ ] Build Android APK in release mode — no build errors
- [ ] Upload APK to Google Play Internal Testing track
- [ ] Build iOS IPA in release mode — no build errors
- [ ] Upload IPA to TestFlight
