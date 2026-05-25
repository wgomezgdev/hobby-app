# My flutter app
<!-- spec version: 1.2.0 | last updated: 2026-05-25 -->

## Overview

A product concept for a **reading companion app** that helps users track reading, save quotes, manage book covers, and rank books.

### Technical overview (Flutter blueprint)

This spec assumes a **generic, scalable Flutter application** that can support multiple features/domains and evolve from MVP to production:

- **Platforms**: iOS + Android from a single codebase (Flutter). Web/desktop can be added later.
- **Architecture**: feature-first (modular) structure with clear domain boundaries.
- **State management**: BLoC/Cubit or Riverpod (pick one and standardize).
- **Navigation**: Navigator 2.0 / go_router for typed routes and deep links.
- **Backend**: API-first (REST/GraphQL). MVP can start with Firebase, but keep interfaces abstracted.
- **CI/CD**: automated formatting/linting, tests, build pipelines, environment configs.

## Problem statement

Readers often lack a simple, unified place to:

- Track reading progress across multiple books
- Capture and retrieve meaningful quotes/highlights
- Keep book metadata organized (including cover images)
- Rank books to remember favorites and build recommendations

### Product/tech translation

To address this in a scalable app, we need:

- Fast capture flows (progress + quote) with minimal typing
- A flexible content model (books, reading sessions, quotes, rankings)
- Offline-friendly storage (notes/quotes must work without internet)
- Media handling for covers (local cache + upload)

## Goals

- Make it effortless to **log reading progress** (pages/%, session minutes).
- Provide a delightful way to **save, tag, and search quotes**.
- Maintain a clean **library view with cover management**.
- Enable users to **rank and review** books for personal recall.

### Technical goals

- **Maintainability**: add future features (reading goals, social, recommendations) without rewiring the app.
- **Testability**: unit tests for ranking/progress rules + widget tests for capture flows.
- **Performance**: smooth lists/grids for large libraries; responsive quote search.
- **Observability**: analytics + crash reporting from day one.

## Non-goals (v1)

- Full social network / public profiles
- Complex recommendation engine (ML)
- Full e-reader functionality (rendering EPUB/PDF)

### Technical non-goals (v1)

- Multi-region sharding, complex microservices
- Real-time collaborative annotations
- Advanced DRM/content ingestion

## Target users

- Readers who want a lightweight tracker (casual and avid).
- People who like collecting quotes for writing, study, or reflection.

### Target devices / environments

- Mobile-first: common Android devices (mid-range) and iPhones.
- Intermittent connectivity is expected → design offline-first where possible.

## Assumptions

- Users open the app every day — the home screen must show their current reading context immediately.
- Users will often log quickly after reading; the flow must be < 10 seconds.
- Quotes are personal and must feel safe/private by default.
- The user authenticates with their Google account — no passwords to remember.
- App resume must restore the last context; users expect to return exactly where they left off.

### Technical assumptions

- Auth is required for sync across devices. Google Sign-In via Supabase OAuth is the sole auth method.
- Local persistence is necessary (Drift/SQLite) for offline access.
- Cover images can be stored locally and optionally backed up remotely.

## MVP scope

### Core features

1. **Home dashboard** ← entry point for every daily session
    - "Currently reading" books displayed as large cards with cover + progress bar
    - Per-book quick actions: "Log session" and "Add quote" — reachable in 1 tap
    - Reading streak counter (consecutive days with at least one session logged)
    - Global speed-dial FAB: "Log session" and "Save quote" from anywhere
    - App resume: restores last screen context on re-open
2. **Library (book list) + cover management**
    - Add a book (manual entry for MVP)
    - Book fields: title, author, total pages, cover image, status (Want to read / Reading / Finished)
    - Cover actions: upload photo, remove, replace
    - Library views: list and grid (covers)
3. **Reading tracking**
    - Track progress by pages (percentage derived automatically)
    - Log reading sessions: date/time, duration, pagesFrom → pagesTo, notes (optional)
    - Book status updates automatically when progress reaches 100%
    - Reading streak: derived from distinct session dates — no extra table
