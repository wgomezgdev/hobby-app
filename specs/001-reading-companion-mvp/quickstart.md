# Quickstart
<!-- 001-reading-companion-mvp | 2026-05-25 -->

Key validation scenarios and setup instructions for developers joining this project.

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Flutter SDK | >= 3.x stable | https://flutter.dev/docs/get-started/install |
| Dart SDK | >= 3.x (bundled with Flutter) | — |
| Android Studio or Xcode | Latest stable | For device emulators |
| Supabase CLI | Latest | `npm install -g supabase` |
| Git | >= 2.x | — |

---

## Environment Setup

**1. Clone the repository**
```bash
git clone https://github.com/wgomezgdev/hobby-app.git
cd hobby-app
```

**2. Create your environment config file**

Create `.env.dev` at project root (git-ignored):
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SENTRY_DSN=your-sentry-dsn
```

**3. Install Flutter dependencies**
```bash
flutter pub get
```

**4. Run code generation (Riverpod + Drift)**
```bash
dart run build_runner build --delete-conflicting-outputs
```

**5. Run the app in dev mode**
```bash
flutter run --dart-define-from-file=.env.dev
```

---

## Supabase Local Setup (for integration tests)

```bash
supabase init
supabase start
# Apply migrations
supabase db push
```

---

## Running Tests

```bash
# All tests
flutter test

# Unit tests only
flutter test test/unit/

# Widget tests only
flutter test test/widget/

# Integration tests only
flutter test test/integration/

# With coverage
flutter test --coverage
```

---

## Key Validation Scenarios

These are the critical paths to verify after any significant change:

### Scenario 1 — Add a book offline, sync when online
1. Put device in airplane mode
2. Open app → tap FAB → fill book form → save
3. Verify book appears in library immediately
4. Restore connectivity
5. Verify book appears in Supabase dashboard within 5 seconds

**Expected:** Book created locally, synced automatically. No error shown to user.

### Scenario 2 — Log a reading session to 100% completion
1. Open a book with 200 total pages
2. Tap "Log Session" → set pagesFrom=0, pagesTo=200 → save
3. Verify progress bar shows 100%
4. Verify book status changes to "Finished" automatically

**Expected:** Status update is immediate, no manual action required.

### Scenario 3 — Save and search a quote
1. Open any book → tap "Add Quote"
2. Enter: text="The only way to do great work", tags=["motivation"], isFavorite=true → save
3. Go to Quotes tab → search "great work"
4. Verify the quote appears

**Expected:** FTS search returns result in < 100 ms.

### Scenario 4 — Rate a book and sort by top rated
1. Rate book A with 5 stars
2. Rate book B with 3 stars
3. Go to Library → select "Top rated" sort
4. Verify book A appears before book B

**Expected:** Unrated books appear last in the sorted list.

### Scenario 5 — Auth guard on cold start
1. Clear app data (or sign out)
2. Cold start the app
3. Verify Login screen appears (not Library)
4. Sign in with valid credentials
5. Verify Library screen appears

**Expected:** No Library content visible before authentication.

---

## CI/CD

GitHub Actions runs on every push to any branch:

```
flutter analyze     → must pass with zero warnings
flutter test        → all tests must pass
flutter build apk   → must build without errors (main branch only)
```

Check `.github/workflows/` for pipeline configuration.

---

## Project Structure Reference

```
lib/
  core/
    theme/          ← Material 3 theme config
    router/         ← go_router setup and auth guard
    di/             ← Riverpod providers bootstrap
  features/
    library/        ← Book CRUD, cover management
    reading_tracking/ ← Sessions, progress
    quotes/         ← Quote capture, search, favorites
    ranking/        ← Star ratings, reviews
  main.dart
specs/
  001-reading-companion-mvp/
    spec.md         ← Requirements and acceptance criteria
    plan.md         ← Implementation phases
    tasks.md        ← Task checklist
    research.md     ← Technology decisions
    data-model.md   ← Entity definitions and schema
    quickstart.md   ← This file
    contracts/
      openapi.yaml  ← API contract
      test-specs.md ← Test cases traced to ACs
.specify/
  memory/
    constitution.md ← Governing principles
```
