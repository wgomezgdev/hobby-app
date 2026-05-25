# My flutter app

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
    - Dependency injection setup (get_it or Riverpod providers)
- **Authentication**
    - Email/password for MVP (optionally Google/Apple)
    - Token storage (secure storage) and session handling
- **Data layer (offline + sync)**
    - Repository pattern: UI → use cases → repositories → (local/remote)
    - Local DB: Drift (SQLite) recommended for structured data + migrations
    - Remote: REST/GraphQL client behind an interface
    - Sync strategy: last-write-wins for MVP; conflict handling later
- **Media storage (covers)**
    - Local caching for cover thumbnails
    - Remote storage option (Firebase Storage/S3) behind an abstraction
    - Background upload + retry
- **Search**
    - Local full-text search for quotes (SQLite FTS if using Drift/SQLite)
- **Quality gates**
    - Lints (very_good_analysis or flutter_lints)
    - Unit tests for progress calculations + ranking
    - Crash reporting (Sentry/Firebase Crashlytics)

### Out of scope (MVP)

- Barcode/ISBN scanning
- Import from Goodreads/Kindle
- Social sharing of quotes
- Recommendations

## User stories

- As a user, I want to add books with covers so my library is visually organized.
- As a user, I want to log reading progress so I can keep track over time.
- As a user, I want to save quotes so I can revisit important passages.
- As a user, I want to rate/rank books so I remember my favorites.

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

- **UserProfile**: id, email
- **Book**: id, title, author, status, coverUri, createdAt
- **ReadingSession**: id, bookId, startedAt, durationMinutes, progressFrom, progressTo, notes?
- **Quote**: id, bookId, text, pageNumber?, tags[], isFavorite, createdAt
- **Rating**: bookId, stars (1–5), review?, ratedAt

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

## Open questions

- Progress tracking model for v1: pages, percentage, minutes, or hybrid?
- Cover sources: manual upload only, or fetch by ISBN/online search?
- Ranking model: stars only, tiers (S/A/B), or both?

### Open technical questions

- Which state management standard: Riverpod vs BLoC?
- Backend choice for MVP: Firebase vs custom API?
- Offline-first depth: read-only offline vs full create/update offline?
- Image pipeline: compression settings, thumbnail generation strategy?

[Mockups (v1)](https://www.notion.so/Mockups-v1-c1727d9d020b4ebabd1a3f502b91690d?pvs=21)