4. **Quote saving**
    - Save a quote linked to a book
    - Optional metadata: page number, tags, favorite
    - Search and filter quotes (by book, tag, favorites)
5. **Books ranking**
    - Personal rating (1–5 stars) and optional review
    - Sorting views: top rated, recently finished, recently added

### MVP technical scope

- **App shell**
    - Theming (light/dark), localization-ready
    - Bottom navigation bar: Home | Library | Quotes | Profile
    - go_router routing with guarded routes for auth
    - Dependency injection: Riverpod 2.x with code generation (`@riverpod`)
- **State management**: Riverpod 2.x (resolved — see Resolved decisions)
- **Authentication**: Supabase Auth — Google Sign-In (OAuth) only
    - One tap sign-in, no password, no separate registration screen
    - First-time Google sign-in = automatic account creation
    - Token storage: `flutter_secure_storage`
    - Session refresh handled by Supabase client automatically
    - Packages: `supabase_flutter`, `google_sign_in`
- **Data layer (offline + sync)**
    - Repository pattern: UI → Riverpod providers → use cases → repositories → (local/remote)
    - Local DB: Drift (SQLite) with migrations
    - Remote: Supabase Dart client behind repository interface
    - Sync: triggers on connectivity restore + app foreground; last-write-wins on `updatedAt`; failed ops retried with exponential back-off (max 5 attempts)
- **Media storage (covers)**
    - Compress to max 800 KB JPEG; 300×300 px thumbnail generated locally
    - Remote: Supabase Storage behind abstraction
    - Background upload + retry; thumbnails cached locally with extended TTL
- **Search**
    - Local full-text search for quotes using SQLite FTS5 via Drift
- **Quality gates**
    - Lints: `very_good_analysis`
    - Unit tests for progress calculations + ranking rules
    - Widget tests for capture flows (add book, add quote, log session)
    - Crash reporting: Sentry

### Out of scope (MVP)

- Barcode/ISBN scanning
- Import from Goodreads/Kindle
- Social sharing of quotes
- Recommendations

## User stories

### US-01 — Add books with covers
As a user, I want to add books with covers so my library is visually organized.

**Acceptance criteria**
- **AC-01.1** Given I am on the Library screen, when I tap the FAB, then the Add Book form opens in under 300 ms.
- **AC-01.2** Given the Add Book form is open, when I leave title or author empty and tap Save, then inline validation errors appear and the book is not saved.
- **AC-01.3** Given I fill in title, author, and total pages, when I tap Save, then the book appears in the library with status "Want to read".
- **AC-01.4** Given I am adding a book, when I tap "Add Cover" and pick an image, then a 300×300 px thumbnail is shown in the form preview.
- **AC-01.5** Given I save a book with a cover, when the library grid renders, then the cover thumbnail is displayed without jank on a mid-range Android device.
- **AC-01.6** Given I have no internet connection, when I add a book, then it is saved locally and synced automatically when connectivity is restored.

---

### US-02 — Log reading progress
As a user, I want to log reading progress so I can keep track over time.

**Acceptance criteria**
- **AC-02.1** Given I am on the Book Detail screen, when I tap "Log Session", then the session form appears as a modal bottom sheet.
- **AC-02.2** Given the session form is open, when I enter pages read (pagesFrom and pagesTo) and tap Save, then the session is recorded and the progress bar on Book Detail updates immediately.
- **AC-02.3** Given pagesTo equals totalPages, when I save the session, then the book status automatically changes to "Finished".
- **AC-02.4** Given I enter pagesTo greater than totalPages, when I tap Save, then a validation error appears and the session is not saved.
- **AC-02.5** Given I have no internet connection, when I log a session, then it is saved locally and synced when connectivity is restored.
- **AC-02.6** Given I open Book Detail, then I can see a chronological list of all past sessions with date, duration, and pages covered.

---

### US-03 — Save quotes
As a user, I want to save quotes so I can revisit important passages.

