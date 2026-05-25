# Tasks
<!-- derived from specs/001-reading-companion-mvp/plan.md v1.2.0 | 2026-05-25 -->

Check off each task as it is completed. Do not start a phase until all tasks in the previous phase are checked.
Each phase ends with a **Smoke Test** — run the app on a simulator or device and verify visually before proceeding.

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

### Smoke Test — Phase 1
**Command:** `flutter run --dart-define-from-file=.env.dev`

| # | What to do | Expected result |
|---|---|---|
| 1 | Launch the app on simulator/emulator | App opens with no crash. Warm cream background (`#FFF8F2`) visible |
| 2 | Observe the bottom navigation bar | 4 tabs visible: Home · Library · Quotes · Profile |
| 3 | Tap each tab | Each tab navigates to its placeholder screen with the tab name visible. No crashes |
| 4 | Observe the app bar on each tab | Gradient header (`#4B3D8F → #7060B8`) visible on all tabs |
| 5 | Enable dark mode on the device | App switches to dark theme without crash or visual breakage |
| 6 | Run `flutter analyze` in terminal | Zero warnings output |

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

### Smoke Test — Phase 2
**Command:** `flutter run --dart-define-from-file=.env.dev`

| # | What to do | Expected result |
|---|---|---|
| 1 | Clear app data / fresh install | Sign-in screen appears immediately. Home tab is NOT visible |
| 2 | Observe the sign-in screen | Single "Continue with Google" button. No email field, no register link |
| 3 | Tap "Continue with Google" | Google account picker opens |
| 4 | Select a Google account | App navigates to Home screen. No extra steps |
| 5 | Close and reopen the app | App goes directly to Home — no sign-in prompt |
| 6 | Go to Profile → tap "Sign Out" | Returns to sign-in screen. Home tab inaccessible |
| 7 | Check Supabase dashboard → Authentication → Users | New user entry visible with your Google email |

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

### Smoke Test — Phase 3
**Command:** `flutter run --dart-define-from-file=.env.dev`

> Phase 3 has no new visible screens. Use a temporary debug screen or Flutter DevTools to verify.

| # | What to do | Expected result |
|---|---|---|
| 1 | Run `flutter test test/unit/` | All data layer unit tests pass (UT-11, UT-12, UT-13) |
| 2 | Enable airplane mode on device → sign in | App opens without crash. Offline mode works |
| 3 | Open Flutter DevTools → App Size / Logging tab | No Drift migration errors in logs |
| 4 | Restore connectivity | No crash. SyncService logs "sync triggered" in debug console |
| 5 | Check Supabase dashboard → Table Editor | `books`, `reading_sessions`, `quotes`, `ratings` tables exist with correct columns |

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

### Smoke Test — Phase 4
**Command:** `flutter run --dart-define-from-file=.env.dev`

| # | What to do | Expected result |
|---|---|---|
| 1 | Sign in and open Home tab with no books | Empty state visible: illustration + "Start your reading journey" + CTA button |
| 2 | (Seed 1 book with status "reading" directly in Supabase) | Home shows the book as a card with cover, title, progress bar |
| 3 | Tap "Log Session" on the card | Bottom sheet opens pre-filled with that book's name |
| 4 | Tap "Add Quote" on the card | Quote bottom sheet opens pre-filled with that book's name |
| 5 | Tap the extended FAB | FAB expands showing "Log Session" and "Add Quote" options |
| 6 | Minimize the app and reopen it | Home restores to the same scroll position |
| 7 | Streak ring | Hidden when no sessions logged. Visible and shows correct count after a session |

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

### Smoke Test — Phase 5
**Command:** `flutter run --dart-define-from-file=.env.dev`

| # | What to do | Expected result |
|---|---|---|
| 1 | Open Library tab | Grid view shows books. Book count visible in header |
| 2 | Tap the grid/list toggle | Switches between grid and list view smoothly |
| 3 | Tap the FAB | Add Book form opens in under 300 ms (AC-01.1) |
| 4 | Tap Save with title and author empty | Inline errors appear on both fields. Book is NOT saved (AC-01.2) |
| 5 | Fill in title, author, total pages → tap Save | Book appears in library with status "Want to Read" (AC-01.3) |
| 6 | Add a book with a cover image | 300×300 thumbnail appears in the grid card (AC-01.4, AC-01.5) |
| 7 | Enable airplane mode → add a book | Book appears immediately in library. Reconnect → book appears in Supabase dashboard (AC-01.6) |
| 8 | Filter by "Reading" | Only books with status "Reading" shown |

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

