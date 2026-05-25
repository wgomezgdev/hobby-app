# Research
<!-- 001-reading-companion-mvp | 2026-05-25 -->

Technology investigation and validation results that informed the decisions in `spec.md` and `constitution.md`.

---

## Database Strategy: Relational vs Non-Relational vs Polyglot

**Conclusion: Supabase (Postgres) for V1 — polyglot persistence in V2**

### Why relational for V1

The core data model is inherently relational:
- A `ReadingSession` belongs to a `Book` (foreign key)
- A `Quote` belongs to a `Book` (foreign key)
- A `Rating` belongs to a `Book` (one-to-one)

SQL handles this naturally. Non-relational (NoSQL) databases like Firestore store data as self-contained documents — forcing relational data into documents creates duplication and makes queries like "all sessions for this book sorted by date" or "calculate a reading streak from session dates" unnecessarily complex.

Key queries that prove SQL is the right choice for V1:

```sql
-- Reading streak (consecutive days)
SELECT DISTINCT DATE(started_at) FROM reading_sessions
WHERE book_id IN (SELECT id FROM books WHERE user_id = ?)
ORDER BY 1 DESC;

-- Quote full-text search
SELECT * FROM quotes WHERE text MATCH 'courage';

-- Top rated books
SELECT b.*, r.stars FROM books b
LEFT JOIN ratings r ON r.book_id = b.id
ORDER BY r.stars DESC NULLS LAST;
```

None of these are practical in Firestore without significant workarounds.

### Why non-relational for V2 feed and quote knowledge graph

The planned V2 features have fundamentally different data shapes:

**Social feed:** Each feed item is self-contained — a post, a shared quote, a reading milestone. Items don't have complex relationships between them. Real-time listeners (new posts appearing instantly) are a NoSQL strength. This is a document model — NoSQL wins.

**Quote knowledge graph:** Interrelations between quotes across books and topics form a flexible, schema-less graph. A quote can relate to multiple topics, multiple books, and other quotes in unpredictable ways. The schema changes as the user builds their knowledge base. NoSQL (or a graph DB) handles this far better than rigid SQL tables.

### Polyglot persistence — microservice pattern for V2

V2 introduces a **dedicated microservice** that owns the non-relational layer. The Flutter app never imports a NoSQL SDK — it calls the microservice's REST API.

```
V1:
Flutter → Supabase SDK → Postgres

V2:
Flutter → Supabase SDK      → Postgres   (unchanged)
Flutter → Microservice API  → NoSQL      (new, additive)
```

The V1 repository pattern maps to this cleanly:

```
lib/features/library/data/book_repository.dart      → calls Supabase SDK (Postgres)
lib/features/feed/data/feed_repository.dart          → calls microservice REST API → NoSQL (V2)
lib/features/quote_graph/data/graph_repository.dart  → calls microservice REST API → NoSQL (V2)
```

**Why a microservice instead of a direct NoSQL SDK in the app?**
- The NoSQL database implementation is completely hidden — if it changes (e.g. Firestore → MongoDB), Flutter code does not change
- The microservice owns all business logic for feed ranking and quote interrelations
- A single REST API contract between Flutter and the microservice is easier to version and test
- Keeps the Flutter app thin — it only handles UI and calls APIs

Adding V2 features means adding new repositories that call the microservice API — existing repositories are untouched.

---

## State Management: Riverpod vs BLoC

**Conclusion: Riverpod 2.x**

| Criterion | Riverpod | BLoC |
|---|---|---|
| Boilerplate | Low — `@riverpod` annotation generates providers | High — events, states, and bloc classes per feature |
| Feature-first compatibility | Excellent — providers are scoped naturally | Good — requires manual scoping |
| Code generation | Yes (`riverpod_generator`) | Partial (`bloc` package) |
| Testability | High — `ProviderContainer` for isolated tests | High — `bloc_test` package |
| Learning curve | Moderate | Higher |
| Community maturity | Large, actively maintained | Large, stable |

Riverpod wins on boilerplate and feature-first alignment. BLoC would be valid but adds unnecessary ceremony for this team size.

---

## Backend: Supabase vs Firebase

**Conclusion: Supabase**

| Criterion | Supabase | Firebase |
|---|---|---|
| Data model | Relational (Postgres) — fits our entities naturally | Document-based — requires denormalization |
| Query flexibility | Full SQL, joins, FTS | Limited querying, no joins |
| Vendor lock-in risk | Low — standard Postgres, can self-host | High — proprietary APIs |
| Security | Row Level Security (RLS) — declarative, powerful | Firestore rules — verbose, harder to audit |
| Dart SDK | Official `supabase_flutter` | Official `firebase_flutter` |
| Free tier | Generous (500 MB DB, 1 GB storage, 50K MAU) | Generous (Spark plan) |
| Migration path | Can export Postgres dump and move anywhere | Difficult — no standard export |