**Acceptance criteria**
- **AC-03.1** Given I am on the Book Detail screen, when I tap "Add Quote", then the quote capture form appears.
- **AC-03.2** Given the form is open, when I leave the quote text empty and tap Save, then a validation error appears and the quote is not saved.
- **AC-03.3** Given I enter quote text and tap Save, then the quote appears in the Quotes tab linked to the book.
- **AC-03.4** Given I am on the Quotes screen, when I type a keyword in the search field, then only quotes containing that keyword are shown (local FTS).
- **AC-03.5** Given I tap the favorite icon on a quote, then the icon toggles and the quote appears when the "Favorites" filter is active.
- **AC-03.6** Given I filter by a tag, then only quotes with that tag are shown.
- **AC-03.7** Given I have no internet connection, when I save a quote, then it is saved locally and synced when connectivity is restored.

---

### US-04 — Rate and rank books
As a user, I want to rate/rank books so I remember my favorites.

**Acceptance criteria**
- **AC-04.1** Given I am on the Book Detail screen, when I tap the star rating widget, then I can select 1–5 stars.
- **AC-04.2** Given I select a rating, when I tap Save, then the rating is displayed on Book Detail and in the Library card.
- **AC-04.3** Given I add an optional review text alongside a rating, when I save, then the review text appears below the stars on Book Detail.
- **AC-04.4** Given I am on the Library screen, when I sort by "Top rated", then books are ordered by star rating descending; unrated books appear last.
- **AC-04.5** Given I already rated a book, when I open the rating widget again, then the previous rating is pre-selected and I can update it.

---

### US-05 — Sign in with Google
As a user, I want to sign in with my Google account so I don't have to remember a password.

**Acceptance criteria**
- **AC-05.1** Given I open the app for the first time, when I see the sign-in screen, then there is exactly one button: "Continue with Google".
- **AC-05.2** Given I tap "Continue with Google", when I complete the Google account picker, then I am signed in and taken to the Home screen.
- **AC-05.3** Given it is my first time signing in, when the OAuth flow completes, then my account is created automatically with no extra steps.
- **AC-05.4** Given I am signed in, when I close and reopen the app, then I am taken directly to the Home screen without signing in again.
- **AC-05.5** Given I tap "Sign out" in Profile, when confirmed, then my session is cleared and I am taken to the sign-in screen.

---

### US-06 — Home dashboard for daily use
As a user, I want a home screen that shows my current books and lets me log a session or save a quote in one tap.

**Acceptance criteria**
- **AC-06.1** Given I open the app, when the Home screen loads, then I see all books with status "reading" as large cards with cover, title, and progress bar.
- **AC-06.2** Given I am on the Home screen, when I tap "Log session" on a book card, then the session bottom sheet opens pre-filled with that book — without navigating away.
- **AC-06.3** Given I am on the Home screen, when I tap "Add quote" on a book card, then the quote bottom sheet opens pre-filled with that book.
- **AC-06.4** Given I tap the speed-dial FAB, when it expands, then two options appear: "Log session" and "Save quote", each with a book picker.
- **AC-06.5** Given I have no books with status "reading", when I open the Home screen, then an empty state with CTA "Start reading a book" is shown.
- **AC-06.6** Given I minimize the app and reopen it, when the Home screen appears, then it restores to the same scroll position and context I left.

---

### US-07 — Reading streak
As a user, I want to see my reading streak so I stay motivated to read every day.

**Acceptance criteria**
- **AC-07.1** Given I log at least one session today, when I view the Home screen, then the streak counter increments by 1.
- **AC-07.2** Given I logged a session yesterday and today, when I view the Home screen, then the streak shows at least 2 days.
- **AC-07.3** Given I missed a day (no session logged), when I view the Home screen, then the streak resets to 0 (or 1 if I logged today).
- **AC-07.4** Given my streak is 0, when I view the Home screen, then the streak counter is not shown (hidden to avoid discouragement).

---

### Developer stories (scalability)

- As a developer, I want features modularized so I can add reading goals, challenges, and social later.
- As a developer, I want environment configs so I can deploy dev/staging/prod.
- As a developer, I want observability so I can debug issues from real usage.

## Functional requirements

### Library

