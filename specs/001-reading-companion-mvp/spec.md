# My flutter app
<!-- spec version: 1.1.0 | last updated: 2026-05-25 -->

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

- Users will often log quickly after reading; the flow must be < 10 seconds.
- Quotes are personal and must feel safe/private by default.

### Technical assumptions

- Auth is required for sync across devices.
- Local persistence is necessary (SQLite/Drift or Hive) for offline access.
- Cover images can be stored locally and optionally backed up remotely.

## MVP scope

### Core features (Feature 1 blueprint)

1. **Library (book list) + cover management**
    - Add a book (manual entry for MVP)
    - Book fields: title, author, cover image, status (Want to read / Reading / Finished)
    - Cover actions: upload photo, crop (optional), remove, replace
    - Library views: list and grid (covers)
2. **Reading tracking**
    - Track progress by pages read OR percentage OR time (pick one default; allow others later)
    - Log reading sessions: date/time, duration, progress delta, notes (optional)
    - Book status updates based on progress (e.g., Finished)
3. **Quote saving**
    - Save a quote linked to a book
    - Optional metadata: page number/location, tags, note, favorite
    - Search and filter quotes (by book, tag, favorites)
4. **Books ranking**
    - Personal rating (e.g., 1–5 stars) and optional review
    - Sorting views: top rated, recently finished, recently added

### MVP technical scope

- **App shell**
    - Theming (light/dark), localization-ready
    - go_router routing with guarded routes for auth
    - Dependency injection: Riverpod 2.x with code generation (`@riverpod`)
- **State management**: Riverpod 2.x (resolved — see Resolved decisions)
- **Authentication**: Supabase Auth — email/password for MVP; Google/Apple deferred
    - Token storage: `flutter_secure_storage`
    - Session refresh handled by Supabase client automatically
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

- Library: grid/list of books with covers, filters by status
- Book detail: progress, sessions, quotes, rating
- Add/edit book: title/author + cover upload
- Add quote: quote text + tags + page
- Stats (optional MVP+): books finished, reading streaks

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

## MVP deployment & free-tier platform choices

Goal: ship an MVP using **free-to-use (or generous free-tier) services**, while keeping the architecture flexible to migrate later.

### Mobile app distribution (where to deploy)

- **Internal testing**
    - Android: Google Play Console *Internal testing* (low cost; requires a Play Developer account)
    - iOS: TestFlight via App Store Connect (requires Apple Developer Program)
- **Public release**
    - Android: Google Play Store
    - iOS: Apple App Store

> Note: app store accounts are paid, but they’re typically the only unavoidable cost to distribute native apps broadly.
> 

### Backend hosting (free options)

Pick one based on how “backend-heavy” you want the MVP to be:

1) **Firebase-first (fastest MVP, minimal ops)**

- Hosting: Firebase Hosting (if you add a small web landing page later)
- Server logic: Cloud Functions (only if needed)
- Pros: quickest setup, good Flutter support, scales well for early stage
- Cons: lock-in risk; costs can grow later depending on usage

2) **Supabase-first (Postgres + Auth, still MVP-friendly)**

- Hosting: Supabase-managed Postgres + Edge Functions
- Pros: SQL/Postgres, easier migration paths; strong DX
- Cons: some features require careful RLS/security configuration

3) **No custom backend (offline-first MVP)**

- Store everything locally first (Drift/SQLite) and add sync later.
- Pros: truly cheapest; ship fast
- Cons: no cross-device sync until you add backend

### Database platform (free-tier suggestions)

Recommended MVP approach:

- **Primary data** (books, sessions, quotes, ratings):
    - Option A: **Firestore** (Firebase) for fastest schema-less iteration
    - Option B: **Supabase Postgres** for relational structure and SQL
- **Local database** (always, for offline):
    - **Drift (SQLite)** with migrations

Rule of thumb:

- Choose **Firestore** if you want speed and simple data sync.
- Choose **Supabase Postgres** if you want relational queries and a more traditional backend.

### Authentication platform (free-tier suggestions)

- **Firebase Authentication**
    - Email/password for MVP; optionally Google/Apple later
    - Very fast to implement in Flutter
- **Supabase Auth**
    - Email/password + OAuth providers
    - Integrates naturally if you choose Supabase Postgres

MVP recommendation:

- If you choose Firebase DB → use **Firebase Auth**.
- If you choose Supabase DB → use **Supabase Auth**.

### File storage (covers)

- **Firebase Storage** (pairs well with Firebase)
- **Supabase Storage** (pairs well with Supabase)
- Store:
    - Original cover image + generated thumbnail(s)
    - Keep local cache for fast scrolling in grid views

### Environments (still MVP-friendly)

- **dev / staging / prod** via separate Firebase projects or Supabase projects
- Use compile-time env configuration in Flutter (e.g., `--dart-define`)

### CI/CD (free-tier friendly)

- **GitHub Actions**
    - Run `flutter test`, `flutter analyze`, build APK/IPA (where possible)
    - Optional: upload artifacts to internal testers

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
| Offline-first depth | **Full create/update offline** | Users log sessions immediately after reading (< 10 s flow requirement). Books, sessions, and quotes must be creatable offline. Sync triggers on connectivity restore and app foreground resume. |
| Image pipeline | **Compress to max 800 KB JPEG; generate 300×300 px thumbnail locally before upload** | Thumbnails cached locally with extended TTL for smooth grid scrolling. Originals uploaded in background with retry. |

### Sync strategy (expanded)

- **Trigger**: on `onConnectivityRestored` + `AppLifecycleState.resumed`
- **Conflict resolution**: server timestamp wins (last-write-wins on `updatedAt` column)
- **Failure**: failed sync operations queued locally and retried with exponential back-off (max 5 attempts)

[Mockups (v1)](https://www.notion.so/Mockups-v1-c1727d9d020b4ebabd1a3f502b91690d?pvs=21)

[Mockups (v1)](https://www.notion.so/Mockups-v1-c1727d9d020b4ebabd1a3f502b91690d?pvs=21)