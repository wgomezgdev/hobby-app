# Project Constitution
<!-- hobby-app — Reading Companion | established 2026-05-25 -->

This document defines the non-negotiable governing principles for all development decisions.
Every spec, plan, task, and line of code must align with these rules.

---

## 1. Architecture Principles

- **Feature-first structure**: code lives under `lib/features/<feature-name>/`. No feature imports another feature's internal layers — only shared `core/` modules.
- **Repository pattern**: UI → Riverpod providers → use cases → repositories → (local/remote). No direct Supabase or Drift calls from widgets.
- **Riverpod 2.x** is the sole state management solution. No BLoC, Provider, or GetX.
- **Google Sign-In via Supabase OAuth** is the sole auth method. No email/password, no register screen.
- **go_router** is the sole navigation solution. No `Navigator.push` calls outside the router config.
- **Bottom navigation bar** (Home / Library / Quotes / Profile) is the permanent shell. No drawer, no hamburger menu.
- **Offline-first**: every write operation goes to Drift (local) first. Remote sync is a background concern handled exclusively by `SyncService`.

## 2. Technology Stack (Locked)

| Concern | Choice | Rationale |
|---|---|---|
| Framework | Flutter (iOS + Android) | Single codebase, Material 3 |
| State management | Riverpod 2.x + code generation | Less boilerplate, composable, feature-first friendly |
| Local DB | Drift (SQLite) with migrations | Structured data, FTS5 support, type-safe queries |
| Remote backend | Supabase (Postgres + Auth + Storage) | Relational model, RLS security, no vendor lock-in |
| Authentication | Google Sign-In via Supabase OAuth | Zero-friction daily-use auth — one tap, no password |
| Navigation shell | go_router ShellRoute + bottom navigation bar (Home / Library / Quotes / Profile) | Daily users need direct access to top-level screens |
| Linting | very_good_analysis | Strictest Flutter lint ruleset |
| Crash reporting | Sentry | Performance tracing + error tracking |

No technology from this table may be swapped without a constitutional amendment (update this file, commit, get team sign-off).

## 3. Testing Requirements

- **Test-first**: write the test spec (in `contracts/test-specs.md`) before writing implementation code. No implementation without a failing test.
- **No mocking the database**: integration tests must use a real in-memory Drift database. Mock only external network calls (Supabase remote).
- **Traceability**: every test must reference an acceptance criterion (e.g., `AC-02.3`). No orphan tests.
- **Coverage gates** (enforced in CI):
  - Unit tests: all business logic in use cases and domain entities
  - Widget tests: all form validation flows and key state transitions
  - Integration tests: all offline → sync flows and auth flows

## 4. Code Quality Standards

- `flutter analyze` must pass with **zero warnings** on every commit (enforced via GitHub Actions).
- `very_good_analysis` lint rules must pass with zero suppressions (no `// ignore:` comments without a documented reason).
- No `print()` statements in production code — use structured logging.
- All public APIs (repository interfaces, use cases) must have a one-line doc comment explaining the *why*, not the *what*.
- Maximum function length: 40 lines. Extract if longer.

## 5. Performance Benchmarks

| Metric | Target |
|---|---|
| App cold start | < 2 s on mid-range Android |
| Library grid scroll (1,000 books) | 60 fps, no jank |
| Quote search (10,000 quotes, p95) | < 100 ms |
| Cover thumbnail load (cached) | < 50 ms |
| Session log flow (FAB → saved) | < 10 s total user time |

## 6. UX Consistency Principles

- All screens use **Material 3** components and `ThemeData(useMaterial3: true)`.
- Async states follow a single standard: `idle / loading / success / error` — no ad-hoc loading booleans.
- Empty states must have a clear CTA (e.g., "Add your first book").
- All destructive actions (delete book, remove cover) require a confirmation dialog.
- Haptic feedback on: favorite toggle, save quote, log session save.

## 7. Security & Privacy

- No secrets in source code. All keys via `--dart-define` env config.
- `google-services.json` and `GoogleService-Info.plist` are git-ignored permanently.
- User data (quotes, sessions) is private by default — Supabase Row Level Security (RLS) enforced on all tables.
- Tokens stored exclusively in `flutter_secure_storage` — never in `SharedPreferences` or plain files.

## 8. Spec-Driven Process Gate

Before any implementation begins, ALL of the following must exist and be reviewed:

- [ ] `specs/<feature>/spec.md` — requirements and acceptance criteria
- [ ] `specs/<feature>/plan.md` — phased implementation plan
- [ ] `specs/<feature>/data-model.md` — entity definitions and relationships
- [ ] `specs/<feature>/contracts/openapi.yaml` — API contract
- [ ] `specs/<feature>/contracts/test-specs.md` — test cases traced to ACs
- [ ] `specs/<feature>/tasks.md` — ordered task checklist

No PR will be merged if it lacks traceability back to a spec artifact.