- The user can create, update, archive/delete books.
- The user can upload/replace/remove a cover image for a book.

### Reading tracking

- The user can create reading sessions for a book.
- The system can compute current progress and status from sessions.

### Quotes

- The user can create quotes linked to a book.
- The user can tag, favorite, and search quotes.

### Ranking

- The user can rate a book and optionally add a review.
- The user can sort/filter books by rating and status.

### Non-functional requirements

- Offline behavior: user can add books, log sessions, and save quotes without internet.
- Performance: library supports at least 1,000 books and 10,000 quotes without jank.
- Accessibility: basic a11y (labels, contrast, large text) supported.

## Data model (conceptual)

- **UserProfile**: id, email, displayName
- **Book**: id, userId, title, author, totalPages, status, coverUri, createdAt, updatedAt
- **ReadingSession**: id, bookId, startedAt, durationMinutes, pagesFrom, pagesTo, notes?, createdAt, updatedAt
- **Quote**: id, bookId, text, pageNumber?, tags[], isFavorite, createdAt, updatedAt
- **Rating**: id, bookId, stars (1–5), review?, ratedAt, updatedAt

> `updatedAt` is required on all entities for last-write-wins sync conflict resolution.
> `progressPercentage` is always derived: `pagesTo / book.totalPages * 100` — never stored.

### Storage mapping

- Local tables mirror the core entities.
- Remote API uses DTOs; mapping layer converts DTO ↔ domain.

## UX / screens (high level)

### Navigation structure
Bottom navigation bar with 4 tabs — persistent across all screens:
```
[ Home ] [ Library ] [ Quotes ] [ Profile ]
```

### Screens

- **Sign in**: single "Continue with Google" button — no email/password fields, no register screen
- **Home (default tab)**: currently-reading books as large cards (cover + title + progress bar + streak counter); per-card buttons: "Log session" and "Add quote"; speed-dial FAB with same two actions globally
- **Library**: grid/list of all books with covers, filter by status (want to read / reading / finished), sort by top rated / recently added / recently finished
- **Book detail**: `SliverAppBar` with cover hero; tabs: Progress (bar + session history) | Quotes | Ranking
- **Add/edit book**: title, author, total pages, cover upload
- **Log session** (bottom sheet): pagesFrom → pagesTo, duration, optional notes — accessible from Home cards and Book Detail
- **Add quote** (bottom sheet): quote text, optional page number, tags, favorite — accessible from Home FAB, Book Detail
- **Quotes (global tab)**: all quotes across all books, search bar (FTS), filter by tag / favorites
- **Profile**: Google account info, light/dark toggle, sign out

### UI/UX stack: Material Design (Flutter)

This app’s UI/UX will follow the **Material Design** system and Flutter’s Material component library.

- **Design system (Material 3)**
    - Use `MaterialApp` + `ThemeData(useMaterial3: true)`
    - Color system: `ColorScheme.fromSeed(...)` as the base, with light/dark schemes
    - Typography: `TextTheme` tokens + consistent text styles across features
    - Shapes/elevation: standardized corner radii and elevation levels per component
- **Core Material components (examples)**
    - Library grid/list: `Card`, `GridView`/`SliverGrid`, `ListTile`
    - Book details: `SliverAppBar`, `TabBar`/`TabBarView` (Progress / Quotes / Ranking)
    - Quote capture: `TextField`, `ModalBottomSheet`/`showModalBottomSheet`
    - Rating: `Slider` or custom star widget, `Chip` for tags, `IconButton` for favorites
    - Actions: `FloatingActionButton` for “Add book / Add quote”
- **Layout & responsiveness**
    - Use Material spacing guidelines (8dp grid)
    - Responsive rules: phone-first; tablet layouts can use two-pane master/detail later
    - Use `LayoutBuilder` and breakpoints for grid columns (e.g., 2–6 columns)
- **Motion & interaction**
    - Use Material motion defaults: `Hero` transitions for book covers, subtle `AnimatedSwitcher`
    - Provide haptics for key actions (favorite, save quote) where supported