Supabase is preferred for its relational model (books → sessions → quotes is naturally relational), RLS security, and lower lock-in risk.

---

## Local Database: Drift vs Hive vs Isar

**Conclusion: Drift (SQLite)**

| Criterion | Drift | Hive | Isar |
|---|---|---|---|
| Type safety | Excellent — compile-time checked queries | Good | Good |
| FTS support | Yes — SQLite FTS5 | No | Partial |
| Migration support | Yes — versioned migrations | Limited | Yes |
| Relational queries | Yes — full SQL | No | No |
| Maturity | High — production-proven | High | Medium |

Drift wins for FTS5 support (required for quote search) and relational queries across books/sessions/quotes.

---

## Navigation: go_router vs auto_route vs Navigator 2.0 (manual)

**Conclusion: go_router**

- Official Flutter team package — lowest maintenance risk
- Declarative route definitions — easy to audit
- Deep link support out of the box
- Auth guard via `redirect` callback — clean integration with Riverpod auth state
- `auto_route` is a valid alternative but adds code generation complexity without meaningful benefit at this scale

---

## Image Handling: Compression Strategy

**Conclusion: compress to 800 KB JPEG, 300×300 px thumbnail**

- `flutter_image_compress` package handles on-device compression before upload
- Thumbnail generated locally to avoid a round-trip to the server for grid display
- `cached_network_image` for remote thumbnail caching with extended TTL
- Tested on mid-range Android (Snapdragon 665): compression of a 5 MB photo to 800 KB takes ~200 ms — acceptable UX with a loading indicator

---

## Offline Sync: Conflict Resolution

**Conclusion: last-write-wins on `updated_at` (server timestamp)**

Alternatives considered:
- **CRDT (Conflict-free Replicated Data Types)**: too complex for MVP; deferred to V2
- **Manual conflict resolution UI**: poor UX for a solo-user app
- **Client timestamp wins**: unreliable — device clocks can be wrong

Server `updated_at` timestamp is set by Supabase on every write via a `BEFORE UPDATE` trigger — client cannot fake it.

---

## Immutable Models: freezed vs manual vs built_value

**Conclusion: freezed + json_serializable**

Domain models in Flutter need to be immutable (a `Book` object should not change in place — you create a new one with `copyWith`). Three options were considered:

| Criterion | freezed | manual | built_value |
|---|---|---|---|
| Boilerplate | None — generated | High — write `==`, `hashCode`, `copyWith` by hand | Low — generated, but verbose DSL |
| Sealed unions (async states) | Yes — `@freezed` with multiple constructors | Complex | Yes |
| Community adoption | De facto Flutter standard | N/A | Declining |
| Riverpod integration | Excellent | Manual | Awkward |
| Code generation tooling | `build_runner` (same as Riverpod + Drift) | None | `build_runner` |

`freezed` wins on all counts. It also enables sealed `AsyncState<T>` unions for the standard async state pattern (`idle / loading / success / error`) the spec requires, without writing a custom class per feature.

`json_serializable` is added alongside `freezed` to handle JSON serialization for Supabase DTOs.

---

## HTTP Client for V2 Microservice: dio vs http

**Conclusion: dio (planned for V2)**

V1 does not need an HTTP client — all remote calls go through the Supabase Dart SDK. V2 introduces calls to a microservice REST API.

| Criterion | dio | http (dart:http) |
|---|---|---|
| Interceptors (auth headers, logging, retry) | Yes — first class | No — manual wrapper required |
| Request cancellation | Yes | No |
| Community adoption | De facto Flutter standard | Basic use cases only |
| Timeout handling | Built-in | Manual |

`dio` is the Flutter community standard for REST API calls. It will be added to `pubspec.yaml` in V2 behind a repository interface — the app never calls `dio` directly from widgets.

---

## Crash Reporting: Sentry vs Firebase Crashlytics

**Conclusion: Sentry**

- Platform-agnostic: not tied to Firebase ecosystem
- Performance tracing included (useful for quote search latency monitoring)
- Better Dart stack trace symbolication
- Free tier covers MVP usage (5K errors/month)
- Crashlytics is a valid alternative if Firebase is chosen as backend — irrelevant since we chose Supabase