### Smoke Test — Phase 6
**Command:** `flutter run --dart-define-from-file=.env.dev`

| # | What to do | Expected result |
|---|---|---|
| 1 | Tap any book in the library | Book Detail screen opens with progress bar, info strip, and tabs |
| 2 | Tap "Log Reading Session" | Bottom sheet opens. "From page" is auto-filled with last session's end page |
| 3 | Enter a valid pagesTo and duration → Save | Progress bar updates immediately. Session appears in history (AC-02.2) |
| 4 | Enter pagesTo greater than totalPages → Save | Inline error appears. Session is NOT saved (AC-02.4) |
| 5 | Log a session where pagesTo = totalPages | Book status changes to "Finished" automatically. Library card updates (AC-02.3) |
| 6 | Scroll session history | Sessions are listed newest-first (AC-02.6) |
| 7 | Check Book Detail info strip | Total reading time and estimated completion date are visible |

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

### Smoke Test — Phase 7
**Command:** `flutter run --dart-define-from-file=.env.dev`

| # | What to do | Expected result |
|---|---|---|
| 1 | Open Book Detail → Quotes tab | Quotes list visible with search bar. Decorative quote mark on cards |
| 2 | Tap FAB → fill quote text → Save | Quote appears in list with Lora serif text (AC-03.3) |
| 3 | Try to save with empty text | Inline error appears. Quote NOT saved (AC-03.2) |
| 4 | Tap the favourite heart on a quote | Icon toggles to amber. Haptic vibration felt on device (AC-03.5) |
| 5 | Open global Quotes tab → type "habits" in search bar | Only quotes containing "habits" appear within 100 ms (AC-03.4) |
| 6 | Type a word that matches nothing | Empty state shown — no crash (AC-03.4) |
| 7 | Apply "Favorites" filter | Only favourited quotes shown (AC-03.5) |

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

### Smoke Test — Phase 8
**Command:** `flutter run --dart-define-from-file=.env.dev`

| # | What to do | Expected result |
|---|---|---|
| 1 | Open Book Detail → Ranking tab | Star widget and review field visible |
| 2 | Tap star 4 → tap Save | 4 stars saved. Rating appears in the info strip and Library card (AC-04.2) |
| 3 | Reopen the Ranking tab | Widget is pre-filled with the saved 4-star rating (AC-04.5) |
| 4 | Change rating to 2 → Save | Rating updates to 2 stars (upsert, not duplicate) |
| 5 | Open Library → sort by "Top Rated" | Books ordered by stars descending. Unrated books appear last (AC-04.4) |

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

### Smoke Test — Phase 9
**Command:** `flutter run --dart-define-from-file=.env.dev`

| # | What to do | Expected result |
|---|---|---|
| 1 | Add a book in the app | Open Sentry dashboard → Issues/Events: `book_added` event visible |
| 2 | Log a reading session | `session_logged` event appears in Sentry |
| 3 | Save a quote | `quote_saved` event appears in Sentry |
| 4 | Run quote search benchmark script | p95 latency < 100 ms on 10,000 seeded rows |
| 5 | Force-crash the app (temporary `throw Exception()`) | Crash appears in Sentry dashboard within 30 seconds. Remove after test |

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

### Smoke Test — Phase 10
**Command:** `flutter run --release --dart-define-from-file=.env.prod`

| # | What to do | Expected result |
|---|---|---|
| 1 | Run `flutter test --coverage` | All 41 tests pass. Coverage report generated |
| 2 | Run `flutter analyze` | Zero warnings |
| 3 | Run the app on a mid-range Android device (not emulator) | App cold-starts in < 2 seconds |
| 4 | Enable "Large text" accessibility setting on device | All screens readable, no text clipping or overflow |
| 5 | Enable "Remove animations" accessibility setting | App functions normally without animations |
| 6 | Run full golden path: add book → log session → save quote → rate book | All 4 flows complete without error. Data persists after app restart |
| 7 | Test offline → online flow end to end | Data created offline syncs within 5 seconds of reconnecting |