- **Accessibility (Material-aligned)**
    - Semantics labels for covers/buttons; large text support; minimum touch target sizes
    - Contrast checks for light/dark themes
- **Screen composition (architecture)**
    - Each screen has: `Page` widget + `State` (Bloc/Notifier) + `ViewModel` state
    - Use `SliverGrid` for library covers and `SliverList` for sessions/quotes.
- **Loading/error patterns**
    - Standardized async state: `idle/loading/success/error`
    - Empty states with clear CTAs (e.g., “Add your first book”)

## MVP deployment

All platform choices are resolved. See the Resolved decisions section for rationale.

### Mobile app distribution

| Track | Platform | Notes |
|---|---|---|
| Internal testing | Android — Google Play Console Internal Testing | Requires Play Developer account |
| Internal testing | iOS — TestFlight via App Store Connect | Requires Apple Developer Program |
| Public release | Google Play Store + Apple App Store | After internal testing passes |

### Platform stack (resolved)

| Concern | Choice |
|---|---|
| Backend | Supabase (Postgres + Auth + Storage) — free tier |
| Authentication | Supabase Auth with Google OAuth |
| Local database | Drift (SQLite) |
| Remote storage | Supabase Storage (cover images) |
| Crash reporting | Sentry (free tier) |
| CI/CD | GitHub Actions — `flutter analyze` + `flutter test` + build APK/IPA |
| Environments | dev / staging / prod via `--dart-define` and separate Supabase projects |

## Success metrics

- Activation: % users who add their first book + log first session
- Engagement: sessions logged per week, quotes saved per week
- Retention: 4-week retention of active readers

### Technical metrics

- Crash-free sessions
- App startup time
- Quote search latency (p95)
- Sync success rate

## Resolved decisions

All open questions have been resolved. These are the authoritative choices for v1.

### Product decisions

| Question | Decision | Rationale |
|---|---|---|
| Progress tracking model | **Pages as primary unit** | Most intuitive for readers; percentage is derived automatically (`pagesRead / totalPages`). Time tracking deferred to V2. `totalPages` is a required field on Book. |
| Cover sources | **Manual upload only** | ISBN scanning is explicitly out of scope for MVP. |
| Ranking model | **Stars 1–5 only** | Tier system (S/A/B) deferred to V2. Stars are universally understood and simpler to implement. |

### Technical decisions

| Question | Decision | Rationale |
|---|---|---|
| State management | **Riverpod 2.x with code generation** | Less boilerplate than BLoC, better suited for feature-first modular structure, composable providers map naturally to the repository pattern. |
| Backend | **Supabase** (Postgres + Auth + Storage) | Relational data model fits the domain better than Firestore; no vendor lock-in risk; strong Row Level Security for privacy; Supabase Auth pairs naturally. |
| Authentication | **Google Sign-In via Supabase OAuth** | Daily-use app must have zero-friction auth. One tap, no password, no registration screen. First sign-in creates account automatically. |
| Navigation | **Bottom navigation bar** (Home / Library / Quotes / Profile) | Daily users need direct access to their most-used screens without drilling through hierarchies. |
| Offline-first depth | **Full create/update offline** | Users log sessions immediately after reading (< 10 s flow requirement). Books, sessions, and quotes must be creatable offline. Sync triggers on connectivity restore and app foreground resume. |
| Image pipeline | **Compress to max 800 KB JPEG; generate 300×300 px thumbnail locally before upload** | Thumbnails cached locally with extended TTL for smooth grid scrolling. Originals uploaded in background with retry. |
| Reading streak | **Derived from `reading_sessions` — no separate table** | Streak = count of consecutive calendar days with ≥ 1 session. Computed on-demand from existing data. |

### Sync strategy (expanded)

- **Trigger**: on `onConnectivityRestored` + `AppLifecycleState.resumed`
- **Conflict resolution**: server timestamp wins (last-write-wins on `updatedAt` column)
- **Failure**: failed sync operations queued locally and retried with exponential back-off (max 5 attempts)

[Mockups (v1)](https://www.notion.so/Mockups-v1-c1727d9d020b4ebabd1a3f502b91690d?pvs=21)